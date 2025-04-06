const goalService = require("../services/goalService");

exports.create = async (req, res) => {
  try {
    const goal = await goalService.createGoal(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to create goal" });
  }
};

exports.getByUser = async (req, res) => {
  try {
    const goals = await goalService.getGoalsByUser(req.params.userId);
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const goal = await goalService.getGoalById(req.params.id);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch goal" });
  }
};

exports.update = async (req, res) => {
  try {
    const goal = await goalService.updateGoal(req.params.id, req.body);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to update goal" });
  }
};

exports.remove = async (req, res) => {
  try {
    await goalService.deleteGoal(req.params.id);
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
};
