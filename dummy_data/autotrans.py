import os
import pandas as pd
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
import random
import kagglehub

# Step 1: Load the dataset correctly
path = kagglehub.dataset_download("shivamb/bank-customer-segmentation")
print("Path to dataset files:", path)

# Step 2: Read the CSV
CSV_FILE_PATH = os.path.join(path, 'bank_transactions.csv')
df = pd.read_csv(CSV_FILE_PATH)

# Step 3: Normalize column names to lowercase and remove extra spaces
df.columns = [col.lower().strip() for col in df.columns]

# Step 4: Print the column names to inspect them
print("Columns in the CSV file:")
print(df.columns)

# Step 5: Connect to MongoDB
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@Hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'
client = MongoClient(MONGODB_URI)
db = client.get_database()
transactions_collection = db.transactions
users_collection = db.users

# Step 6: Get all existing user_ids from the users collection
existing_users = list(users_collection.find({}, {'_id': 1}))  # Retrieve only the '_id' field (user_id)
user_ids = [user['_id'] for user in existing_users]

# Define the valid user_ids to be used in case of random assignment
valid_user_ids = ['605c72ef1b3f4e084f8b4568', '605c72ef1b3f4e084f8b4569', '605c72ef1b3f4e084f8b4567']

# Step 7: Define the required columns for the CSV file
REQUIRED_COLUMNS = {
    "transactionid": "transactionid",
    "customerid": "customerid",
    "custaccountbalance": "custaccountbalance",
    "transactiondate": "transactiondate",
    "transactiontime": "transactiontime",
    "transactionamount": "transactionamount (inr)"  # Update this line to match the actual column name
}

# Step 8: Check if all required columns exist in the CSV
for required_col in REQUIRED_COLUMNS.values():
    if required_col not in df.columns:
        raise Exception(f"❌ Required column '{required_col}' not found in the CSV.")

# Step 9: Insert transactions and handle user_id mapping
records = []

for index, row in df.iterrows():
    try:
        # Extract and map columns from CSV
        transaction_id = row[REQUIRED_COLUMNS['transactionid']]
        customer_id = row[REQUIRED_COLUMNS['customerid']]  # This is CustomerID from CSV
        balance = float(row[REQUIRED_COLUMNS['custaccountbalance']])
        date = str(row[REQUIRED_COLUMNS['transactiondate']])
        time = str(row[REQUIRED_COLUMNS['transactiontime']])
        amount = float(row[REQUIRED_COLUMNS['transactionamount']])

        # Fix time format if needed (your time seems to be in 'dd/mm/yy hhmmss' format)
        try:
            # Adjusted the time format to match the expected 'dd/mm/yy hhmmss'
            transaction_datetime = datetime.strptime(f"{date} {time.zfill(6)}", "%d/%m/%y %H%M%S")
        except ValueError:
            print(f"⚠️ Skipping row {index} due to error in time format.")
            continue

        # Randomly assign a user_id if customer_id doesn't match the expected values
        if customer_id not in valid_user_ids:
            # Randomly assign a valid user_id
            user_id = random.choice(valid_user_ids)
        else:
            user_id = customer_id  # Use the CustomerID as the user_id if it matches one of the valid user_ids

        # Construct transaction document with exact column names as specified
        transaction = {
            "TransactionID": str(transaction_id),
            "CustomerID": customer_id,  # This will use the CustomerID from the CSV
            "CustAccountBalance": balance,
            "TransactionDate": date,
            "TransactionTime": time,
            "TransactionAmount": amount,
            "userId": ObjectId(user_id)  # Add user_id from the existing users collection
        }

        records.append(transaction)

    except Exception as e:
        print(f"⚠️ Skipping row {index} due to error: {e}")

# Step 10: Insert transactions into the MongoDB collection
if records:
    try:
        result = transactions_collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} transactions into MongoDB.")
    except Exception as e:
        print(f"❌ Failed to insert records: {e}")
else:
    print("⚠️ No valid records to insert.")

