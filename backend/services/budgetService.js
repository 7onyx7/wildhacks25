const { logger } = require('../utils/logger');
const database = require('../utils/db');
const Budget = require('../models/Budget');
const Bill = require('../models/Bill');

class BudgetService {
  constructor() {
    this.budgetModel = null;
    this.billModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.budgetModel = new Budget(db);
    this.billModel = new Bill(db);
  }

  async getBudgetDetails(userId) {
    if (!this.budgetModel || !this.billModel) await this.initialize();
    
    try {
      const budget = await this.budgetModel.findByUserId(userId);
      const upcomingBills = await this.billModel.findUpcoming(userId, 30);
      
      const shortfall = budget ? await this.budgetModel.calculateShortfall(userId) : 0;
      
      return {
        income: budget?.income || 0,
        expenses: budget?.expenses || [],
        shortfall,
        upcomingBills
      };
    } catch (error) {
      logger.error('Error getting budget details:', error);
      throw error;
    }
  }

  async updateBudget(userId, budgetData) {
    if (!this.budgetModel) await this.initialize();
    
    try {
      const updatedBudget = await this.budgetModel.update(userId, budgetData);
      const shortfall = await this.budgetModel.calculateShortfall(userId);
      
      return {
        ...updatedBudget,
        shortfall
      };
    } catch (error) {
      logger.error('Error updating budget:', error);
      throw error;
    }
  }

  async getBills(userId) {
    if (!this.billModel) await this.initialize();
    
    try {
      return await this.billModel.findByUserId(userId);
    } catch (error) {
      logger.error('Error getting bills:', error);
      throw error;
    }
  }
}

module.exports = new BudgetService();
