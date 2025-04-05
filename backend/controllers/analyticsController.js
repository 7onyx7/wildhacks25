const { logger } = require('../utils/logger');
const analyticsService = require('../services/analyticsService');
const habitAnalysisService = require('../services/habitAnalysisService');

class AnalyticsController {
  async getSpendingAnalysis(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      const months = req.query.months ? parseInt(req.query.months) : 3;
      
      const categoryAnalysis = await analyticsService.getCategoryAnalysis(userId, months);
      
      res.json({
        success: true,
        data: categoryAnalysis
      });
    } catch (error) {
      logger.error('Error getting spending analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate spending analysis'
      });
    }
  }

  async getSpendingHabits(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      const months = req.query.months ? parseInt(req.query.months) : 3;
      
      const habits = await habitAnalysisService.detectRecurringPatterns(userId, months);
      
      res.json({
        success: true,
        data: habits
      });
    } catch (error) {
      logger.error('Error analyzing spending habits:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze spending habits'
      });
    }
  }

  async getExpenseForecast(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      const months = req.query.months ? parseInt(req.query.months) : 3;
      
      const forecast = await analyticsService.forecastExpenses(userId, months);
      
      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      logger.error('Error forecasting expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to forecast expenses'
      });
    }
  }

  async getFinancialHealthScore(req, res) {
    try {
      const userId = req.query.userId || 'default-user';
      
      const healthScore = await analyticsService.calculateFinancialHealthScore(userId);
      
      res.json({
        success: true,
        data: healthScore
      });
    } catch (error) {
      logger.error('Error calculating financial health score:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate financial health score'
      });
    }
  }
}

module.exports = new AnalyticsController();
