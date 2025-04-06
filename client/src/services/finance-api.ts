import axios from 'axios';

const API_BASE_URL = '/api/finance';

interface PurchaseDetails {
  amount: number;
  category: string;
  description: string;
  isRecurring?: boolean;
  isUrgent?: boolean;
  additionalContext?: string;
  fullText?: string;
}

// Get advice on financial questions
export const getFinancialAdvice = async (questionData: string | { question: string, userContext: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/advice`, {
      data: questionData
    });
    return response;
  } catch (error) {
    console.error('Error getting financial advice:', error);
    throw error;
  }
};

// Get spending habits analysis
export const getSpendingHabits = async (spendingData?: { spendingDescription: string, financialGoals: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/spending-habits`, {
      data: spendingData || {}
    });
    return response;
  } catch (error) {
    console.error('Error analyzing spending habits:', error);
    throw error;
  }
};

// Evaluate a purchase decision
export const evaluatePurchase = async (purchaseDetails: PurchaseDetails) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/evaluate-purchase`, {
      purchase: purchaseDetails
    });
    return response;
  } catch (error) {
    console.error('Error evaluating purchase:', error);
    throw error;
  }
};

// Get financial forecast
export const getFinancialForecast = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast`);
    return response;
  } catch (error) {
    console.error('Error getting financial forecast:', error);
    throw error;
  }
};
