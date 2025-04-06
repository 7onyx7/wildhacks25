const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Financial advice endpoint
router.post('/advice', async (req, res) => {
  try {
    const { data } = req.body;
    let question, context;
    
    if (typeof data === 'string') {
      question = data;
      context = '';
    } else {
      question = data.question;
      context = data.userContext;
    }
    
    const prompt = `
      You are a financial advisor with expertise in personal finance and budgeting.
      
      Please answer the following financial question with detailed analysis:
      Question: ${question}
      
      Additional context about the user's financial situation:
      ${context}
      
      Please provide:
      1. A main piece of advice (1-2 sentences)
      2. Detailed reasoning behind your advice (2-3 sentences)
      3. 2-3 pros of following this advice
      4. 2-3 potential cons or challenges to consider
      5. 2-4 specific action steps to take
      
      IMPORTANT: Respond in a conversational, readable format. DO NOT use JSON format. 
      Use clear headers, short paragraphs, and bullet points for readability.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    // Structure the response in a simple format
    const responseData = {
      advice: textResult,
      // Extract sections with regex for frontend display
      summary: extractFirstSentence(textResult),
      reasoning: textResult
    };
    
    // Extract sections for structured display
    const actionStepsMatch = textResult.match(/action steps[:\n]+([\s\S]+?)(?=\n\n|\n*$)/i);
    if (actionStepsMatch) {
      const actionText = actionStepsMatch[1];
      // Extract bullet points or numbered items
      const actionItems = actionText.split(/\n\s*[\*\-•]|\n\s*\d+\./).filter(item => item.trim().length > 0);
      responseData.actionSteps = actionItems.map(item => item.trim());
    }
    
    // Extract pros
    const prosMatch = textResult.match(/pros[:\n]+([\s\S]+?)(?=\n\n|cons|\n*$)/i);
    if (prosMatch) {
      const prosText = prosMatch[1];
      const prosItems = prosText.split(/\n\s*[\*\-•]|\n\s*\d+\./).filter(item => item.trim().length > 0);
      responseData.pros = prosItems.map(item => item.trim());
    }
    
    // Extract cons
    const consMatch = textResult.match(/cons[:\n]+([\s\S]+?)(?=\n\n|action|\n*$)/i);
    if (consMatch) {
      const consText = consMatch[1];
      const consItems = consText.split(/\n\s*[\*\-•]|\n\s*\d+\./).filter(item => item.trim().length > 0);
      responseData.cons = consItems.map(item => item.trim());
    }
    
    res.json({ data: responseData });
  } catch (error) {
    console.error('Error generating financial advice:', error);
    res.status(500).json({ error: 'Failed to generate financial advice' });
  }
});

// Helper function to extract the first sentence
function extractFirstSentence(text) {
  const match = text.match(/^(.*?[.!?])\s/);
  return match ? match[1] : text.substring(0, 100) + '...';
}

// Spending habits analysis endpoint
router.post('/spending-habits', async (req, res) => {
  try {
    const { data = {} } = req.body;
    const { spendingDescription = '', financialGoals = '' } = data;
    
    const prompt = `
      You are a financial analyst specializing in personal budgeting and spending optimization.
      
      Please analyze the following spending patterns and provide recommendations:
      
      Spending description: ${spendingDescription || "No specific spending information provided. Provide general advice."}
      
      Financial goals: ${financialGoals}
      
      Provide an analysis that includes:
      1. A brief summary of spending patterns (2-3 sentences)
      2. Analysis of major spending categories
      3. Recommendations for optimizing spending
      4. Potential savings opportunities
      
      IMPORTANT: Respond in a conversational, readable format. DO NOT use JSON format.
      Format your response with clear headers and use bullet points for recommendations.
      Keep it concise and highly readable.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    // Parse the text response into structured data for the frontend
    const analysisData = {
      summary: extractFirstSentence(textResult),
      habits: [],
      overallRecommendation: "",
    };
    
    // Extract categories and recommendations
    const categoryRegex = /\b(Housing|Food|Transportation|Entertainment|Shopping|Utilities|Dining|Insurance|Subscriptions|Debt|Savings|Income|Groceries|Recreation|Education|Healthcare|Travel)\b[^:]*:\s*([\s\S]+?)(?=\n\n|\n\s*[A-Z]|\n*$)/gi;
    
    let match;
    while ((match = categoryRegex.exec(textResult)) !== null) {
      const category = match[1];
      const details = match[2].trim();
      
      // Check for savings amounts - currency patterns
      const savingsMatch = details.match(/\$\s*\d+[,\d]*(\.\d+)?|\d+[,\d]*(\.\d+)?\s*dollars/i);
      const potentialSavings = savingsMatch ? savingsMatch[0] : "";
      
      analysisData.habits.push({
        category,
        recommendation: details,
        potentialSavings
      });
    }
    
    // Extract overall recommendation
    const overallMatch = textResult.match(/overall[^:]*:?\s*([\s\S]+?)(?=\n\n|\n*$)/i);
    if (overallMatch) {
      analysisData.overallRecommendation = overallMatch[1].trim();
    }
    
    // If no categories were found, provide a general analysis
    if (analysisData.habits.length === 0) {
      const paragraphs = textResult.split(/\n\n+/);
      if (paragraphs.length > 1) {
        analysisData.habits = [
          {
            category: "General Analysis",
            recommendation: paragraphs[1].trim(),
            potentialSavings: ""
          }
        ];
      } else {
        analysisData.habits = [
          {
            category: "General Analysis",
            recommendation: textResult.trim(),
            potentialSavings: ""
          }
        ];
      }
    }
    
    // Extract monthly savings potential
    const savingsMatch = textResult.match(/save\s+(?:up\s+to\s+)?(\$\s*\d+[,\d]*(\.\d+)?|\d+[,\d]*(\.\d+)?\s*dollars)/i);
    if (savingsMatch) {
      analysisData.monthlySavingsPotential = savingsMatch[1];
    }
    
    res.json({ data: analysisData });
  } catch (error) {
    console.error('Error analyzing spending habits:', error);
    res.status(500).json({ error: 'Failed to analyze spending habits' });
  }
});

// Purchase evaluation endpoint
router.post('/evaluate-purchase', async (req, res) => {
  try {
    const { purchase } = req.body;
    const { amount, category, description, isRecurring, isUrgent, additionalContext, fullText } = purchase;
    
    const prompt = `
      You are a financial advisor evaluating a potential purchase.
      
      Purchase details:
      - Amount: $${amount}
      - Category: ${category}
      - Description: ${description}
      - Is it a recurring expense? ${isRecurring ? 'Yes' : 'No'}
      - Is it urgent? ${isUrgent ? 'Yes' : 'No'}
      - Additional context: ${additionalContext || 'None provided'}
      - Full text of request: ${fullText || description}
      
      Please evaluate this purchase and provide:
      1. A recommendation (choose one: "recommended", "acceptable", "caution", or "not recommended")
      2. Detailed reasoning for your recommendation
      3. The potential financial impact of this purchase
      4. Alternative options if applicable
      5. How this purchase might affect overall budget and future financial goals
      
      Format your response as valid JSON with the following structure:
      {
        "recommendation": "your recommendation (one of the 4 options)",
        "reasoning": "detailed reasoning",
        "impact": "financial impact assessment",
        "budgetImpact": "how this affects monthly/annual budget",
        "futureProjections": "impact on future financial goals",
        "alternatives": ["alternative 1", "alternative 2", "etc"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    // Try to parse the JSON response
    try {
      const jsonResult = JSON.parse(textResult);
      res.json({ data: jsonResult });
    } catch (parseError) {
      // If not valid JSON, create a simpler structure
      res.json({ 
        data: { 
          recommendation: "caution",
          reasoning: textResult,
          alternatives: ["Consider waiting until you've done more research"]
        } 
      });
    }
  } catch (error) {
    console.error('Error evaluating purchase:', error);
    res.status(500).json({ error: 'Failed to evaluate purchase' });
  }
});

// Financial forecast endpoint
router.get('/forecast', async (req, res) => {
  try {
    const prompt = `
      You are a financial analyst creating a simulated financial forecast.
      
      Please generate a realistic financial forecast that includes:
      1. Projected income trends
      2. Expense patterns
      3. Savings potential
      4. Investment opportunities
      5. Risk factors
      
      Format your response as well-structured JSON with these keys:
      {
        "summary": "Brief summary of the forecast",
        "incomeTrend": "Projected income trend",
        "expenseAnalysis": "Analysis of expense patterns",
        "savingsPotential": "Estimated savings potential",
        "investmentSuggestions": ["Suggestion 1", "Suggestion 2"],
        "riskFactors": ["Risk 1", "Risk 2"],
        "recommendations": ["Recommendation 1", "Recommendation 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    // Try to parse the JSON response
    try {
      const jsonResult = JSON.parse(textResult);
      res.json({ data: jsonResult });
    } catch (parseError) {
      // If not valid JSON, create a simpler structure
      res.json({ 
        data: { 
          summary: "Forecast generated",
          recommendations: [textResult]
        } 
      });
    }
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// Test endpoint for Gemini API connection
router.get('/test', async (req, res) => {
  try {
    // Simple test prompt to check if API is working
    const prompt = "Respond with a simple 'Hello from Gemini API' if you can read this.";
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    res.json({ 
      success: true, 
      message: 'Gemini API connection successful',
      response: textResult
    });
  } catch (error) {
    console.error('Error testing Gemini API connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gemini API connection failed',
      error: error.message
    });
  }
});

// Simple test data endpoint for frontend development/testing
router.post('/test-data', async (req, res) => {
  try {
    // Mock data that will include all the fields used by the frontend
    const mockData = {
      summary: "This is a sample financial analysis summary.",
      habits: [
        {
          category: "Housing",
          currentSpending: "$1,200 per month",
          recommendation: "Consider a roommate to split costs",
          potentialSavings: "$500-600 per month"
        },
        {
          category: "Food",
          currentSpending: "$500 per month",
          recommendation: "Meal prep can reduce costs",
          potentialSavings: "$100-200 per month"
        }
      ],
      overallRecommendation: "Focus on reducing housing and food costs for the biggest impact",
      monthlySavingsPotential: "$600-800",
      reasoning: "Based on your spending patterns, housing and food represent 60% of your expenses",
      pros: ["Simple changes can lead to significant savings", "No need to change lifestyle drastically"],
      cons: ["Requires consistent effort", "May need lifestyle adjustments"],
      actionSteps: ["Create a meal plan", "Look for a roommate", "Cancel unused subscriptions"],
      budgetReallocations: ["Move $200 from dining to savings", "Reduce entertainment by $50"]
    };

    res.json({ data: mockData });
  } catch (error) {
    console.error('Error with test data endpoint:', error);
    res.status(500).json({ error: 'Failed to retrieve test data' });
  }
});

// Generate random budget scenario for simulation
router.get('/generate-scenario', async (req, res) => {
  try {
    const scenarioType = req.query.type || 'budget'; // Default to budget
    
    const prompt = `
      Generate a realistic financial scenario for a random fictional person.
      
      ${scenarioType === 'budget' ? 
        'Create a detailed monthly budget breakdown with income and expenses. Include some financial goals and challenges.' : 
        scenarioType === 'investment' ? 
        'Create a scenario about an investment decision, including details about the person\'s financial situation and the investment opportunity.' : 
        'Create a financial dilemma that requires advice, such as debt management, major purchase, or career change with financial implications.'}
      
      Make the scenario detailed with specific numbers, but keep it to 3-5 sentences maximum.
      Make it conversational, as if the person is explaining their situation.
      Do not format as JSON - just write natural text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResult = response.text();
    
    res.json({ 
      data: { 
        scenario: textResult.trim()
      }
    });
  } catch (error) {
    console.error('Error generating scenario:', error);
    res.status(500).json({ error: 'Failed to generate scenario' });
  }
});

// Generate random budget scenarios for simulation
router.get('/random-scenario', async (req, res) => {
  try {
    // Generate a random financial scenario text for the user to work with
    const scenarios = [
      "I'm 28 years old, making $65,000 per year as a software developer. I currently pay $1,650 in rent, have $22,000 in student loans, and about $6,000 in credit card debt. I spend roughly $400 on groceries, $200 on dining out, and $300 on entertainment monthly. I want to buy a house in the next 3 years.",
      
      "I'm 35, married with one child, household income of $110,000. We have a mortgage of $2,200/month with 25 years remaining. We have two car loans totaling $850/month and about $15,000 in savings. We want to start saving for our child's college education.",
      
      "I'm a recent college graduate (23) making $48,000 at my first job. I have $30,000 in student loans, $3,500 in credit card debt, and I'm paying $1,100 for a shared apartment. I spend about $350 on groceries, $250 dining out, and $200 on entertainment monthly. I want to build an emergency fund and start investing.",
      
      "I'm 42, single, making $85,000 as a project manager. I own a condo with a $1,800 mortgage (15 years remaining), have $45,000 in retirement accounts, and $10,000 in savings. I spend about $500 on groceries, $400 on dining out, and have a car payment of $450/month. I'm concerned I'm not saving enough for retirement.",
      
      "We're a family of four (both parents 40) with combined income of $125,000. Our mortgage is $2,400/month, we spend $800 on groceries, $600 on childcare, and $500 on utilities monthly. We have about $65,000 in retirement accounts and $20,000 in college savings for our kids, but only $8,000 in emergency savings. We want to reduce debt and increase savings."
    ];
    
    // Choose a random scenario
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    res.json({
      status: "success",
      scenario: randomScenario
    });
  } catch (error) {
    console.error('Error generating random scenario:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate random scenario",
      error: error.message
    });
  }
});

// Simulate budget scenarios based on user's financial information
router.post('/simulate', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        status: "error",
        message: "Missing financial information"
      });
    }
    
    // Use Gemini API instead of OpenAI
    const prompt = `
      You are a financial advisor specializing in budget simulations. 
      Analyze the provided financial information and create 2-3 realistic budget scenarios.
      Format your response as a valid JSON object with the following structure:
      {
        "scenarios": [
          {
            "name": "Scenario name",
            "description": "Brief description of this scenario",
            "monthlyBudget": "$X,XXX.XX", 
            "savings": "$XXX.XX",
            "expenses": "$X,XXX.XX",
            "budgetItems": [
              { "category": "Housing", "amount": "$X,XXX.XX" },
              { "category": "Transportation", "amount": "$XXX.XX" },
              ...
            ],
            "impact": "Description of long-term impact of this scenario"
          },
          ...
        ]
      }
      
      Make the scenarios realistic and personalized to the user's situation. Provide specific numbers for budgets.
      
      USER FINANCIAL INFORMATION:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(responseText);
      
      // Return the scenarios
      res.json({
        status: "success",
        ...parsedResponse
      });
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      
      // Try to extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          res.json({
            status: "success",
            ...extractedJson
          });
          return;
        } catch (e) {
          // Fall through to error handling
        }
      }
      
      // If JSON parsing failed, return a structured error
      res.status(500).json({
        status: "error",
        message: "Failed to parse simulation results",
        error: "Invalid response format from AI provider"
      });
    }
  } catch (error) {
    console.error('Error generating budget simulation:', error);
    let errorMessage = "Failed to generate budget simulation";
    
    res.status(500).json({
      status: "error",
      message: errorMessage,
      error: error.message
    });
  }
});

module.exports = router;
