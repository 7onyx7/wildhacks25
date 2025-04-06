"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

type Prediction = {
  title: string
  date: string
  timeframe: string // "1 Week", "1 Month", etc.
  status: "upcoming" | "adjusted" | "completed"
}

export default function ResultsHistoryPage() {
  const [history, setHistory] = useState<Prediction[]>([])

  // Placeholder data — replace with real fetch when backend is ready
  useEffect(() => {
    const dummyData: Prediction[] = [
      {
        title: "Projected savings milestone of $5,000",
        date: "2025-04-15",
        timeframe: "1 Month",
        status: "upcoming",
      },
      {
        title: "Expected salary deposit of $3,200",
        date: "2025-04-01",
        timeframe: "1 Week",
        status: "completed",
      },
      {
        title: "Vacation fund reaches $1,000",
        date: "2026-01-01",
        timeframe: "1 Year",
        status: "upcoming",
      },
    ]

    setHistory(dummyData)
  }, [])

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-center mb-6">📊 Financial Timeline History</h1>

      <ScrollArea className="max-h-[600px] pr-2 space-y-6">
        {history.map((item, i) => (
          <Card key={i}>
            <CardHeader className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  Timeframe: {item.timeframe}
                </CardDescription>
              </div>
              <CalendarDays className="text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-sm flex justify-between text-muted-foreground">
              <span>Target Date: {item.date}</span>
              <span
                className={`font-medium ${
                  item.status === "completed"
                    ? "text-green-600"
                    : item.status === "adjusted"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
              >
                {item.status.toUpperCase()}
              </span>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>

      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => {
            setHistory([])
            // Later: also delete from backend/localStorage
          }}
        >
          Clear History
        </Button>
      </div>
    </div>
  )
}
