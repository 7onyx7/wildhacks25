"use client"

// import type React from "react"

import {
    //  useEffect, 
     useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
     MessageSquareWarning,
      Twitter,
       MailWarning,
       CreditCard,
       DollarSign } from "lucide-react"
// import { predictTimeline } from "@/hooks/predicter"
import { useToast } from "@/hooks/use-toast";
import UploadProgress from "@/components/upload-progress"
// import { sampleTweets } from "@/data/sampleTweets"
// import AnalysisResultCard, { AnalysisResultProps } from "@/components/analysis-results-card"

// Import our financial API services
import { getFinancialAdvice, getFinancialForecast, getSpendingHabits, evaluatePurchase } from "@/services/finance-api";


export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("tweet")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [textContent, setTextContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const { toast } = useToast()
  const [financialResult, setFinancialResult] = useState<any>(null);

  const simulateUploadProgress = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    return interval
  }

  const handleUpload = async () => {
    const progressInterval = simulateUploadProgress()

    try {
        let content: string | File | undefined
        let contentType: "tweet" | "text" | "email" | "image" | undefined

      if (activeTab === "image") {
        if (!selectedFile) {
          toast({
            title: "No file selected",
            description: "Please select an image to upload",
            variant: "destructive",
          })
          clearInterval(progressInterval)
          setIsUploading(false)
          return
        }
        content = selectedFile
        contentType = "image"
      } else if (activeTab === "text" || activeTab === "tweet" || activeTab === "email") {
        if (!textContent.trim()) {
          toast({
            title: "No content provided",
            description: `Please enter some ${activeTab} content to analyze`,
            variant: "destructive",
          })
          clearInterval(progressInterval)
          setIsUploading(false)
          return
        }
        content = textContent
        contentType = activeTab as "text" | "tweet" | "email"
      }

      if (typeof content !== "string" || !contentType || contentType === "image") {
        toast({
          title: "Unsupported content",
          description: "Only text, tweet, and email are supported for now.",
          variant: "destructive",
        })
        clearInterval(progressInterval)
        setIsUploading(false)
        return
      }

      // Process the content with our financial API and Gemini
      let result;
      
      if (contentType === "text") {
        // For text content, evaluate as a purchase with enhanced parsing
        const purchaseDetails = parseTextAsPurchase(content);
        
        // Add the instructions as additional context if available
        if (instructions) {
          purchaseDetails.additionalContext = instructions;
        }
        
        result = await evaluatePurchase(purchaseDetails);
      } else if (contentType === "tweet") {
        // For financial questions, get more personalized advice with context
        const contextData = {
          question: content,
          userContext: instructions || "No additional context provided"
        };
        
        result = await getFinancialAdvice(contextData);
      } else if (contentType === "email") {
        // For spending habits analysis, include financial goals from instructions
        const spendingData = {
          spendingDescription: content,
          financialGoals: instructions || "General financial wellbeing"
        };
        
        result = await getSpendingHabits(spendingData);
      }

      // Store the result
      setFinancialResult(result.data);

      toast({
        title: "Analysis Complete",
        description: "Financial prediction has been generated",
      })
      
      // Ensure progress completes
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress(100)

        setTimeout(() => {
          setIsUploading(false)
          setSelectedFile(null)
          setTextContent("")

          toast({
            title: "Analysis successful",
            description: "Your financial prediction is ready",
          })
        }, 500)
      }, 1000)
    } catch (err) {
        console.error("Analysis failed:", err)
      clearInterval(progressInterval)
      setIsUploading(false)

      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content",
        variant: "destructive",
      })
    }
  }

  // Enhanced version of parsing text content to extract financial information
  const parseTextAsPurchase = (content: string) => {
    // Look for amounts with dollar signs, commas, and decimal points
    const amountMatch = content.match(/\$?\s*([\d,]+(\.\d+)?)/);
    const amount = amountMatch 
      ? parseFloat(amountMatch[1].replace(/,/g, '')) 
      : 100; // Default to $100 if no amount found
    
    // Enhanced category detection with more keywords
    const categoryKeywords: Record<string, string[]> = {
      "Housing": ["rent", "mortgage", "house", "apartment", "home", "property", "real estate", "down payment", "closing cost"],
      "Food": ["food", "grocery", "restaurant", "eat", "meal", "dinner", "lunch", "breakfast", "takeout", "delivery"],
      "Utilities": ["utility", "electric", "water", "gas", "internet", "phone", "bill", "subscription"],
      "Entertainment": ["movie", "netflix", "subscription", "entertainment", "game", "concert", "theater", "streaming"],
      "Shopping": ["buy", "purchase", "shopping", "clothes", "shoes", "gadget", "electronics", "furniture"],
      "Travel": ["travel", "flight", "hotel", "vacation", "trip", "airbnb", "booking", "ticket", "airline"],
      "Transportation": ["car", "gas", "uber", "lyft", "transit", "bus", "train", "commute", "transportation"],
      "Health": ["medical", "doctor", "health", "insurance", "medication", "prescription", "hospital", "therapy"],
      "Education": ["tuition", "school", "college", "university", "student", "loan", "education", "course", "class"],
      "Debt": ["debt", "loan", "credit", "interest", "payment", "finance", "mortgage"]
    };

    let category = "Other";
    const contentLower = content.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        category = cat;
        break;
      }
    }
    
    // Try to extract frequency (one-time vs recurring)
    const isRecurring = /monthly|yearly|annual|subscription|recurring|weekly|biweekly|quarterly/i.test(contentLower);
    
    // Try to extract timeframe/urgency
    const urgencyTerms = ['urgent', 'asap', 'emergency', 'immediately', 'soon', 'need'];
    const isUrgent = urgencyTerms.some(term => contentLower.includes(term));
    
    return {
      amount,
      category,
      description: content.substring(0, 150), // Slightly longer description 
      isRecurring,
      isUrgent,
      fullText: content // Keep the full text for context
    };
  };

  const handleSample = async () => {
    // Generate simulated financial data with Gemini
    const progressInterval = simulateUploadProgress();
    
    try {
      // Generate different sample content based on active tab
      let simulatedContent = "";
      let forecast;
      
      switch (activeTab) {
        case "text":
          simulatedContent = generatePurchaseScenarios();
          forecast = await evaluatePurchase(parseTextAsPurchase(simulatedContent));
          break;
        case "tweet":
          simulatedContent = generateFinancialQuestions();
          forecast = await getFinancialAdvice(simulatedContent);
          break;
        case "email":
          simulatedContent = generateSpendingHabitsData();
          // Add some context in the instructions field too
          setInstructions("I'm trying to save for a down payment on a house within 2 years.");
          forecast = await getSpendingHabits();
          break;
      }
      
      setTextContent(simulatedContent);
      setFinancialResult(forecast.data);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          toast({
            title: "Simulation Complete",
            description: "Financial analysis has been simulated for your scenario",
          });
        }, 500);
      }, 1000);
    } catch (err) {
      console.error("Simulation failed:", err);
      clearInterval(progressInterval);
      setIsUploading(false);
      
      toast({
        title: "Simulation failed",
        description: "There was an error generating the simulation",
        variant: "destructive",
      });
    }
  }
  
  // Generate realistic purchase scenarios
  const generatePurchaseScenarios = () => {
    const scenarios = [
      "I'm considering buying a new laptop for $1,299. I need it for work as my current one is 5 years old and slowing down. I make about $4,500 per month and my rent is $1,200.",
      "Should I get a new car? I'm looking at a used Honda Civic for $18,500. My current car is 12 years old with 150,000 miles. I have $10,000 saved for a down payment.",
      "I want to sign up for a gym membership that costs $75 monthly with a $150 signup fee. I currently spend about $200 monthly on entertainment.",
      "Is it a good time to buy a house? I've found one for $350,000 and I make $85,000 annually. I have $40,000 saved for a down payment and my credit score is 740."
    ];
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }
  
  // Generate realistic financial questions
  const generateFinancialQuestions = () => {
    const questions = [
      "Should I prioritize paying off my student loans ($25,000 at 5.5% interest) or investing more in my 401k where I get a 5% employer match?",
      "I have $10,000 in credit card debt at 18% APR and $15,000 in an emergency fund earning 3%. Should I use some of my emergency fund to pay down the debt?",
      "Is it better to lease or buy a car if I drive about 12,000 miles per year and tend to get a new vehicle every 4 years?",
      "How much of my income should I be putting toward retirement if I'm 35 and have only $30,000 saved so far? I make $70,000 per year."
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  // Generate realistic spending habits data
  const generateSpendingHabitsData = () => {
    const data = [
      "My monthly spending typically includes: Rent $1,400, Groceries $450, Restaurants $350, Utilities $180, Car payment $320, Insurance $140, Student loans $260, Entertainment $200, Shopping $300, Savings $400.",
      "I track my expenses and spend roughly the following each month: Housing $1,800, Food $600, Transportation $400, Insurance $200, Subscriptions $80, Healthcare $150, Personal care $100, Debt payments $500, Savings $300.",
      "Here's my typical budget: $1,200 on mortgage, $500 on food, $300 on car expenses, $200 on utilities, $150 on phone/internet, $400 on entertainment and eating out, $100 on subscriptions (Netflix, Spotify, etc.), and I try to save $600 monthly.",
      "I'm spending too much on recurring subscriptions: Netflix $15.99, Disney+ $7.99, Spotify $9.99, Amazon Prime $14.99, Gym $45, HBO Max $14.99, New York Times $17, Adobe $52.99, Internet $65, Phone $85."
    ];
    
    return data[Math.floor(Math.random() * data.length)];
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Financial Prediction</h1>

      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
          <CardDescription>Submit financial information to get AI-powered insights and predictions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* //TODO: FIX(UI): fix grid cols to match # of active triggers */}
            <TabsList className="grid w-full grid-cols-3">
              {/* <TabsTrigger value="image" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>Image</span>
              </TabsTrigger> */}
              <TabsTrigger value="tweet" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Financial Question</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Purchase Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <MailWarning className="h-4 w-4" />
                <span>Spending Habits</span>
              </TabsTrigger>
            </TabsList>

            {/* <TabsContent value="image" className="mt-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center">
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-medium mb-2">Selected file:</p>
                    <p className="text-sm text-gray-500">{selectedFile.name}</p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="mt-2">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mb-4 text-gray-400" />
                    <p className="text-sm font-medium mb-1">Drag and drop an image, or click to browse</p>
                    <p className="text-xs text-gray-500 mb-4">Supports JPG, PNG, GIF up to 10MB</p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" className="cursor-pointer" asChild>
                        <span>Browse files</span>
                      </Button>
                    </label>
                  </>
                )}
              </div>
            </TabsContent> */}

            <TabsContent value="text" className="mt-6">
              <Textarea
                placeholder="Describe a purchase you're considering (e.g. 'I'm thinking of buying a $1,200 laptop for work')..."
                className="min-h-[200px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Transaction will be analyzed to predict financial impact and provide recommendations.
              </p>
            </TabsContent>
            <TabsContent value="email" className="mt-6">
              <Textarea
                placeholder="Describe your spending patterns (e.g. 'I spend about $300 on groceries, $100 on restaurants, and $200 on entertainment monthly')..."
                className="min-h-[200px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Your spending habits will be analyzed to identify patterns and optimization opportunities.
              </p>
              <div className="mt-6">
                <Textarea
                  placeholder="Include custom instructions (e.g., 'Focus on reducing entertainment expenses', 'Help me save for a vacation', 'Identify recurring subscriptions')"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These instructions will guide the financial analysis.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tweet" className="mt-6">
              <Textarea
                placeholder="Ask a financial question (e.g. 'Should I pay off my credit card or invest in my 401k?', 'Is it better to lease or buy a car?')..."
                className="min-h-[150px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Get personalized financial advice based on your specific situation.
              </p>
              <div className="mt-6">
                <Textarea
                  placeholder="Include context about your financial situation (e.g., 'I have $5,000 in credit card debt at 18% APR and can invest in a 401k with 5% employer match')"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Additional context will help provide more accurate financial advice.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {isUploading && (
            <div className="mt-6">
              <UploadProgress progress={uploadProgress} />
            </div>
          )}
          
          {/* Display financial results */}
          {financialResult && !isUploading && (
            <div className="mt-6 p-4 border rounded-md bg-muted">
              <h3 className="font-medium mb-2">Financial Analysis Results</h3>
              <div className="prose max-w-none text-sm">
                {/* Different display based on tab type */}
                {activeTab === "text" && financialResult.recommendation && (
                  <div>
                    <p className={`font-bold ${
                      financialResult.recommendation === "recommended" ? "text-green-600" :
                      financialResult.recommendation === "acceptable" ? "text-blue-600" :
                      financialResult.recommendation === "caution" ? "text-amber-600" :
                      "text-red-600"
                    }`}>
                      Purchase is {financialResult.recommendation.toUpperCase()}
                    </p>
                    <p className="mt-2">{financialResult.reasoning}</p>
                    {financialResult.impact && <p className="mt-2"><strong>Impact:</strong> {financialResult.impact}</p>}
                    {financialResult.budgetImpact && (
                      <p className="mt-2">
                        <strong>Budget Impact:</strong> {financialResult.budgetImpact}
                      </p>
                    )}
                    {financialResult.futureProjections && (
                      <p className="mt-2">
                        <strong>Future Projection:</strong> {financialResult.futureProjections}
                      </p>
                    )}
                    {financialResult.alternatives && financialResult.alternatives.length > 0 && (
                      <div className="mt-2">
                        <strong>Alternatives to consider:</strong>
                        <ul className="mt-1 ml-5 list-disc">
                          {financialResult.alternatives.map((alt: string, i: number) => (
                            <li key={i}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === "tweet" && (
                  <div>
                    <p>{financialResult.advice || JSON.stringify(financialResult, null, 2)}</p>
                  </div>
                )}
                
                {activeTab === "email" && financialResult.habits && (
                  <div>
                    <h4 className="font-medium">Spending Patterns:</h4>
                    <ul className="ml-5 list-disc mt-2">
                      {financialResult.habits.map((habit: any, i: number) => (
                        <li key={i}>
                          <strong>{habit.merchant || habit.category}:</strong> {habit.recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Fallback if the result structure doesn't match expectations */}
                {(!financialResult.recommendation && !financialResult.advice && !financialResult.habits) && (
                  <pre className="text-xs overflow-auto max-h-[300px] p-2 bg-gray-100 rounded">
                    {JSON.stringify(financialResult, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <div className="flex space-x-4">
          <Button variant="secondary" onClick={handleSample} disabled={isUploading}>
            {isUploading ? "Analyzing..." : "Simulate"}
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? "Analyzing..." : "Commit Decision"}
          </Button>
          </div>
        </CardFooter>
      </Card>
      {/* {latestResult && <AnalysisResultCard {...latestResult} />}
        {resultHistory.length > 0 && (
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Past Analyses</h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {resultHistory.map((r, idx) => (
                    <AnalysisResultCard key={idx} {...r} />
                ))}
                </div>
                <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                    setResultHistory([])
                    localStorage.removeItem("classificationHistory")
                }}
                >
                    Clear History
                </Button>

            </div>
        )} */}
    </div>
  )
}
