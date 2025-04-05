const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('../utils/logger');
const database = require('../utils/db');
const News = require('../models/News');

class SentimentService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.newsModel = null;
  }

  async initialize() {
    const db = await database.connect();
    this.newsModel = new News(db);
  }

  async analyzeSentiment(text) {
    try {
      const prompt = `
        Analyze the sentiment of this financial news article. 
        Return a JSON object with the following structure:
        {
          "sentimentScore": [number between -1 and 1, where -1 is very negative, 0 is neutral, and 1 is very positive],
          "keywords": [array of key financial terms mentioned],
          "summary": [brief 1-2 sentence summary],
          "impactAnalysis": [brief analysis of potential market impact]
        }
      `;

      const result = await this.model.generateContent([prompt, text]);
      const response = await result.response;
      const textResponse = response.text();
      
      // Extract JSON from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to extract sentiment analysis JSON');
      }
    } catch (error) {
      logger.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  async getRecentNewsWithSentiment(limit = 10) {
    if (!this.newsModel) await this.initialize();
    return await this.newsModel.findRecent(limit);
  }

  async saveNewsWithSentiment(newsData) {
    if (!this.newsModel) await this.initialize();
    return await this.newsModel.create(newsData);
  }
}

module.exports = new SentimentService();
