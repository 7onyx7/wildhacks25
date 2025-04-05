require('dotenv').config({ path: '../.env' });
const axios = require('axios');

// Base URL for API requests
const baseURL = `http://localhost:${process.env.PORT || 3000}/api`;

// Auth0 token (you'll need to get this from Auth0 when testing protected routes)
let token = null;

// Test the public endpoint
async function testFinancialNews() {
  try {
    console.log('\nTesting GET /api/financial-news...');
    const response = await axios.get(`${baseURL}/financial-news`);
    console.log(`Status: ${response.status}`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing financial news:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Test the protected endpoints (you'll need a valid token for these)
async function testProtectedEndpoints() {
  if (!token) {
    console.log('\nSkipping protected endpoints - no token provided');
    console.log('To test protected endpoints:');
    console.log('1. Get a token from Auth0');
    console.log('2. Set the token variable in this script');
    return;
  }

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  try {
    // Test stock prediction
    console.log('\nTesting POST /api/predict-stock...');
    const predictionResponse = await axios.post(`${baseURL}/predict-stock`, {
      symbol: 'AAPL',
      sentimentScore: 0.7,
      riskTolerance: 'moderate'
    }, config);
    console.log(`Status: ${predictionResponse.status}`);
    console.log('Response data:', JSON.stringify(predictionResponse.data, null, 2));

    // Test budget endpoint
    console.log('\nTesting GET /api/budget...');
    const budgetResponse = await axios.get(`${baseURL}/budget?userId=default-user`, config);
    console.log(`Status: ${budgetResponse.status}`);
    console.log('Response data:', JSON.stringify(budgetResponse.data, null, 2));

    // Test bills endpoint
    console.log('\nTesting GET /api/bills...');
    const billsResponse = await axios.get(`${baseURL}/bills?userId=default-user`, config);
    console.log(`Status: ${billsResponse.status}`);
    console.log('Response data:', JSON.stringify(billsResponse.data, null, 2));

  } catch (error) {
    console.error('Error testing protected endpoints:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
async function runTests() {
  console.log('Starting API tests...');
  
  // First test the public endpoint
  const publicSuccess = await testFinancialNews();
  
  if (publicSuccess) {
    // If public endpoint works, try protected endpoints
    await testProtectedEndpoints();
  }
  
  console.log('\nTests completed');
}

// Add axios as a dependency
// npm install axios

// Run the tests when this script is executed
runTests();
