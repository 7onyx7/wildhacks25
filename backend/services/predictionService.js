const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');

class PredictionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async predictStock(symbol, sentimentScore, riskTolerance) {
    try {
      const prompt = `
        Based on the following information:
        - Stock symbol: ${symbol}
        - Market sentiment score: ${sentimentScore} (scale from -1 to 1, where -1 is very negative and 1 is very positive)
        - Investor risk tolerance: ${riskTolerance} (low, moderate, or high)
        
        Provide a stock recommendation as a JSON object with this structure:
        {
          "recommendation": [one of: "BUY", "HOLD", "SELL"],
          "confidence": [number between 0 and 1],
          "explanation": [brief explanation of the recommendation],
          "riskAssessment": [brief assessment of the risk]
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
        throw new Error('Failed to extract prediction JSON');
      }
    } catch (error) {
      logger.error('Error predicting stock:', error);
      throw error;
    }
  }
}

module.exports = new PredictionService();
