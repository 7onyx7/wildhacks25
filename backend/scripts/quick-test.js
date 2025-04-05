const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

async function testEndpoints() {
  try {
    console.log('\n--- Testing GET /api/financial-news ---');
    const newsResponse = await axios.get(`${baseURL}/financial-news`);
    console.log('Status:', newsResponse.status);
    console.log('Data:', JSON.stringify(newsResponse.data, null, 2).slice(0, 300) + '...');
    
    console.log('\n--- Testing POST /api/predict-stock ---');
    const predictionResponse = await axios.post(`${baseURL}/predict-stock`, {
      symbol: 'AAPL',
      sentimentScore: 0.7,
      riskTolerance: 'moderate'
    });
    console.log('Status:', predictionResponse.status);
    console.log('Data:', JSON.stringify(predictionResponse.data, null, 2));
    
    console.log('\n--- Testing GET /api/budget ---');
    const budgetResponse = await axios.get(`${baseURL}/budget?userId=default-user`);
    console.log('Status:', budgetResponse.status);
    console.log('Data:', JSON.stringify(budgetResponse.data, null, 2));
    
    console.log('\n--- Testing GET /api/bills ---');
    const billsResponse = await axios.get(`${baseURL}/bills?userId=default-user`);
    console.log('Status:', billsResponse.status);
    console.log('Data:', JSON.stringify(billsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error testing endpoints:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Make sure axios is installed first: npm install axios
testEndpoints();
