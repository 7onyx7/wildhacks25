const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");

router.post("/", goalController.create);
router.get("/user/:userId", goalController.getByUser);
router.get("/:id", goalController.getOne);
router.put("/:id", goalController.update);
router.delete("/:id", goalController.remove);

module.exports = router;
