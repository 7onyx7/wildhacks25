const { logger } = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const database = require('../utils/db');
const Transaction = require('../models/Transaction');

class HabitAnalysisService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.transactionModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.transactionModel = new Transaction(db);
  }

  async detectRecurringPatterns(userId, months = 3) {
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

      // Group transactions by category and merchant
      const categories = {};
      transactions.forEach(transaction => {
        const key = transaction.category;
        if (!categories[key]) categories[key] = [];
        categories[key].push(transaction);
      });

      // Identify recurring transactions and habits
      const recurringPatterns = [];
      for (const [category, categoryTransactions] of Object.entries(categories)) {
        if (categoryTransactions.length >= 3) {
          const merchants = this.groupByMerchant(categoryTransactions);
          
          for (const [merchant, merchantTransactions] of Object.entries(merchants)) {
            if (merchantTransactions.length >= 3) {
              // Check if transactions occur with regular frequency
              const isRecurring = this.checkRecurringPattern(merchantTransactions);
              if (isRecurring) {
                const avgAmount = merchantTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / merchantTransactions.length;
                
                recurringPatterns.push({
                  category,
                  merchant,
                  frequency: isRecurring.frequency,
                  averageAmount: avgAmount,
                  transactionCount: merchantTransactions.length,
                  isRegularAmount: this.isConsistentAmount(merchantTransactions)
                });
              }
            }
          }
        }
      }

      // Analyze habits and classify them as healthy or unhealthy
      const habits = await this.classifyHabits(recurringPatterns, transactions);
      
      return habits;
    } catch (error) {
      logger.error('Error detecting recurring patterns:', error);
      throw error;
    }
  }

  groupByMerchant(transactions) {
    const merchants = {};
    transactions.forEach(transaction => {
      const key = transaction.description;
      if (!merchants[key]) merchants[key] = [];
      merchants[key].push(transaction);
    });
    return merchants;
  }

  checkRecurringPattern(transactions) {
    // Sort by date
    transactions.sort((a, b) => a.date - b.date);
    
    // Check for weekly pattern
    if (this.checkFrequency(transactions, 7)) return { frequency: 'weekly' };
    
    // Check for bi-weekly pattern
    if (this.checkFrequency(transactions, 14)) return { frequency: 'bi-weekly' };
    
    // Check for monthly pattern
    if (this.checkFrequency(transactions, 30)) return { frequency: 'monthly' };
    
    return false;
  }

  checkFrequency(transactions, days) {
    if (transactions.length < 3) return false;
    
    const intervals = [];
    for (let i = 0; i < transactions.length - 1; i++) {
      const dayDiff = Math.round((transactions[i + 1].date - transactions[i].date) / (1000 * 60 * 60 * 24));
      intervals.push(dayDiff);
    }
    
    // Check if intervals are consistent with the expected days (with some tolerance)
    const tolerance = Math.round(days * 0.25);
    return intervals.every(interval => Math.abs(interval - days) <= tolerance);
  }

  isConsistentAmount(transactions) {
    if (transactions.length < 3) return false;
    
    const amounts = transactions.map(t => Math.abs(t.amount));
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    
    // Check if all amounts are within 15% of average
    return amounts.every(amt => Math.abs(amt - avgAmount) / avgAmount <= 0.15);
  }

  async classifyHabits(recurringPatterns, allTransactions) {
    try {
      // Create a summary of spending patterns
      const prompt = `
        Analyze these recurring financial transactions and spending patterns:
        ${JSON.stringify(recurringPatterns)}
        
        Some additional context on overall spending:
        - Total number of transactions: ${allTransactions.length}
        - Average transaction amount: $${this.getAverageAmount(allTransactions)}
        - Categories with highest spending: ${this.getTopCategories(allTransactions, 3)}
        
        For each recurring pattern, classify it as a "healthy" or "unhealthy" financial habit and explain why.
        Consider factors like:
        - Is this a necessary expense or luxury?
        - Is the frequency appropriate?
        - Is the spending level sustainable?
        - Could this be affecting ability to save?
        
        Return your analysis in this JSON format:
        {
          "habits": [
            {
              "category": "category name",
              "merchant": "merchant name",
              "classification": "healthy | unhealthy",
              "reasoning": "explanation of the classification",
              "suggestions": "1-2 suggestions to improve if unhealthy, or maintain if healthy"
            }
          ],
          "overallAssessment": "brief assessment of overall financial habits",
          "topRecommendations": ["list of 3 actionable recommendations"]
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
        throw new Error('Failed to extract habit analysis JSON');
      }
    } catch (error) {
      logger.error('Error classifying habits:', error);
      throw error;
    }
  }

  getAverageAmount(transactions) {
    if (transactions.length === 0) return 0;
    const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return (total / transactions.length).toFixed(2);
  }

  getTopCategories(transactions, count) {
    const categories = {};
    transactions.forEach(t => {
      if (!categories[t.category]) categories[t.category] = 0;
      categories[t.category] += Math.abs(t.amount);
    });
    
    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([category, amount]) => `${category} ($${amount.toFixed(2)})`)
      .join(", ");
  }
}

module.exports = new HabitAnalysisService();
