const mongoose = require("mongoose");

const chatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // optional, if you're tracking by user
    required: false,
  },
  messages: [
    {
      sender: {
        type: String, // 'user' or 'gemini'
        required: true,
        enum: ["user", "gemini"],
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  sessionId: {
    type: String, // e.g., UUID or timestamp-based string
    required: true,
  },
  saved: {
    type: Boolean,
    default: true, // false if it's a "non-saving" anonymous chat
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatLog", chatLogSchema);
