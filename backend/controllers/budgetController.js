const { logger } = require('../utils/logger');
const budgetService = require('../services/budgetService');

exports.getBudget = async (req, res) => {
  try {
    // For now, using a static userId - in production you would get this from auth middleware
    const userId = req.query.userId || "default-user";
    
    const budget = await budgetService.getBudgetDetails(userId);

    res.json({
      success: true,
      data: budget
    });
  } catch (error) {
    logger.error('Error in getBudget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget details'
    });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { userId, income, expenses } = req.body;

    if (!income || !expenses) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const updatedBudget = await budgetService.updateBudget(userId || "default-user", { income, expenses });

    res.json({
      success: true,
      data: updatedBudget
    });
  } catch (error) {
    logger.error('Error in updateBudget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget'
    });
  }
};

exports.getBills = async (req, res) => {
  try {
    // For now, using a static userId - in production you would get this from auth middleware
    const userId = req.query.userId || "default-user";
    
    const bills = await budgetService.getBills(userId);

    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    logger.error('Error in getBills:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};