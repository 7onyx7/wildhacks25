const axios = require('axios');
const { MongoClient } = require('mongodb');

// Mock environment variables
process.env.PORT = '3000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/financial_analyzer_test';

// Base URL for API testing
const baseURL = `http://localhost:${process.env.PORT}/api`;
let server;
let db;

// Setup before tests
beforeAll(async () => {
  // This assumes your server exports the app
  // You might need to modify your app.js to export the app object
  const app = require('../app');
  server = app.listen(process.env.PORT);
  
  // Connect to test database
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  db = client.db();
});

// Clean up after tests
afterAll(async () => {
  await server.close();
  if (db) {
    await db.dropDatabase(); // Clean up test database
    await db.client.close();
  }
});

// Tests for public endpoints
describe('Financial News Endpoint', () => {
  test('GET /financial-news should return news data', async () => {
    const response = await axios.get(`${baseURL}/financial-news`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
  });
});

// You would add more tests for other endpoints
