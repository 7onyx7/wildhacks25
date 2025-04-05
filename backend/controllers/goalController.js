const { logger } = require('../utils/logger');
const goalService = require('../services/goalService');

class GoalController {
  async createGoal(req, res) {
    try {
      const { userId, name, targetAmount, targetDate, category, currentAmount, notes } = req.body;
      
      if (!name || !targetAmount || !targetDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters'
        });
      }
      
      const goalData = {
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate: new Date(targetDate),
        category: category || 'Savings',
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        notes
      };
      
      const goal = await goalService.createGoal(userId || 'default-user', goalData);
      
      res.json({
        success: true,
        data: goal
      });
    } catch (error) {
      logger.error('Error creating goal:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create goal'
      });
    }
  }

  async getUserGoals(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      
      const goals = await goalService.getUserGoals(userId);
      
      res.json({
        success: true,
        data: goals
      });
    } catch (error) {
      logger.error('Error getting user goals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve goals'
      });
    }
  }

  async updateGoalProgress(req, res) {
    try {
      const { userId, goalId, amount } = req.body;
      
      if (!goalId || amount === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters'
        });
      }
      
      const updatedGoal = await goalService.updateGoalProgress(
        userId || 'default-user',
        goalId,
        parseFloat(amount)
      );
      
      res.json({
        success: true,
        data: updatedGoal
      });
    } catch (error) {
      logger.error('Error updating goal progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goal'
      });
    }
  }

  async getSavingsSuggestions(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      const { goalId } = req.params;
      
      if (!goalId) {
        return res.status(400).json({
          success: false,
          message: 'Goal ID is required'
        });
      }
      
      const suggestions = await goalService.getSavingsSuggestions(userId, goalId);
      
      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      logger.error('Error getting savings suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get savings suggestions'
      });
    }
  }
}

module.exports = new GoalController();
