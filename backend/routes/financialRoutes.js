const express = require('express');
const router = express.Router();
const { getFinancialNews, predictStock } = require('../controllers/financialController');

// GET /api/financial-news - Fetch recent financial news with sentiment scores
router.get('/financial-news', getFinancialNews);

// POST /api/predict-stock - Get stock prediction based on sentiment and risk tolerance
router.post('/predict-stock', predictStock);

module.exports = router;