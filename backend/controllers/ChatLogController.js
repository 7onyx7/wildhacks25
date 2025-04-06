const chatLogService = require("../services/chatLogService.js");

exports.create = async (req, res) => {
  try {
    const log = await chatLogService.createChatLog(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to save chat log" });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const logs = await chatLogService.getLogsByUser(req.params.userId);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat logs" });
  }
};

exports.getBySession = async (req, res) => {
  try {
    const log = await chatLogService.getChatBySession(req.params.sessionId);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat session" });
  }
};
