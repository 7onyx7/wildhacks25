const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://bassalim03:hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/?retryWrites=true&w=majority&appName=hacka-04-2025";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB!");
  } finally {
    await client.close();
  }
}


const mongoose = require('mongoose');

// Replace with your MongoDB URI
const mongooseUri = 'mongodb+srv://bassalim03:hacka042025@hacka-04-2025.6n2xfnt.mongodb.net/your_mongodb_connection_string';

mongoose.connect(mongooseUri).then(() => {
  console.log("Connected to MongoDB!");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Define the schema for the "users" collection
const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,  // This will automatically generate a unique ObjectId for each user
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,  // Ensures the email is unique
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']  // Simple email validation
  },
  provider: {
    type: String,
    required: true
  },
  provider_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  passwordhash: {
    type: String,
    required: true
  },
  profilepicture: {
    type: String,  // This could be a URL to the image
    default: ''    // Default to an empty string if no profile picture is provided
  },
  created_at: {
    type: Date,
    default: Date.now  // Automatically sets the created date
  }
});

// Export the model based on the userSchema
module.exports = mongoose.model('User', userSchema);

run().catch(console.dir);
