const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');
const database = require('../utils/db');
const Transaction = require('../models/Transaction');
const Bill = require('../models/Bill');
const Budget = require('../models/Budget');

class AdvisorService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.transactionModel = null;
    this.billModel = null;
    this.budgetModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.transactionModel = new Transaction(db);
    this.billModel = new Bill(db);
    this.budgetModel = new Budget(db);
  }

  async predictBillShortfall(userId) {
    if (!this.transactionModel || !this.billModel || !this.budgetModel) await this.initialize();
    
    try {
      // Get current balance
      const balance = await this.transactionModel.getBalance(userId);
      
      // Get upcoming bills
      const upcomingBills = await this.billModel.findUpcoming(userId);
      
      // Calculate total upcoming bill amount
      const totalBillAmount = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
      
      // Get budget for income projection
      const budget = await this.budgetModel.findByUserId(userId);
      const projectedIncome = budget?.income || 0;
      
      // Determine if there will be a shortfall
      const projectedBalance = balance + projectedIncome - totalBillAmount;
      const willMissBills = projectedBalance < 0;
      
      // Get detailed bill risk analysis using Gemini
      const analysis = await this.analyzeBillPaymentRisk({
        balance,
        upcomingBills,
        projectedIncome,
        projectedBalance,
        willMissBills
      });
      
      return {
        currentBalance: balance,
        upcomingBills,
        projectedIncome,
        projectedBalance,
        willMissBills,
        riskAnalysis: analysis
      };
    } catch (error) {
      logger.error('Error predicting bill shortfall:', error);
      throw error;
    }
  }

  async analyzeBillPaymentRisk(financialData) {
    try {
      const prompt = `
        Analyze the following financial situation and provide advice on bill payment risk:
        - Current balance: $${financialData.balance}
        - Projected income: $${financialData.projectedIncome}
        - Upcoming bills: ${JSON.stringify(financialData.upcomingBills)}
        - Projected balance after bills: $${financialData.projectedBalance}
        
        Provide a JSON response with the following structure:
        {
          "riskLevel": [one of: "high", "medium", "low"],
          "riskAnalysis": [detailed explanation of the risk],
          "recommendations": [list of 3-5 actionable recommendations to avoid missing bill payments],
          "priorityBills": [list of bills that should be prioritized if there's a shortfall]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract risk analysis JSON');
      }
    } catch (error) {
      logger.error('Error analyzing bill payment risk:', error);
      throw error;
    }
  }

  async evaluatePurchase(userId, purchaseDetails) {
    if (!this.transactionModel || !this.billModel || !this.budgetModel) await this.initialize();
    
    try {
      // Get current financial state
      const balance = await this.transactionModel.getBalance(userId);
      const upcomingBills = await this.billModel.findUpcoming(userId);
      const budget = await this.budgetModel.findByUserId(userId);
      
      // Get purchase advice using Gemini
      const analysis = await this.analyzePurchaseDecision({
        balance,
        upcomingBills,
        budget,
        purchase: purchaseDetails
      });
      
      return {
        currentBalance: balance,
        purchaseAmount: purchaseDetails.amount,
        balanceAfterPurchase: balance - purchaseDetails.amount,
        purchaseAdvice: analysis
      };
    } catch (error) {
      logger.error('Error evaluating purchase:', error);
      throw error;
    }
  }

  async analyzePurchaseDecision(financialData) {
    try {
      const prompt = `
        Evaluate whether this purchase is a good financial decision:
        - Current balance: $${financialData.balance}
        - Purchase details: ${JSON.stringify(financialData.purchase)}
        - Upcoming bills: ${JSON.stringify(financialData.upcomingBills)}
        - Monthly budget: ${JSON.stringify(financialData.budget)}
        
        Provide a JSON response with the following structure:
        {
          "recommendation": [one of: "recommended", "acceptable", "caution", "not recommended"],
          "confidence": [number between 0 and 1],
          "reasoning": [detailed explanation of the recommendation],
          "impact": [explanation of how this purchase might affect upcoming bill payments],
          "alternatives": [optional list of alternative approaches if not recommended]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract purchase analysis JSON');
      }
    } catch (error) {
      logger.error('Error analyzing purchase decision:', error);
      throw error;
    }
  }

  async customFinancialAdvice(userId, question) {
    if (!this.transactionModel || !this.billModel || !this.budgetModel) await this.initialize();
    
    try {
      // Get user's financial context
      const balance = await this.transactionModel.getBalance(userId);
      const transactions = await this.transactionModel.findByUserId(userId, { limit: 10 });
      const upcomingBills = await this.billModel.findUpcoming(userId);
      const budget = await this.budgetModel.findByUserId(userId);
      
      // Create a prompt with the user's financial context
      const prompt = `
        As a financial advisor, answer the following question with the user's financial context in mind:
        
        User's question: "${question}"
        
        User's financial context:
        - Current balance: $${balance}
        - Monthly income: $${budget?.income || 'Unknown'}
        - Monthly expenses: ${JSON.stringify(budget?.expenses || [])}
        - Upcoming bills: ${JSON.stringify(upcomingBills)}
        - Recent transactions: ${JSON.stringify(transactions.slice(0, 5))}
        
        Provide a helpful, personalized financial advice response based on this specific context.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('Error getting custom financial advice:', error);
      throw error;
    }
  }
}

module.exports = new AdvisorService();
