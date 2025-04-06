const geminiService = require("../services/geminiService");

exports.predictTimeline = async (req, res) => {
  try {
    const prediction = await geminiService.generateTimelinePrompt(req.body);
    res.json({ prediction });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate timeline prediction" });
  }
};

exports.classifySentiment = async (req, res) => {
  try {
    const result = await geminiService.classifyPurchaseSentiment(req.body.text);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Failed to classify sentiment" });
  }
};

exports.chatSupport = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const reply = await geminiService.chatWithGemini(message, sessionId);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Gemini chat failed" });
  }
};
