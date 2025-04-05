const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

// POST /api/goals - Create a new financial goal
router.post('/goals', (req, res) => goalController.createGoal(req, res));

// GET /api/goals - Get user's financial goals
router.get('/goals', (req, res) => goalController.getUserGoals(req, res));

// POST /api/goals/progress - Update progress on a goal
router.post('/goals/progress', (req, res) => goalController.updateGoalProgress(req, res));

// GET /api/goals/:goalId/suggestions - Get savings suggestions for a specific goal
router.get('/goals/:goalId/suggestions', (req, res) => goalController.getSavingsSuggestions(req, res));

module.exports = router;
