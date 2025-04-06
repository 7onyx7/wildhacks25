const ChatLog = require("../models/ChatLogs");

async function createChatLog(data) {
  return await ChatLog.create(data);
}

async function getLogsByUser(userId) {
  return await ChatLog.find({ userId }).sort({ createdAt: -1 });
}

async function getChatBySession(sessionId) {
  return await ChatLog.findOne({ sessionId });
}

module.exports = {
  createChatLog,
  getLogsByUser,
  getChatBySession,
};
