const { MongoClient } = require('mongodb');

class Budget {
  constructor(db) {
    this.collection = db.collection('budgets');
  }

  async create(userId, budgetData) {
    const budget = {
      userId,
      ...budgetData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(budget);
    return { ...budget, _id: result.insertedId };
  }

  async findByUserId(userId) {
    return await this.collection.findOne({ userId });
  }

  async update(userId, budgetData) {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...budgetData,
          updatedAt: new Date()
        }
      },
      {
        returnDocument: 'after',
        upsert: true
      }
    );
    return result.value || result.upsertedId ? 
      await this.findByUserId(userId) : null;
  }

  async calculateShortfall(userId) {
    const budget = await this.findByUserId(userId);
    if (!budget) return 0;

    const totalExpenses = budget.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    return Math.max(0, totalExpenses - budget.income);
  }

  async addExpense(userId, expense) {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $push: { expenses: expense },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }
}

module.exports = Budget;