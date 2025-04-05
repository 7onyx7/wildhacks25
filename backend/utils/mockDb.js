const { logger } = require('./logger');

class MockDatabase {
  constructor() {
    this.collections = {
      news: [],
      budgets: [],
      bills: [],
      transactions: [],
      goals: []
    };
    this.isConnected = false;
  }

  async connect() {
    try {
      this.isConnected = true;
      logger.info('Mock database initialized');
      return this;
    } catch (error) {
      logger.error('Error initializing mock database:', error);
      throw error;
    }
  }

  async close() {
    this.isConnected = false;
    logger.info('Mock database connection closed');
  }

  getDb() {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this;
  }

  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = [];
    }
    return {
      find: (query = {}) => {
        // Simple implementation of find that supports basic filtering
        let result = this.collections[name];
        
        if (query) {
          result = result.filter(item => {
            return Object.entries(query).every(([key, value]) => {
              if (key === '$gte' || key === '$lte') {
                // Skip complex queries for now
                return true;
              }
              return item[key] === value;
            });
          });
        }
        
        return {
          sort: () => ({
            limit: (n) => ({
              toArray: () => Promise.resolve(result.slice(0, n))
            }),
            toArray: () => Promise.resolve(result)
          }),
          toArray: () => Promise.resolve(result)
        };
      },
      findOne: (query = {}) => {
        const result = this.collections[name].find(item => {
          return Object.entries(query).every(([key, value]) => item[key] === value);
        });
        return Promise.resolve(result || null);
      },
      insertOne: (doc) => {
        const _id = Math.random().toString(36).substring(2, 15);
        const newDoc = { _id, ...doc };
        this.collections[name].push(newDoc);
        return Promise.resolve({ insertedId: _id });
      },
      insertMany: (docs) => {
        const insertedIds = {};
        docs.forEach((doc, index) => {
          const _id = Math.random().toString(36).substring(2, 15);
          const newDoc = { _id, ...doc };
          this.collections[name].push(newDoc);
          insertedIds[index] = _id;
        });
        return Promise.resolve({ insertedIds });
      },
      findOneAndUpdate: (query, update, options = {}) => {
        const index = this.collections[name].findIndex(item => {
          return Object.entries(query).every(([key, value]) => item[key] === value);
        });
        
        if (index === -1) {
          if (options.upsert) {
            const _id = Math.random().toString(36).substring(2, 15);
            const newDoc = { _id, ...query, ...update.$set };
            this.collections[name].push(newDoc);
            return Promise.resolve({ value: newDoc, upsertedId: _id });
          }
          return Promise.resolve({ value: null });
        }
        
        if (update.$set) {
          Object.assign(this.collections[name][index], update.$set);
        }
        if (update.$push) {
          Object.entries(update.$push).forEach(([key, value]) => {
            if (!this.collections[name][index][key]) {
              this.collections[name][index][key] = [];
            }
            this.collections[name][index][key].push(value);
          });
        }
        
        return Promise.resolve({ value: this.collections[name][index] });
      },
      deleteOne: (query) => {
        const index = this.collections[name].findIndex(item => {
          return Object.entries(query).every(([key, value]) => item[key] === value);
        });
        
        if (index !== -1) {
          this.collections[name].splice(index, 1);
          return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
      },
      deleteMany: (query) => {
        const initialLength = this.collections[name].length;
        this.collections[name] = this.collections[name].filter(item => {
          return !Object.entries(query).every(([key, value]) => item[key] === value);
        });
        return Promise.resolve({ deletedCount: initialLength - this.collections[name].length });
      }
    };
  }
}

// Create and export a singleton instance
const mockDatabase = new MockDatabase();
module.exports = mockDatabase;
