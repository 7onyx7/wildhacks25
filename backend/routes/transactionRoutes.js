const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET /api/transactions - Get user transactions with optional filtering
router.get('/transactions', (req, res) => transactionController.getTransactions(req, res));

// POST /api/transaction - Add a new transaction
router.post('/transaction', (req, res) => transactionController.addTransaction(req, res));

// GET /api/balance - Get current balance
router.get('/balance', (req, res) => transactionController.getBalance(req, res));

// GET /api/predict-shortfall - Predict if user will miss bills
router.get('/predict-shortfall', (req, res) => transactionController.predictBillShortfall(req, res));

// POST /api/evaluate-purchase - Evaluate if a purchase is a good decision
router.post('/evaluate-purchase', (req, res) => transactionController.evaluatePurchase(req, res));

// POST /api/financial-advice - Get customized financial advice
router.post('/financial-advice', (req, res) => transactionController.getCustomAdvice(req, res));

module.exports = router;
