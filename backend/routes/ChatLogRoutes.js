const express = require("express");
const router = express.Router();
const chatLogController = require("../controllers/chatLogController");

router.post("/", chatLogController.create);
router.get("/user/:userId", chatLogController.getByUser);
router.get("/session/:sessionId", chatLogController.getBySession);

module.exports = router;
