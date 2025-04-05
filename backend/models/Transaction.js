const { MongoClient, ObjectId } = require('mongodb');

class Transaction {
  constructor(db) {
    this.collection = db.collection('transactions');
  }

  async create(userId, transactionData) {
    const transaction = {
      userId,
      ...transactionData,
      type: transactionData.amount > 0 ? 'deposit' : 'withdrawal', // Automatically determine type
      method: transactionData.method || 'unknown', // 'credit', 'debit', 'cash', etc.
      category: transactionData.category || 'uncategorized',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(transaction);
    return { ...transaction, _id: result.insertedId };
  }

  async findByUserId(userId, options = {}) {
    const { startDate, endDate, category, type, method } = options;
    let query = { userId };
    
    // Add optional filters
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    }
    if (category) query.category = category;
    if (type) query.type = type;
    if (method) query.method = method;
    
    return await this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
  }

  async getBalance(userId) {
    const transactions = await this.findByUserId(userId);
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }
}

module.exports = Transaction;
