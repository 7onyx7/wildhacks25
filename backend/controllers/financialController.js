const { logger } = require('../utils/logger');
const sentimentService = require('../services/sentimentService');
const predictionService = require('../services/predictionService');

exports.getFinancialNews = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const news = await sentimentService.getRecentNewsWithSentiment(limit);

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    logger.error('Error in getFinancialNews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch financial news'
    });
  }
};

exports.predictStock = async (req, res) => {
  try {
    const { symbol, sentimentScore, riskTolerance } = req.body;

    if (!symbol || sentimentScore === undefined || !riskTolerance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters'
      });
    }

    const prediction = await predictionService.predictStock(symbol, sentimentScore, riskTolerance);

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Error in predictStock:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate stock prediction'
    });
  }
};