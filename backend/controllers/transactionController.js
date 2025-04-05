const { logger } = require('../utils/logger');
const database = require('../utils/db');
const Transaction = require('../models/Transaction');
const advisorService = require('../services/advisorService');

class TransactionController {
  constructor() {
    this.transactionModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.transactionModel = new Transaction(db);
  }

  async getTransactions(req, res) {
    try {
      if (!this.transactionModel) await this.initialize();
      
      const userId = req.query.userId || 'default-user';
      const options = {
        startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
        category: req.query.category,
        type: req.query.type, // 'withdrawal' or 'deposit'
        method: req.query.method // 'credit' or 'debit'
      };
      
      const transactions = await this.transactionModel.findByUserId(userId, options);
      
      res.json({
        success: true,
        data: transactions
      });
    } catch (error) {
      logger.error('Error getting transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }
  }

  async addTransaction(req, res) {
    try {
      if (!this.transactionModel) await this.initialize();
      
      const { userId, amount, description, category, date, method } = req.body;
      
      if (!amount || amount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Transaction amount is required and cannot be zero'
        });
      }
      
      const transaction = await this.transactionModel.create(userId || 'default-user', {
        amount: parseFloat(amount),
        description: description || '',
        category: category || 'uncategorized',
        date: date ? new Date(date) : new Date(),
        method: method || (amount > 0 ? 'deposit' : 'debit')
      });
      
      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error('Error adding transaction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add transaction'
      });
    }
  }

  async getBalance(req, res) {
    try {
      if (!this.transactionModel) await this.initialize();
      
      const userId = req.query.userId || 'default-user';
      const balance = await this.transactionModel.getBalance(userId);
      
      res.json({
        success: true,
        data: { balance }
      });
    } catch (error) {
      logger.error('Error getting balance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch balance'
      });
    }
  }

  async predictBillShortfall(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      const prediction = await advisorService.predictBillShortfall(userId);
      
      res.json({
        success: true,
        data: prediction
      });
    } catch (error) {
      logger.error('Error predicting bill shortfall:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to predict bill shortfall'
      });
    }
  }

  async evaluatePurchase(req, res) {
    try {
      const { userId, amount, description, category } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Purchase amount is required and must be greater than zero'
        });
      }
      
      const evaluation = await advisorService.evaluatePurchase(userId || 'default-user', {
        amount: parseFloat(amount),
        description: description || '',
        category: category || 'uncategorized'
      });
      
      res.json({
        success: true,
        data: evaluation
      });
    } catch (error) {
      logger.error('Error evaluating purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to evaluate purchase'
      });
    }
  }

  async getCustomAdvice(req, res) {
    try {
      const { userId, question } = req.body;
      
      if (!question) {
        return res.status(400).json({
          success: false,
          message: 'Question is required'
        });
      }
      
      const advice = await advisorService.customFinancialAdvice(userId || 'default-user', question);
      
      res.json({
        success: true,
        data: { advice }
      });
    } catch (error) {
      logger.error('Error getting custom advice:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get financial advice'
      });
    }
  }
}

module.exports = new TransactionController();
