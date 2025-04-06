"use client"

// import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquareWarning, Twitter, MailWarning } from "lucide-react"
import { toast } from "sonner"
import UploadProgress from "@/components/upload-progress"
import { predictTimeline } from "@/hooks/predicter"
import axios from "axios"

// Financial analysis result interface
interface FinancialAnalysisResult {
  summary: string;
  details: any;  // Always include details (can be an empty object if needed)
  status: "success" | "error";
}

// API connectivity check function
async function testApiConnection() {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    console.log("Testing API connection to:", API_BASE_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/finance/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`API connection test failed: ${response.status} - ${response.statusText}`);
        try {
          const errorText = await response.text();
          console.error("Error response body:", errorText);
        } catch (e) {
          // Ignore error reading body
        }
        return false;
      }
      
      const result = await response.json();
      console.log("API connection test result:", result);
      return true;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error("API connection test timed out after 5 seconds");
      } else {
        console.error("API connection fetch error:", fetchError);
      }
      return false;
    }
  } catch (error) {
    console.error("API connection test error:", error);
    return false;
  }
}

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("analyze")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [textContent, setTextContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const [analysisResult, setAnalysisResult] = useState<FinancialAnalysisResult | null>(null)
  const [simulationContent, setSimulationContent] = useState("")
  const [simulationResult, setSimulationResult] = useState<any>(null)

  // Add useEffect to test API connection on component mount
  useEffect(() => {
    testApiConnection().then(isConnected => {
      if (isConnected) {
        console.log("✅ Backend API connection successful");
      } else {
        console.error("❌ Backend API connection failed - financial analysis features may not work");
        toast.error("API Connection Issue", {
          description: "There seems to be a problem connecting to the backend API. Financial analysis features may not work properly.",
        });
      }
    });
  }, []);

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

  const handleAnalyzeFinancialData = async () => {
    setAnalysisResult(null);
    
    const progressInterval = simulateUploadProgress();

    try {
      if (!textContent.trim()) {
        toast.error("No content provided", {
          description: "Please enter your financial information to analyze",
        });
        clearInterval(progressInterval);
        setIsUploading(false);
        return;
      }

      toast.loading("Analyzing your financial data", {
        description: "This might take a few moments...",
      });

      const result = await predictTimeline(textContent, "text", instructions);
      
      setAnalysisResult({
        summary: result.summary,
        details: result.details || {},
        status: result.status as "success" | "error"
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        
        if (result.status === "success") {
          // Extract financial outcomes or action steps for toast display
          let actionSteps = [];
          if (result.details.actionSteps && Array.isArray(result.details.actionSteps)) {
            actionSteps = result.details.actionSteps.slice(0, 2);
          }
          
          // Extract spending habits for toast display
          let habits = [];
          if (result.details.habits && Array.isArray(result.details.habits)) {
            habits = result.details.habits.slice(0, 2);
          }
          
          // Extract potential savings if available
          let savingsText = "";
          if (result.details.monthlySavingsPotential) {
            savingsText = result.details.monthlySavingsPotential;
          }
          
          // Create a concise outcome summary
          const shortSummary = result.summary.length > 100 
            ? result.summary.substring(0, 100) + '...' 
            : result.summary;
          
          // Show a beautiful toast with key financial outcomes
          toast("Financial Forecast", {
            description: (
              <div className="space-y-3">
                <p className="font-medium text-blue-800">{shortSummary}</p>
                
                {habits.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm mb-1">Key Spending Areas:</p>
                    <div className="bg-blue-50 rounded-md p-2 text-sm">
                      {habits.map((habit: any, index: number) => (
                        <div key={index} className="mb-1 last:mb-0">
                          <span className="font-medium text-blue-700">{habit.category}: </span>
                          {habit.potentialSavings && (
                            <span className="text-green-600 font-medium">Save {habit.potentialSavings}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {actionSteps.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-sm mb-1">Next Steps:</p>
                    <ul className="bg-green-50 rounded-md p-2 list-disc pl-5 text-sm text-green-800">
                      {actionSteps.map((step: string, index: number) => (
                        <li key={index}>{step.length > 60 ? step.substring(0, 60) + '...' : step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {savingsText && (
                  <div className="bg-purple-50 border border-purple-100 rounded-md p-2 mt-2">
                    <p className="text-sm font-medium text-purple-800">
                      <span className="mr-1">💰</span> Potential monthly savings: {savingsText}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Scroll down for full analysis</p>
                </div>
              </div>
            ),
            duration: 8000, // Show for 8 seconds to give time to read
          });
        } else {
          toast.error("Analysis Issue", {
            description: `Error: ${result.summary}`,
          });
        }
      }, 500);
    } catch (err) {
      console.error("Analysis failed:", err);
      clearInterval(progressInterval);
      setIsUploading(false);

      toast.error("Analysis failed", {
        description: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
    }
  };

  const handleLoadSampleFinancialData = async () => {
    try {
      setIsUploading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Map the active tab to a scenario type
      let scenarioType = 'budget';
      if (activeTab === 'tweet') scenarioType = 'advice';
      if (activeTab === 'email') scenarioType = 'investment';

      const response = await fetch(`${API_BASE_URL}/api/finance/generate-scenario?type=${scenarioType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get scenario: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.data && result.data.scenario) {
        setTextContent(result.data.scenario);
        toast.success("Sample scenario generated", {
          description: "You can now analyze this financial scenario",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error getting sample data:", error);
      
      // Fallback to static samples if API fails
      if (activeTab === "tweet") {
        setTextContent("I just received a $5,000 bonus at work. What's the best way to use this money considering I have $10,000 in student loans with 5% interest and $2,000 in credit card debt at 18% interest?");
      } else if (activeTab === "text") {
        setTextContent("My monthly income is $4,500. Current expenses: $1,200 rent, $400 car payment, $300 groceries, $200 utilities, $150 insurance, $300 dining out, $150 entertainment. I want to save for a house down payment in 2 years.");
      } else if (activeTab === "email") {
        setTextContent("I've been offered a job with a base salary of $85,000 plus a 10% annual bonus target and stock options vesting over 4 years valued at approximately $40,000. My current job pays $78,000 with no bonus, but has better health benefits that would save me about $2,400 per year. The new job requires a longer commute that would cost an additional $1,800 annually in transportation. Should I take the new job?");
      }
      
      toast("Using offline sample", {
        description: "Connected to offline sample data",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Render the financial analysis results card
  const renderAnalysisResult = () => {
    if (!analysisResult) return null;
    
    return (
      <Card>
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl">Financial Analysis Results</CardTitle>
          <CardDescription>
            {analysisResult.status === "success" 
              ? "Personalized insights based on your information" 
              : "There was an issue analyzing your information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="text-lg font-medium p-3 bg-blue-50 rounded-md border border-blue-100">
              {analysisResult.summary}
            </div>
            
            {analysisResult.status === "error" && (
              <div className="p-3 text-red-600 bg-red-50 rounded-md border border-red-100">
                <p>Error: {analysisResult.details?.error || "Unknown error"}</p>
              </div>
            )}
            
            {analysisResult.status === "success" && (
              <div className="space-y-5">
                {analysisResult.details?.reasoning && (
                  <div className="p-4 rounded-md border bg-white">
                    <h3 className="text-base font-semibold mb-2 text-gray-800">Analysis</h3>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {analysisResult.details.reasoning}
                    </div>
                  </div>
                )}
                
                {analysisResult.details?.actionSteps && Array.isArray(analysisResult.details.actionSteps) && 
                analysisResult.details.actionSteps.length > 0 && (
                  <div className="p-4 rounded-md border bg-blue-50">
                    <h3 className="text-base font-semibold mb-2 text-blue-800">Recommended Actions</h3>
                    <ul className="space-y-2">
                      {analysisResult.details.actionSteps.map((step: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-200 text-blue-800 h-5 w-5 text-xs mr-2 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm text-blue-900">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysisResult.details?.pros && analysisResult.details?.cons && 
                Array.isArray(analysisResult.details.pros) && Array.isArray(analysisResult.details.cons) && (
                  <div className="md:grid md:grid-cols-2 md:gap-4 space-y-3 md:space-y-0">
                    {/* Pros */}
                    <div className="p-4 rounded-md border bg-green-50">
                      <h3 className="text-base font-semibold mb-2 text-green-800">Benefits</h3>
                      <ul className="space-y-2">
                        {analysisResult.details.pros.map((pro: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span className="text-sm text-green-900">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Cons */}
                    <div className="p-4 rounded-md border bg-amber-50">
                      <h3 className="text-base font-semibold mb-2 text-amber-800">Considerations</h3>
                      <ul className="space-y-2">
                        {analysisResult.details.cons.map((con: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-600 mr-2">!</span>
                            <span className="text-sm text-amber-900">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {analysisResult.details?.habits && Array.isArray(analysisResult.details.habits) && 
                analysisResult.details.habits.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-800">Spending Analysis</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysisResult.details.habits.map((habit: any, index: number) => (
                        <div key={index} className="p-3 rounded-md border bg-gray-50 hover:bg-gray-100 transition-colors">
                          <h4 className="font-medium text-sm text-gray-900">{habit.category}</h4>
                          {habit.recommendation && (
                            <p className="text-sm mt-2 text-gray-700 whitespace-pre-line">{habit.recommendation}</p>
                          )}
                          {habit.potentialSavings && (
                            <p className="mt-2 text-sm font-medium text-green-600">
                              Potential savings: {habit.potentialSavings}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysisResult.details?.overallRecommendation && (
                  <div className="p-4 rounded-md border bg-blue-50">
                    <h3 className="text-base font-semibold mb-2 text-blue-800">Summary</h3>
                    <p className="text-sm text-blue-900 whitespace-pre-line">{analysisResult.details.overallRecommendation}</p>
                    
                    {analysisResult.details?.monthlySavingsPotential && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-md inline-block">
                        <p className="text-sm font-semibold text-blue-900">
                          Potential monthly savings: {analysisResult.details.monthlySavingsPotential}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset any results when switching tabs
    if (value === "analyze") {
      setSimulationResult(null);
    } else if (value === "simulate") {
      setAnalysisResult(null);
    }
  };

  // Get the API URL from the environment or use localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Add a dedicated handler for the Simulate button
  const handleSimulateBudget = async () => {
    if (!simulationContent.trim()) {
      toast.error("Missing Content", {
        description: "Please enter financial information for simulation",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      toast.loading("Running budget simulation", {
        description: "Creating personalized budget scenarios..."
      });
      
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await axios.post(`${API_URL}/api/finance/simulate`, {
        text: simulationContent,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data) {
        setSimulationResult(response.data);
        toast.success("Budget scenarios generated successfully");
      } else {
        toast.error("Failed to generate budget scenarios");
      }
    } catch (error) {
      console.error("Budget simulation error:", error);
      toast.error("Error generating budget scenarios");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Add a dedicated handler for the Generate Random Scenario button
  const handleGenerateRandomBudgetScenario = async () => {
    setIsUploading(true);
    setUploadProgress(20);

    try {
      toast.loading("Generating random scenario", {
        description: "Creating a financial scenario for simulation..."
      });
      
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 15;
        });
      }, 400);

      const response = await axios.get(`${API_URL}/api/finance/random-scenario`);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data) {
        setSimulationContent(response.data.scenario || "");
        toast.success("Random scenario generated");
      } else {
        toast.error("Failed to generate random scenario");
      }
    } catch (error) {
      console.error("Random scenario generation error:", error);
      toast.error("Error generating random scenario");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Financial Analysis</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="analyze">Analysis</TabsTrigger>
          <TabsTrigger value="simulate">Budget Simulator</TabsTrigger>
        </TabsList>

        {/* Analysis Tab Content */}
        <TabsContent value="analyze">
          <Card className="mb-6">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl">Financial Analysis</CardTitle>
              <CardDescription>Submit text for financial analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <Textarea
                  placeholder="Enter your financial information, text messages, emails, or any other content for analysis..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <UploadProgress progress={uploadProgress} className="mt-4" />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    id="analyze-financial-data-button" 
                    onClick={handleAnalyzeFinancialData} 
                    disabled={isUploading || !textContent.trim()}
                  >
                    {isUploading ? "Analyzing..." : "Analyze"}
                  </Button>
                  <Button
                    id="load-sample-financial-data-button"
                    variant="outline"
                    onClick={handleLoadSampleFinancialData} 
                    disabled={isUploading}
                  >
                    Sample Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {analysisResult && renderAnalysisResult()}
        </TabsContent>

        {/* Simulation Tab Content */}
        <TabsContent value="simulate">
          <Card>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl">Budget Simulator</CardTitle>
              <CardDescription>
                Simulate different budget scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4">
                <Textarea
                  placeholder="Enter your current financial situation to generate budget scenarios..."
                  value={simulationContent}
                  onChange={(e) => setSimulationContent(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    id="simulate-budget-button"
                    onClick={handleSimulateBudget} 
                    disabled={isUploading}
                  >
                    {isUploading ? "Simulating..." : "Simulate"}
                  </Button>
                  <Button
                    id="generate-random-scenario-button"
                    variant="outline"
                    onClick={handleGenerateRandomBudgetScenario}
                    disabled={isUploading}
                  >
                    Generate Random Scenario
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulation Results */}
          {simulationResult && (
            <Card className="mt-6">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xl">Budget Simulation Results</CardTitle>
                <CardDescription>
                  Explore possible budget scenarios based on your information
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {simulationResult.scenarios && simulationResult.scenarios.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {simulationResult.scenarios.map((scenario: any, index: number) => (
                        <div key={index} className="p-4 rounded-md border hover:bg-gray-50 transition-colors">
                          <h3 className="text-base font-semibold text-gray-800 mb-2">
                            {scenario.name || `Scenario ${index + 1}`}
                          </h3>
                          <div className="space-y-3">
                            {scenario.description && (
                              <p className="text-sm text-gray-700">{scenario.description}</p>
                            )}
                            {scenario.monthlyBudget && (
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <p className="font-medium">Monthly Budget:</p>
                                <p className="text-right">{scenario.monthlyBudget}</p>
                                
                                {scenario.savings && (
                                  <>
                                    <p className="font-medium">Monthly Savings:</p>
                                    <p className="text-right text-green-600">{scenario.savings}</p>
                                  </>
                                )}
                                
                                {scenario.expenses && (
                                  <>
                                    <p className="font-medium">Monthly Expenses:</p>
                                    <p className="text-right">{scenario.expenses}</p>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {scenario.budgetItems && scenario.budgetItems.length > 0 && (
                              <div className="mt-3">
                                <p className="font-medium text-sm mb-2">Budget Breakdown:</p>
                                <ul className="space-y-1 text-sm">
                                  {scenario.budgetItems.map((item: any, idx: number) => (
                                    <li key={idx} className="flex justify-between">
                                      <span>{item.category}</span>
                                      <span>{item.amount}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {scenario.impact && (
                              <div className="p-2 bg-blue-50 rounded-md mt-3">
                                <p className="text-sm text-blue-800">{scenario.impact}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No scenarios generated. Please try again.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
