const express = require('express');
const router = express.Router();
const { getBudget, updateBudget, getBills } = require('../controllers/budgetController');

// GET /api/budget - Get current budget details
router.get('/budget', getBudget);

// POST /api/budget/update - Update budget data
router.post('/budget/update', updateBudget);

// GET /api/bills - Get list of scheduled bills
router.get('/bills', getBills);

module.exports = router;