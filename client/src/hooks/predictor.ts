import { predictTimeline } from "./useGemini";

interface ExpenseItem {
  category: string;
  amount: number;
}

interface Goal {
  title: string;
  targetAmount: number;
  targetDate: string;
}

interface UserFinancialData {
  income: number;
  expenses: ExpenseItem[];
  balance: number;
  goals?: Goal[];
}

export async function generateFinancialPrediction(userData: UserFinancialData): Promise<string> {
  try {
    const prediction = await predictTimeline(userData);
    return prediction;
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
}
