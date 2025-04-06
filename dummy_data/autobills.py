import pymongo
from pymongo import MongoClient
import hashlib
from datetime import datetime, timedelta
from bson import ObjectId  # Necessary for creating ObjectId manually

# Load your MongoDB URI from environment variable or directly as a string
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_database()  # Default database or specify your database name
bills_collection = db.bills  # Specify the collection name

# Define the bills with recurrence information
bills = [
    {
        '_id': ObjectId(),  # Automatically generate a new ObjectId
        'user_id': ObjectId('605c72ef1b3f4e084f8b4567'),  # Random user_id for this bill
        'bill_name': 'Electricity Bill',
        'amount_due': 120.00,
        'due_date': datetime(2025, 4, 15),  # Next due date
        'category': 'Utilities',
        'is_recurring': True,  # Indicate that the bill is recurring
        'recurrence_pattern': 'monthly',  # Recurs every month
        'next_due_date': datetime(2025, 5, 15),  # Set the next due date for recurring bills
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4568'),
        'bill_name': 'Netflix Subscription',
        'amount_due': 15.99,
        'due_date': datetime(2025, 4, 20),
        'category': 'Entertainment',
        'is_recurring': True,  # Recurring bill
        'recurrence_pattern': 'monthly',  # Monthly recurrence
        'next_due_date': datetime(2025, 5, 20),  # Next month's due date
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4569'),
        'bill_name': 'Gym Membership',
        'amount_due': 50.00,
        'due_date': datetime(2025, 4, 10),
        'category': 'Health & Fitness',
        'is_recurring': True,
        'recurrence_pattern': 'monthly',
        'next_due_date': datetime(2025, 5, 10),  # Set the next due date
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4569'),
        'bill_name': 'Car Insurance',
        'amount_due': 450.00,
        'due_date': datetime(2025, 6, 1),
        'category': 'Insurance',
        'is_recurring': True,  # Recurring yearly bill
        'recurrence_pattern': 'yearly',  # Yearly recurrence
        'next_due_date': datetime(2026, 6, 1),  # Set next year’s due date
        'created_at': datetime.now()
    }
]

# Insert the bills into the MongoDB database
try:
    bills_collection.insert_many(bills)
    print("✅ Bills added successfully!")
except Exception as e:
    print(f"❌ Error inserting bills: {e}")
