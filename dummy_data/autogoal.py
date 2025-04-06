import pymongo
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId  # Necessary for creating ObjectId manually

# Load your MongoDB URI from environment variable or directly as a string
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_database()  # Default database or specify your database name
goal_collection = db.goals  # Specify the collection name

# Define the goals for each user
goals = [
    {
        '_id': ObjectId(),  # Automatically generate a new ObjectId
        'user_id': ObjectId('605c72ef1b3f4e084f8b4567'),  # User 1 (Alice Johnson)
        'goal_name': 'Save for vacation',
        'amount': 2000.00,  # Goal amount to save
        'current_amount': 500.00,  # Amount already saved
        'deadline': datetime(2025, 12, 31),  # Goal deadline date
        'goal_type': 'savings',  # Savings goal
        'related_budget_id': ObjectId('605c72ef1b3f4e084f8b4567'),  # Link to the related budget (optional)
        'related_bills': [ObjectId('605c72ef1b3f4e084f8b4568')],  # Link to related bills (optional)
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4568'),  # User 2 (Bob Smith)
        'goal_name': 'Pay off credit card debt',
        'amount': 1500.00,
        'current_amount': 800.00,
        'deadline': datetime(2025, 9, 1),
        'goal_type': 'debt repayment',
        'related_budget_id': ObjectId('605c72ef1b3f4e084f8b4568'),
        'related_bills': [ObjectId('605c72ef1b3f4e084f8b4569')],  # Link to bill (e.g., a credit card bill)
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    },
    {
        '_id': ObjectId(),
        'user_id': ObjectId('605c72ef1b3f4e084f8b4569'),  # User 3 (Charlie Brown)
        'goal_name': 'Build emergency fund',
        'amount': 5000.00,
        'current_amount': 1200.00,
        'deadline': datetime(2026, 5, 1),
        'goal_type': 'savings',
        'related_budget_id': ObjectId('605c72ef1b3f4e084f8b4569'),
        'related_bills': [],  # No bills associated with this goal
        'created_at': datetime.now(),
        'updated_at': datetime.now()
    }
]

# Insert the goals into the MongoDB database
try:
    goal_collection.insert_many(goals)
    print("✅ Goals added successfully!")
except Exception as e:
    print(f"❌ Error inserting goals: {e}")
