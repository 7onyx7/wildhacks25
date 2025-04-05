require('dotenv').config();
const mockDb = require('../utils/mockDb');
const { logger } = require('../utils/logger');

async function seedMockData() {
  try {
    logger.info('Seeding mock database with test data...');
    
    // Connect to mock database
    await mockDb.connect();
    
    // Clear existing collections
    mockDb.collections.news = [];
    mockDb.collections.budgets = [];
    mockDb.collections.bills = [];
    
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
    
    for (const article of newsArticles) {
      await mockDb.collection('news').insertOne(article);
    }
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
    
    for (const budget of budgets) {
      await mockDb.collection('budgets').insertOne(budget);
    }
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
      }
    ];
    
    for (const bill of bills) {
      await mockDb.collection('bills').insertOne(bill);
    }
    logger.info(`Seeded ${bills.length} bills`);
    
    logger.info('Mock database seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding mock database:', error);
  }
}

// Execute the function
seedMockData()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
