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
      Upload,
      CircleDollarSign,
      Calendar} from "lucide-react"
// import { predictTimeline } from "@/hooks/predicter"
import { useToast } from "@/hooks/use-toast";
import UploadProgress from "@/components/upload-progress"
// import { sampleTweets } from "@/data/sampleTweets"
// import AnalysisResultCard, { AnalysisResultProps } from "@/components/analysis-results-card"


interface TransactionPayload {
  itemName: string;
  price: number;
  reason: string;
  description: string;
  link?: string;
  instructions?: string;
}


export default function UploadPage() {
  const [activeTab, setActiveTab] = useState("file")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [textContent, setTextContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const { toast } = useToast()
//   const [latestResult, setLatestResult] = useState<AnalysisResultProps | null>(null)
//   const [resultHistory, setResultHistory] = useState<AnalysisResultProps[]>([])
const [itemName, setItemName] = useState("");
const [price, setPrice] = useState<number | null>(null);
const [reason, setReason] = useState("");
const [description, setDescription] = useState("");
const [link, setLink] = useState("");




  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }


// Load history on mount
// useEffect(() => {
//     const stored = localStorage.getItem("classificationHistory")
//     if (stored) {
//       setResultHistory(JSON.parse(stored))
//     }
//   }, [])

// // Save history on change
//   useEffect(() => {
//     localStorage.setItem("classificationHistory", JSON.stringify(resultHistory))
//   }, [resultHistory])
  




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

  // const handleUpload = async () => {
  //   const progressInterval = simulateUploadProgress()

  //   try {
  //       let content: string | File | undefined
  //       let contentType: "tweet" | "text" | "email" | "file" | undefined

  //     if (activeTab === "file") {
  //       if (!selectedFile) {
  //         toast({
  //           title: "No file selected",
  //           description: "Please choose a file to upload",
  //           variant: "destructive",
  //         })
  //         clearInterval(progressInterval)
  //         setIsUploading(false)
  //         return
  //       }
  //       content = selectedFile
  //       contentType = "file"
  //     } else if (activeTab === "text" || activeTab === "tweet") {
  //       if (!textContent.trim()) {
  //         toast({
  //           title: "No content provided",
  //           description: `Please enter some ${activeTab} content to analyze`,
  //           variant: "destructive",
  //         })
  //         clearInterval(progressInterval)
  //         setIsUploading(false)
  //         return
  //       }
  //       content = textContent
  //       contentType = activeTab as "text" | "tweet" | "email"
  //   }


  //   if (typeof content !== "string" || !contentType || contentType === "file") {
  //       toast({
  //         title: "Unsupported content",
  //         description: "Only text, tweet, and email are supported for now.",
  //         variant: "destructive",
  //       })
  //       clearInterval(progressInterval)
  //       setIsUploading(false)
  //       return
  //     }
  

  //     //TODO: FIX(API): fix api call and replace w transformer
  //   //   const result = await predictTimeline(content, contentType)
  //   //   setLatestResult({
  //   //     inputText: content,
  //   //     label: result.label as "malicious" | "neutral" | "informational" | "safe" | "error",
  //   //     confidence: result.confidence,
  //   //     type: contentType,
  //   //     timestamp: new Date().toISOString(),
  //   //   })

  //   //   const newResult: AnalysisResultProps = {
  //   //     inputText: content,
  //   //     label: result.label as "malicious" | "neutral" | "informational" | "safe" | "error",
  //   //     confidence: result.confidence,
  //   //     type: contentType,
  //   //     timestamp: new Date().toISOString(),
  //   //   }
      
  //   //   setLatestResult(newResult)
  //   //   setResultHistory((prev) => [newResult, ...prev])
      


  //   //   toast({
  //   //     title: `Threat Level: ${result.label.toUpperCase()}`,
  //   //     description: `Confidence: ${(result.confidence * 100).toFixed(1)}%`,
  //   //     variant: result.label === "malicious" ? "destructive" : "default",
  //   //   })
      
  //     // Ensure progress completes
  //     setTimeout(() => {
  //       clearInterval(progressInterval)
  //       setUploadProgress(100)

  //       setTimeout(() => {
  //         setIsUploading(false)
  //         setSelectedFile(null)
  //         setTextContent("")

  //         toast({
  //           title: "Upload successful",
  //           description: "Your content has been submitted for moderation",
  //         })
  //       }, 500)
  //     }, 1000)
  //   } catch (err) {
  //       console.error("Upload failed:", err)
  //     clearInterval(progressInterval)
  //     setIsUploading(false)

  //     toast({
  //       title: "Upload failed",
  //       description: "There was an error uploading your content",
  //       variant: "destructive",
  //     })
  //   }
  // }

  const handleUpload = async () => {
    const progressInterval = simulateUploadProgress();
    try {
      if (!itemName || price === null || !reason || !description) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields (item, price, reason, description).",
          variant: "destructive",
        });
        clearInterval(progressInterval);
        setIsUploading(false);
        return;
      }
  
      const payload: TransactionPayload = {
        itemName,
        price,
        reason,
        description,
        link,
        instructions,
      };
  
      const response = await fetch("http://localhost:3000/api/gemini/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
      console.log("Prediction result:", result);
  
      // Show toast or update state as needed
      toast({
        title: "Prediction Complete",
        description: "Gemini processed the transaction and updated your timeline.",
      });
  
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setItemName("");
          setPrice(null);
          setReason("");
          setDescription("");
          setLink("");
          setInstructions("");
        }, 500);
      }, 1000);
    } catch (err) {
      console.error("Upload failed:", err);
      clearInterval(progressInterval);
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "There was an error processing the transaction.",
        variant: "destructive",
      });
    }
  };
  

  const handleSample = () => {
    // const random = sampleTweets[Math.floor(Math.random() * sampleTweets.length)]
    console.log("Sample data filled")
    // setTextContent(random.text)
    handleUpload()
  }
  

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Input an expense or income</h1>

      <Card>
        <CardHeader>
          <CardTitle>ForeCache Finances</CardTitle>
          <CardDescription>Input a transaction or upload a collection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* //TODO: FIX(UI): fix grid cols to match # of active triggers */}
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>File</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4" />
                <span>Transactions</span>
              </TabsTrigger>
              <TabsTrigger value="lifestyle" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
                <span>Lifestyle</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-6">
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
                    <p className="text-sm font-medium mb-1">Drag and drop a file, or browse file explorer</p>
                    <p className="text-xs text-gray-500 mb-4">Supports PDF, Docx, and Excel up to 10MB</p>
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
              <div className="mt-6">
                <Textarea
                  placeholder="Provide any info you'd like Gemini to know about these transactions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These transactions will be added to your financial context.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="mt-6">
              <Textarea
                placeholder="Current ForeCache"
                className="min-h-[200px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Transaction will be analyzed to predict financial future.
              </p>
              <div className="mt-6">
              <Textarea
                placeholder="Item name"
                className="w-full mb-2 p-2 rounded border"
                value={itemName}
                onChange={(e) => setTextContent(e.target.value)}
              />

              <Textarea
                placeholder="Transaction Amount"
                className="w-full mb-2 p-2 rounded border"
                value={price ?? ""}
                onChange={(e) => setTextContent(e.target.value)}
              />

              <Textarea
                placeholder="Reason for purchase"
                className="w-full mb-2 p-2 rounded border"
                value={reason}
                onChange={(e) => setTextContent(e.target.value)}
              />

              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mb-2 p-2 rounded border"
              />

                <Textarea
                  placeholder="Link an item (e.g., Amazon product)"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full mb-2 p-2 rounded border"
                  />
                <p className="text-xs text-gray-500 mt-2">
                This transaction will be added to your financial context.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="lifestyle" className="mt-6">
              <Textarea
                placeholder="Add new lifestyle event to update predictions..."
                className="min-h-[50px]"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Event will be analyzed to predict financial future.
              </p>
              <div className="mt-6">
                <Textarea
                  placeholder="Briefly explain the lifestyle changes"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These instructions will be passed to Gemini to guide the summarization.
                </p>
              </div>
              <div className="mt-6">
                <Textarea
                  placeholder="How long do you estimate this lifestyle habbit will occurr ? "
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-2">
                Event will be analyzed to predict financial future.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {isUploading && (
            <div className="mt-6">
              <UploadProgress progress={uploadProgress} />
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
