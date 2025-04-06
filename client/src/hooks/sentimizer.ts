import { classifySentiment } from "./useGemini";

export async function analyzePurchaseSentiment(input: string): Promise<string> {
  try {
    const result = await classifySentiment(input);
    return result;
  } catch (error) {
    console.error("Sentiment classification error:", error);
    throw error;
  }
}
