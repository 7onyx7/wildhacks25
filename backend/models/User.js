// models/User.js

const mongoose = require('mongoose');

// Define the schema for the "users" collection
const userSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, // Automatically generates a unique ObjectId
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  provider: {
    type: String,
    required: true,
  },
  provider_id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordhash: {
    type: String,
    required: true,
  },
  profilepicture: {
    type: String,
    default: '', // Default to an empty string if no profile picture
  },
  created_at: {
    type: Date,
    default: Date.now, // Automatically sets the created date
  },
});

// Export the model based on the userSchema
module.exports = mongoose.model('User', userSchema);