const { GoogleGenerativeAI } = require("@google/generative-ai");
const GeminiLog = require("../models/GeminiLog");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

const appContext = `
You are a financial assistant inside a budgeting app. 
You help users predict future events based on transaction history, classify purchase sentiment, and provide answers related to saving goals, spending patterns, and financial planning.
Avoid hallucinating specific numbers unless provided. Stay helpful and grounded in user context.
`;

async function generateTimelinePrompt(userData) {
  const prompt = `
${appContext}

Here is a user's current financial data:
${JSON.stringify(userData, null, 2)}

Generate predictions for 1 week, 1 month, 1 year, 5 years, and 10 years.
Return the predictions as bullet points or in a structured format.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  await GeminiLog.create({ type: "timeline", input: userData, response });
  return response;
}

async function classifyPurchaseSentiment(purchaseText) {
  const prompt = `
${appContext}

Classify this purchase sentiment:
"${purchaseText}"

Return one of: "essential", "non-essential", "impulse", or "goal-aligned".
Explain briefly why.
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  await GeminiLog.create({ type: "sentiment", input: purchaseText, response });
  return response;
}

async function chatWithGemini(userMessage, sessionId = null) {
  const prompt = `
${appContext}

User: "${userMessage}"
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  await GeminiLog.create({ type: "chat", input: { userMessage, sessionId }, response });
  return response;
}

module.exports = {
  generateTimelinePrompt,
  classifyPurchaseSentiment,
  chatWithGemini,
};
