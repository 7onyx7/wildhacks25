const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");

router.post("/predict", geminiController.predictTimeline);
router.post("/sentiment", geminiController.classifySentiment);
router.post("/chat", geminiController.chatSupport);

module.exports = router;
