import pymongo
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId  # Necessary for creating ObjectId manually

# Load your MongoDB URI from environment variable or directly as a string
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_database()  # Default database or specify your database name
budget_collection = db.budgets  # Specify the collection name

# Define the budgets for each user
budgets = [
    {
        '_id': ObjectId(),  # Automatically generate a new ObjectId
        'user_id': ObjectId('605c72ef1b3f4e084f8b4567'),  # User 1 (Alice Johnson)
        'budget_name': 'Monthly Groceries',
        'amount': 500.00,  # Budget amount
        'period': 'monthly',  # Monthly budget
        'is_recurring': True,  # Recurring monthly budget
        'next_due_date': datetime(2025, 5, 1),  # Next budget due date
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4568'),  # User 2 (Bob Smith)
        'budget_name': 'Entertainment',
        'amount': 200.00,
        'period': 'monthly',
        'is_recurring': True,
        'next_due_date': datetime(2025, 5, 1),
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4569'),  # User 3 (Charlie Brown)
        'budget_name': 'Health & Fitness',
        'amount': 100.00,
        'period': 'monthly',
        'is_recurring': True,
        'next_due_date': datetime(2025, 5, 1),
        'created_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4569'),  # User 3 (Charlie Brown)
        'budget_name': 'Vacation Fund',
        'amount': 1500.00,
        'period': 'yearly',
        'is_recurring': True,  # Yearly budget
        'next_due_date': datetime(2026, 1, 1),  # Next year’s budget reset
        'created_at': datetime.now()
    }
]

# Insert the budgets into the MongoDB database
try:
    budget_collection.insert_many(budgets)
    print("✅ Budgets added successfully!")
except Exception as e:
    print(f"❌ Error inserting budgets: {e}")
