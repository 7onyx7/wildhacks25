const { logger } = require('../utils/logger');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const database = require('../utils/db');
const Goal = require('../models/Goal');
const Transaction = require('../models/Transaction');

class GoalService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.goalModel = null;
    this.transactionModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.goalModel = new Goal(db);
    this.transactionModel = new Transaction(db);
  }

  async createGoal(userId, goalData) {
    if (!this.goalModel) await this.initialize();
    
    try {
      const goal = await this.goalModel.create(userId, goalData);
      return goal;
    } catch (error) {
      logger.error('Error creating goal:', error);
      throw error;
    }
  }

  async getUserGoals(userId) {
    if (!this.goalModel) await this.initialize();
    
    try {
      const goals = await this.goalModel.findByUserId(userId);
      return goals;
    } catch (error) {
      logger.error('Error getting user goals:', error);
      throw error;
    }
  }

  async updateGoalProgress(userId, goalId, amount) {
    if (!this.goalModel) await this.initialize();
    
    try {
      const goal = await this.goalModel.findOne(goalId);
      if (!goal || goal.userId !== userId) {
        throw new Error('Goal not found or access denied');
      }
      
      const newAmount = goal.currentAmount + amount;
      const updatedGoal = await this.goalModel.update(goalId, { currentAmount: newAmount });
      
      return updatedGoal;
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      throw error;
    }
  }

  async getSavingsSuggestions(userId, goalId) {
    if (!this.goalModel || !this.transactionModel) await this.initialize();
    
    try {
      // Get the goal
      const goal = await this.goalModel.findOne(goalId);
      if (!goal || goal.userId !== userId) {
        throw new Error('Goal not found or access denied');
      }

      // Get recent transactions to identify spending habits
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 2);
      
      const transactions = await this.transactionModel.findByUserId(userId, {
        startDate,
        endDate
      });

      // Calculate remaining amount needed and time until target date
      const remaining = goal.targetAmount - goal.currentAmount;
      const today = new Date();
      const targetDate = new Date(goal.targetDate);
      const daysRemaining = Math.max(1, Math.round((targetDate - today) / (1000 * 60 * 60 * 24)));
      const monthsRemaining = daysRemaining / 30;
      
      // Monthly amount needed to reach goal
      const monthlyAmountNeeded = remaining / monthsRemaining;

      // Group expenses by category
      const categoryExpenses = {};
      transactions.forEach(t => {
        if (t.amount < 0) { // Only expenses
          const category = t.category || 'Uncategorized';
          if (!categoryExpenses[category]) categoryExpenses[category] = 0;
          categoryExpenses[category] += Math.abs(t.amount);
        }
      });

      // Get suggestions using Gemini
      const suggestions = await this.generateSavingsSuggestions({
        goal,
        remaining,
        daysRemaining,
        monthlyAmountNeeded,
        categoryExpenses
      });
      
      return {
        goal,
        remaining,
        daysRemaining,
        monthlyAmountNeeded,
        suggestions
      };
    } catch (error) {
      logger.error('Error getting savings suggestions:', error);
      throw error;
    }
  }

  async generateSavingsSuggestions(data) {
    try {
      const prompt = `
        Help me reach my savings goal:
        
        Goal name: ${data.goal.name}
        Target amount: $${data.goal.targetAmount.toFixed(2)}
        Current progress: $${data.goal.currentAmount.toFixed(2)} (${(data.goal.progress * 100).toFixed(2)}%)
        Amount remaining: $${data.remaining.toFixed(2)}
        Days until target date: ${data.daysRemaining}
        Monthly amount needed: $${data.monthlyAmountNeeded.toFixed(2)}
        
        My spending by category (last 2 months):
        ${Object.entries(data.categoryExpenses).map(([category, amount]) => `${category}: $${amount.toFixed(2)}`).join('\n')}
        
        Provide personalized suggestions to help me reach this savings goal on time.
        
        Return your advice in this JSON format:
        {
          "feasibilityScore": [0-10 score on how achievable the goal is],
          "generalAdvice": "high-level advice on reaching the goal",
          "specificSuggestions": [
            {
              "category": "spending category to adjust",
              "action": "specific action to take",
              "potentialSavings": "estimated monthly savings",
              "impact": "high|medium|low"
            }
          ],
          "alternativePlans": [
            {
              "description": "description of alternative plan",
              "timeframe": "new timeframe if needed",
              "adjustedMonthlySavings": "new monthly savings amount"
            }
          ]
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
        throw new Error('Failed to extract savings suggestions JSON');
      }
    } catch (error) {
      logger.error('Error generating savings suggestions:', error);
      throw error;
    }
  }
}

module.exports = new GoalService();
