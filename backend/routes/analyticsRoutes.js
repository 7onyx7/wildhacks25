const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/spending - Get spending analysis by category
router.get('/analytics/spending', (req, res) => analyticsController.getSpendingAnalysis(req, res));

// GET /api/analytics/habits - Get spending habits analysis
router.get('/analytics/habits', (req, res) => analyticsController.getSpendingHabits(req, res));

// GET /api/analytics/forecast - Get expense forecast
router.get('/analytics/forecast', (req, res) => analyticsController.getExpenseForecast(req, res));

// GET /api/analytics/health-score - Get financial health score
router.get('/analytics/health-score', (req, res) => analyticsController.getFinancialHealthScore(req, res));

module.exports = router;
