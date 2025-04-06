import pandas as pd
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# MongoDB connection
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@Hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'
client = MongoClient(MONGODB_URI)
db = client.get_database()
transactions_collection = db.transactions

# Path to your CSV file
CSV_FILE_PATH = 'transactions.csv'  # Replace with your filename if needed

# Expected columns (rename/match case-insensitively)
REQUIRED_COLUMNS = {
    "transaction_id": None,
    "customer_id": None,
    "custaccountbalance": None,
    "transaction_date": None,
    "transaction_time": None,
    "transaction_amount": None
}

# Load CSV using pandas
df = pd.read_csv(CSV_FILE_PATH)

# Normalize column names to lowercase
df.columns = [col.lower().strip() for col in df.columns]

# Match required columns to their actual names in the CSV
for required_col in REQUIRED_COLUMNS.keys():
    matches = [col for col in df.columns if required_col in col]
    if matches:
        REQUIRED_COLUMNS[required_col] = matches[0]
    else:
        raise Exception(f"❌ Required column '{required_col}' not found in CSV.")

# Convert and insert into MongoDB
records = []

for index, row in df.iterrows():
    try:
        # Extract fields based on mapped names
        transaction_id = row[REQUIRED_COLUMNS['transaction_id']]
        customer_id = row[REQUIRED_COLUMNS['customer_id']]
        balance = float(row[REQUIRED_COLUMNS['custaccountbalance']])
        date = str(row[REQUIRED_COLUMNS['transaction_date']])
        time = str(row[REQUIRED_COLUMNS['transaction_time']])
        amount = float(row[REQUIRED_COLUMNS['transaction_amount']])

        # Combine date and time into a datetime object
        transaction_datetime = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M:%S")

        # Build transaction document
        transaction = {
            "transaction_id": str(transaction_id),
            "userId": ObjectId(customer_id),
            "custaccountbalance": balance,
            "transaction_amount": amount,
            "timestamp": transaction_datetime,
            "type": "deposit" if amount > 0 else "withdrawal",
            "createdAt": datetime.now(),
            "updatedAt": datetime.now()
        }

        records.append(transaction)

    except Exception as e:
        print(f"⚠️ Skipping row {index} due to error: {e}")

# Insert into MongoDB
if records:
    try:
        result = transactions_collection.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids)} transactions into MongoDB.")
    except Exception as e:
        print(f"❌ Failed to insert records: {e}")
else:
    print("⚠️ No valid records to insert.")
