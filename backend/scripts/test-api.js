const axios = require('axios');

// Base URL for API requests
const baseURL = 'http://localhost:3000/api';

// Test function for all endpoints
async function testAllEndpoints() {
  try {
    console.log('\n=== Testing Financial News API ===');
    const newsResponse = await axios.get(`${baseURL}/financial-news`);
    console.log('Status:', newsResponse.status);
    console.log('Data:', JSON.stringify(newsResponse.data, null, 2));
    
    console.log('\n=== Testing Stock Prediction API ===');
    const predictionResponse = await axios.post(`${baseURL}/predict-stock`, {
      symbol: 'AAPL',
      sentimentScore: 0.7,
      riskTolerance: 'moderate'
    });
    console.log('Status:', predictionResponse.status);
    console.log('Data:', JSON.stringify(predictionResponse.data, null, 2));
    
    console.log('\n=== Testing Budget API ===');
    const budgetResponse = await axios.get(`${baseURL}/budget?userId=default-user`);
    console.log('Status:', budgetResponse.status);
    console.log('Data:', JSON.stringify(budgetResponse.data, null, 2));
    
    console.log('\n=== Testing Update Budget API ===');
    const updateResponse = await axios.post(`${baseURL}/budget/update`, {
      userId: 'default-user',
      income: 6000,
      expenses: [
        { category: 'Housing', amount: 1500 },
        { category: 'Food', amount: 700 },
        { category: 'Entertainment', amount: 300 }
      ]
    });
    console.log('Status:', updateResponse.status);
    console.log('Data:', JSON.stringify(updateResponse.data, null, 2));
    
    console.log('\n=== Testing Bills API ===');
    const billsResponse = await axios.get(`${baseURL}/bills?userId=default-user`);
    console.log('Status:', billsResponse.status);
    console.log('Data:', JSON.stringify(billsResponse.data, null, 2));
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
testAllEndpoints();
