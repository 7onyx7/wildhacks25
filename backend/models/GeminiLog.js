const mongoose = require("mongoose");

const geminiLogSchema = new mongoose.Schema({
  type: { type: String, enum: ["timeline", "chat", "sentiment"], required: true },
  input: mongoose.Schema.Types.Mixed, // could be string or object
  response: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GeminiLog", geminiLogSchema);
