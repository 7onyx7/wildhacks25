import pymongo
from pymongo import MongoClient
import hashlib
from datetime import datetime
import os


# Load your MongoDB URI from environment variable or directly as a string
MONGODB_URI = 'mongodb+srv://bassalim03:Hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/financedb?retryWrites=true&w=majority'

# Connect to MongoDB
client = MongoClient(MONGODB_URI)
db = client.get_database()  # Default database or specify your database name
users_collection = db.users  # Specify the collection name

# Helper function to hash the password (use the same method you used in your Node.js app)
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# List of users to be inserted
users = [
    {
        'name': 'Alice Johnson',
        'email': 'alice.johnson@example.com',
        'provider': 'Google',
        'provider_id': 'google987654',
        'username': 'alicej',
        'passwordhash': hash_password('password123'),  # Ensure you hash the password
        'profilepicture': '',
        'created_at': datetime.now()
    },
    {
        'name': 'Bob Smith',
        'email': 'bob.smith@example.com',
        'provider': 'Facebook',
        'provider_id': 'facebook123456',
        'username': 'bobsmith',
        'passwordhash': hash_password('securepassword'),
        'profilepicture': '',
        'created_at': datetime.now()
    },
    {
        'name': 'Charlie Brown',
        'email': 'charlie.brown@example.com',
        'provider': 'Twitter',
        'provider_id': 'twitter654321',
        'username': 'charlieb',
        'passwordhash': hash_password('mysecurepassword'),
        'profilepicture': '',
        'created_at': datetime.now()
    }
]

# Insert the users into the MongoDB database
try:
    users_collection.insert_many(users)
    print("✅ Users added successfully!")
except Exception as e:
    print(f"❌ Error inserting users: {e}")
