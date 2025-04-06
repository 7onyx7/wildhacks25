const env = import.meta.env;
const API_URL = env.VITE_API_URL || "http://localhost:3000/api";

// Inline interface for financial data
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

export async function predictTimeline(data: UserFinancialData): Promise<string> {
  const res = await fetch(`${API_URL}/gemini/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to generate prediction");
  }

  const result: { prediction: string } = await res.json();
  return result.prediction;
}

export async function classifySentiment(text: string): Promise<string> {
  const res = await fetch(`${API_URL}/gemini/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to classify sentiment");
  }

  const result: { result: string } = await res.json();
  return result.result;
}

export async function chatWithGemini(message: string, sessionId: string): Promise<string> {
  const res = await fetch(`${API_URL}/gemini/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to send chat message");
  }

  const result: { reply: string } = await res.json();
  return result.reply;
}
