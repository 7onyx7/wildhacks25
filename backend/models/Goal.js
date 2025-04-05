const { MongoClient, ObjectId } = require('mongodb');

class Goal {
  constructor(db) {
    this.collection = db.collection('goals');
  }

  async create(userId, goalData) {
    const goal = {
      userId,
      ...goalData,
      currentAmount: goalData.currentAmount || 0,
      progress: (goalData.currentAmount || 0) / goalData.targetAmount,
      status: goalData.currentAmount >= goalData.targetAmount ? 'completed' : 'in-progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(goal);
    return { ...goal, _id: result.insertedId };
  }

  async findByUserId(userId) {
    return await this.collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findOne(goalId) {
    return await this.collection.findOne({ _id: new ObjectId(goalId) });
  }

  async update(goalId, goalData) {
    // Calculate progress if needed
    let updateData = { ...goalData };
    if ('currentAmount' in goalData && 'targetAmount' in goalData) {
      updateData.progress = goalData.currentAmount / goalData.targetAmount;
      updateData.status = goalData.currentAmount >= goalData.targetAmount ? 'completed' : 'in-progress';
    } else if ('currentAmount' in goalData) {
      const goal = await this.findOne(goalId);
      if (goal) {
        updateData.progress = goalData.currentAmount / goal.targetAmount;
        updateData.status = goalData.currentAmount >= goal.targetAmount ? 'completed' : 'in-progress';
      }
    }
    
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(goalId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async delete(goalId) {
    return await this.collection.deleteOne({ _id: new ObjectId(goalId) });
  }
}

module.exports = Goal;
