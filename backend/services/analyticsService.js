const { logger } = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const database = require('../utils/db');
const Transaction = require('../models/Transaction');
const Bill = require('../models/Bill');
const Budget = require('../models/Budget');

class AnalyticsService {
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

  async getCategoryAnalysis(userId, months = 3) {
    if (!this.transactionModel) await this.initialize();
    
    try {
      // Get transactions from last X months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const transactions = await this.transactionModel.findByUserId(userId, {
        startDate,
        endDate
      });

      // Group by category and calculate totals
      const categoryTotals = {};
      transactions.forEach(transaction => {
        if (transaction.amount < 0) { // Only count expenses (negative amounts)
          const category = transaction.category || 'Uncategorized';
          if (!categoryTotals[category]) {
            categoryTotals[category] = {
              total: 0,
              count: 0,
              transactions: []
            };
          }
          categoryTotals[category].total += Math.abs(transaction.amount);
          categoryTotals[category].count += 1;
          categoryTotals[category].transactions.push(transaction);
        }
      });

      // Calculate percentages and order by amount
      const totalSpent = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
      
      const categoryAnalysis = Object.entries(categoryTotals).map(([category, data]) => ({
        category,
        total: data.total,
        percentage: totalSpent ? (data.total / totalSpent * 100).toFixed(2) : 0,
        transactionCount: data.count,
        averageTransaction: data.count ? (data.total / data.count).toFixed(2) : 0
      })).sort((a, b) => b.total - a.total);

      // Get optimization suggestions using Gemini
      const optimizationSuggestions = await this.getOptimizationSuggestions(categoryAnalysis, totalSpent);
      
      return {
        totalSpent,
        categories: categoryAnalysis,
        optimization: optimizationSuggestions
      };
    } catch (error) {
      logger.error('Error analyzing spending categories:', error);
      throw error;
    }
  }

  async getOptimizationSuggestions(categories, totalSpent) {
    try {
      const prompt = `
        Analyze this spending breakdown by category:
        ${JSON.stringify(categories)}
        
        Total spending: $${totalSpent.toFixed(2)}
        
        Based on this spending profile, provide suggestions for optimizing finances.
        Focus on:
        1. Categories with unusually high spending
        2. Potential areas to reduce expenses
        3. Better allocation of resources
        
        Return your analysis in this JSON format:
        {
          "observations": [3-5 key observations about the spending pattern],
          "recommendations": [
            {
              "category": "category name",
              "suggestion": "specific action to optimize spending",
              "potentialSavings": "estimated monthly savings from this action",
              "difficulty": "easy|medium|hard",
              "impact": "high|medium|low"
            }
          ],
          "monthlyTargets": {
            "category1": recommended monthly budget amount,
            "category2": recommended monthly budget amount
          }
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
        throw new Error('Failed to extract optimization suggestions JSON');
      }
    } catch (error) {
      logger.error('Error getting optimization suggestions:', error);
      throw error;
    }
  }

  async forecastExpenses(userId, months = 3) {
    if (!this.transactionModel || !this.billModel) await this.initialize();
    
    try {
      // Get historical transactions
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const transactions = await this.transactionModel.findByUserId(userId, {
        startDate,
        endDate,
        type: 'withdrawal' // Only consider expenses
      });

      // Get upcoming bills
      const bills = await this.billModel.findUpcoming(userId);
      
      // Group expenses by category
      const categoryExpenses = {};
      transactions.forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        if (!categoryExpenses[category]) {
          categoryExpenses[category] = [];
        }
        categoryExpenses[category].push({
          amount: Math.abs(transaction.amount),
          date: transaction.date || transaction.createdAt
        });
      });

      // Calculate average monthly expenses per category
      const monthlyAverages = {};
      Object.entries(categoryExpenses).forEach(([category, expenses]) => {
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        monthlyAverages[category] = total / months;
      });

      // Forecast next three months with some variability
      const forecast = [];
      for (let i = 1; i <= 3; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() + i);
        
        const categoryForecasts = {};
        Object.entries(monthlyAverages).forEach(([category, average]) => {
          // Add some randomness (±10%)
          const variability = 0.1;
          const randomFactor = 1 + (Math.random() * variability * 2 - variability);
          categoryForecasts[category] = average * randomFactor;
        });
        
        // Include upcoming fixed bills
        bills.forEach(bill => {
          const billMonth = new Date(bill.dueDate).getMonth();
          if (billMonth === month.getMonth()) {
            const category = bill.category || 'Bills';
            if (!categoryForecasts[category]) categoryForecasts[category] = 0;
            categoryForecasts[category] += bill.amount;
          }
        });
        
        const totalForMonth = Object.values(categoryForecasts).reduce((sum, amount) => sum + amount, 0);
        
        forecast.push({
          month: month.toISOString().substring(0, 7), // YYYY-MM format
          categories: categoryForecasts,
          total: totalForMonth
        });
      }
      
      return {
        historicalMonthlyAverage: Object.values(monthlyAverages).reduce((sum, amount) => sum + amount, 0),
        categoryAverages: monthlyAverages,
        forecast
      };
    } catch (error) {
      logger.error('Error forecasting expenses:', error);
      throw error;
    }
  }

  async calculateFinancialHealthScore(userId) {
    if (!this.transactionModel || !this.billModel || !this.budgetModel) await this.initialize();
    
    try {
      // Get necessary financial data
      const balance = await this.transactionModel.getBalance(userId);
      const budget = await this.budgetModel.findByUserId(userId);
      const bills = await this.billModel.findUpcoming(userId);
      
      // Get last 3 months of transactions
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      
      const transactions = await this.transactionModel.findByUserId(userId, {
        startDate,
        endDate
      });

      // Calculate total income and expenses for the period
      let income = 0;
      let expenses = 0;
      transactions.forEach(t => {
        if (t.amount > 0) income += t.amount;
        else expenses += Math.abs(t.amount);
      });

      // Calculate health metrics
      const savingsRate = income > 0 ? (income - expenses) / income : 0;
      const monthlyIncome = budget?.income || (income / 3);
      const monthlyExpenses = budget?.expenses?.reduce((sum, e) => sum + e.amount, 0) || (expenses / 3);
      const debtToIncomeRatio = bills?.filter(b => b.category === 'Debt')?.reduce((sum, b) => sum + b.amount, 0) || 0 / monthlyIncome;
      const emergencySavings = balance / monthlyExpenses; // Number of months of expenses covered by current balance
      
      // Analyze financial health using Gemini
      const healthScore = await this.analyzeFinancialHealth({
        balance,
        savingsRate,
        monthlyIncome,
        monthlyExpenses,
        debtToIncomeRatio,
        emergencySavings,
        billCount: bills.length,
        transactionCount: transactions.length
      });
      
      return {
        rawMetrics: {
          currentBalance: balance,
          savingsRate,
          monthlyIncome,
          monthlyExpenses,
          debtToIncomeRatio,
          emergencySavingMonths: emergencySavings
        },
        healthScore
      };
    } catch (error) {
      logger.error('Error calculating financial health score:', error);
      throw error;
    }
  }

  async analyzeFinancialHealth(metrics) {
    try {
      const prompt = `
        Analyze this financial profile and calculate a comprehensive financial health score:
        
        Current balance: $${metrics.balance.toFixed(2)}
        Savings rate: ${(metrics.savingsRate * 100).toFixed(2)}%
        Monthly income: $${metrics.monthlyIncome.toFixed(2)}
        Monthly expenses: $${metrics.monthlyExpenses.toFixed(2)}
        Debt-to-income ratio: ${(metrics.debtToIncomeRatio * 100).toFixed(2)}%
        Emergency savings: ${metrics.emergencySavings.toFixed(2)} months of expenses
        Upcoming bill count: ${metrics.billCount}
        
        Calculate a financial health score on a scale of 0-100, where:
        - 0-20: Critical financial distress
        - 21-40: Financially vulnerable
        - 41-60: Financially coping
        - 61-80: Financially stable
        - 81-100: Financially thriving
        
        Return your analysis in this JSON format:
        {
          "overallScore": [0-100 score],
          "category": "Critical|Vulnerable|Coping|Stable|Thriving",
          "componentScores": {
            "savings": [0-100 score],
            "spending": [0-100 score],
            "debt": [0-100 score],
            "emergency": [0-100 score],
            "cashflow": [0-100 score]
          },
          "strengths": ["list of financial strengths"],
          "weaknesses": ["list of areas needing improvement"],
          "priorityActions": ["list of 3-5 most important actions to improve financial health"]
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
        throw new Error('Failed to extract financial health score JSON');
      }
    } catch (error) {
      logger.error('Error analyzing financial health:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
