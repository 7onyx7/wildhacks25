const { MongoClient, ObjectId } = require('mongodb');

class Bill {
  constructor(db) {
    this.collection = db.collection('bills');
  }

  async create(userId, billData) {
    const bill = {
      userId,
      ...billData,
      status: 'upcoming',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await this.collection.insertOne(bill);
    return { ...bill, _id: result.insertedId };
  }

  async findByUserId(userId) {
    return await this.collection
      .find({ userId })
      .sort({ dueDate: 1 })
      .toArray();
  }

  async findUpcoming(userId, days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return await this.collection
      .find({
        userId,
        dueDate: {
          $gte: today,
          $lte: futureDate
        }
      })
      .sort({ dueDate: 1 })
      .toArray();
  }

  async updateStatus(billId, status) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(billId) },
      {
        $set: {
          status,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async delete(billId) {
    return await this.collection.deleteOne({ _id: new ObjectId(billId) });
  }
}

module.exports = Bill;