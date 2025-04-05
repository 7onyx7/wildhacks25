const { MongoClient } = require('mongodb');

class News {
  constructor(db) {
    this.collection = db.collection('news');
  }

  async create(newsData) {
    const news = {
      ...newsData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(news);
    return { ...news, _id: result.insertedId };
  }

  async findRecent(limit = 10) {
    return await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async findByDateRange(startDate, endDate) {
    return await this.collection
      .find({
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findBySentimentRange(minScore, maxScore) {
    return await this.collection
      .find({
        sentimentScore: {
          $gte: minScore,
          $lte: maxScore
        }
      })
      .sort({ createdAt: -1 })
      .toArray();
  }
}

module.exports = News;