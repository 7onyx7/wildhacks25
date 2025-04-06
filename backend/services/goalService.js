const Goal = require("../models/Goal");

async function createGoal(data) {
  const goal = new Goal(data);
  return await goal.save();
}

async function getGoalsByUser(userId) {
  return await Goal.find({ userId }).sort({ createdAt: -1 });
}

async function getGoalById(id) {
  return await Goal.findById(id);
}

async function updateGoal(id, updates) {
  return await Goal.findByIdAndUpdate(id, updates, { new: true });
}

async function deleteGoal(id) {
  return await Goal.findByIdAndDelete(id);
}

module.exports = {
  createGoal,
  getGoalsByUser,
  getGoalById,
  updateGoal,
  deleteGoal,
};
