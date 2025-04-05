require('dotenv').config();
const { MongoClient } = require('mongodb');
const database = require('../utils/db');
const { logger } = require('../utils/logger');

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');
    
    // Connect to database
    const db = await database.connect();
    
    // Clear existing collections
    await db.collection('news').deleteMany({});
    await db.collection('budgets').deleteMany({});
    await db.collection('bills').deleteMany({});
    
    // Seed financial news
    const newsArticles = [
      {
        title: "Federal Reserve Holds Interest Rates Steady",
        content: "The Federal Reserve announced today that it will maintain current interest rates...",
        source: "Financial Times",
        sentimentScore: 0.2,
        keywords: ["Federal Reserve", "interest rates", "monetary policy"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Tech Stocks Rally on Strong Earnings Reports",
        content: "Major technology companies reported better-than-expected quarterly earnings...",
        source: "Wall Street Journal",
        sentimentScore: 0.8,
        keywords: ["tech stocks", "earnings", "market rally"],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Inflation Concerns Grow as Consumer Prices Rise",
        content: "The latest Consumer Price Index shows a significant increase in inflation...",
        source: "Bloomberg",
        sentimentScore: -0.6,
        keywords: ["inflation", "CPI", "consumer prices"],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('news').insertMany(newsArticles);
    logger.info(`Seeded ${newsArticles.length} news articles`);
    
    // Seed user budgets
    const budgets = [
      {
        userId: "default-user",
        income: 5000,
        expenses: [
          { category: "Housing", amount: 1500, description: "Rent" },
          { category: "Utilities", amount: 300, description: "Electricity, water, internet" },
          { category: "Food", amount: 600, description: "Groceries and dining out" },
          { category: "Transportation", amount: 400, description: "Car payment, gas, maintenance" }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('budgets').insertMany(budgets);
    logger.info(`Seeded ${budgets.length} budgets`);
    
    // Seed bills
    const currentDate = new Date();
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    
    const bills = [
      {
        userId: "default-user",
        name: "Rent",
        amount: 1500,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
        status: "paid",
        category: "Housing",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: "default-user",
        name: "Electricity",
        amount: 120,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
        status: "upcoming",
        category: "Utilities",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: "default-user",
        name: "Internet",
        amount: 80,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
        status: "upcoming",
        category: "Utilities",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: "default-user",
        name: "Car Payment",
        amount: 350,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
        status: "upcoming",
        category: "Transportation",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: "default-user",
        name: "Rent",
        amount: 1500,
        dueDate: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
        status: "upcoming",
        category: "Housing",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await db.collection('bills').insertMany(bills);
    logger.info(`Seeded ${bills.length} bills`);
    
    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding database:', error);
  } finally {
    await database.close();
  }
}

// Execute the seeding function
seedDatabase();
