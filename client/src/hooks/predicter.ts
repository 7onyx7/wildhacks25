// API helper utilities
const DEBUG = false; // Disabled in production

// API configuration
const USE_TEST_DATA = false; // Using real API endpoints

// Only log in debug mode
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[API Debug]', ...args);
  }
}

// Define interface for the return type
// interface AnalysisResult {
//   summary: string;
//   details: any;
//   status: "success" | "error";
// }

export async function predictTimeline(
    fileOrText: File | string,
    contentType: string,
    instructions?: string
  ) {
    debugLog("Generating financial analysis with:", { contentType, instructionsLength: instructions?.length });
    
    try {
      // Get API base URL from environment variables or use default
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      debugLog("Using API base URL:", API_BASE_URL);
      
      // If we're using test data, just call that endpoint directly
      if (USE_TEST_DATA) {
        debugLog("Using test data endpoint");
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/finance/test-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contentType, text: typeof fileOrText === 'string' ? fileOrText : '' })
          });
          
          if (!response.ok) {
            throw new Error(`Test data API error: ${response.status}`);
          }
          
          const result = await response.json();
          debugLog("Test data response:", result);
          
          return {
            summary: result.data.summary || "Analysis completed",
            details: result.data,
            status: "success",
          };
        } catch (testError) {
          debugLog("Error using test data endpoint:", testError);
          // Continue with regular endpoints if test data fails
        }
      }
      
      // Create request data based on content type
      let requestData: any = {};
      let endpoint = '';
      
      if (contentType === "text") {
        // For general text analysis - treat as spending habits
        endpoint = `${API_BASE_URL}/api/finance/spending-habits`;
        requestData = {
          spendingDescription: fileOrText,
          financialGoals: instructions || "Improve financial stability"
        };
      } else if (contentType === "tweet" || contentType === "email") {
        // For tweet/email - get financial advice
        endpoint = `${API_BASE_URL}/api/finance/advice`;
        const questionText = typeof fileOrText === 'string' ? fileOrText : "";
        const contextText = instructions || "";
        
        requestData = {
          question: questionText,
          userContext: contextText
        };
      } else {
        return {
          summary: "Unsupported content type. Please use text, tweet, or email.",
          details: { error: "Unsupported content type" },
          status: "error",
        };
      }
      
      debugLog(`Making request to ${endpoint}`);
      debugLog("Request payload:", JSON.stringify({ data: requestData }));
      
      // Make the API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: requestData })
      });
      
      if (!response.ok) {
        debugLog(`API error: ${response.status} - ${response.statusText}`);
        
        // Try to get more error details if available
        let errorDetails = "";
        try {
          const errorBody = await response.text();
          errorDetails = ` - ${errorBody}`;
          debugLog("Error response body:", errorBody);
        } catch (e) {
          // Ignore error reading body
          debugLog("Could not read error response body");
        }
        
        throw new Error(`API error: ${response.status}${errorDetails}`);
      }
      
      // Process successful response
      const result = await response.json();
      debugLog("API response status:", response.status);
      debugLog("API response data structure:", JSON.stringify(result.data, null, 2));
      
      if (!result.data) {
        throw new Error("API response missing data field");
      }
      
      // Create a consistent return format regardless of endpoint
      if (contentType === "text") {
        // For text content (spending habits)
        // Ensure all fields from the API are preserved
        const returnData = {
          summary: result.data.summary ? result.data.summary : "Analysis completed",
          details: result.data,
          status: "success",
        };
        debugLog("Returning data:", returnData);
        return returnData;
      } else {
        // For tweet/email (financial advice)
        // Ensure all advice fields are exposed
        const returnData = {
          summary: result.data.advice ? result.data.advice : 
                  (typeof result.data === 'string' ? result.data : "Advice generated"),
          details: result.data,
          status: "success",
        };
        debugLog("Returning data:", returnData);
        return returnData;
      }
      
    } catch (error) {
      debugLog("Error in financial analysis:", error);
      
      // If we encounter an error and we're not already using test data,
      // try to fallback to the test data endpoint
      if (!USE_TEST_DATA) {
        debugLog("Falling back to test data endpoint after error");
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const response = await fetch(`${API_BASE_URL}/api/finance/test-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fallback: true })
          });
          
          if (response.ok) {
            const result = await response.json();
            return {
              summary: `[Test Data] ${result.data.summary || "Analysis completed"}`,
              details: result.data,
              status: "success",
            };
          }
        } catch (fallbackError) {
          debugLog("Error in fallback to test data:", fallbackError);
        }
      }
      
      return {
        summary: `Error generating financial analysis: ${error instanceof Error ? error.message : String(error)}`,
        details: { error: error instanceof Error ? error.message : String(error) },
        status: "error",
      };
    }
  }
  