"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { initializeStorage, debugStorage } from "@/lib/storage"

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Set progress to 10%
        setProgress(10)

        // Initialize localStorage
        console.log("Initializing storage...")
        initializeStorage()

        // Set progress to 30%
        setProgress(30)

        // Debug storage state
        console.log("Checking storage state...")
        debugStorage()

        // Set progress to 50%
        setProgress(50)

        // Simulate additional loading time
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Complete loading
        setProgress(100)
        setLoading(false)
      } catch (err) {
        console.error("Error initializing app:", err)
        setError("Failed to initialize application. Please refresh the page.")
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleEnterSystem = () => {
    // Double-check storage before proceeding
    try {
      debugStorage()
      onComplete()
    } catch (err) {
      console.error("Error entering system:", err)
      setError("Failed to access storage. Please check your browser settings.")
    }
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="w-full max-w-md px-8 py-12 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">ExBASe</h1>
        <p className="text-muted-foreground mb-8 text-center">Evidence-Based Arrest System</p>

        {error ? (
          <div className="w-full space-y-4">
            <div className="p-4 bg-destructive/15 text-destructive rounded-md text-sm">{error}</div>
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
          </div>
        ) : loading ? (
          <div className="w-full space-y-4">
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Loading system data...</span>
            </div>
          </div>
        ) : (
          <Button size="lg" onClick={handleEnterSystem} className="mt-4">
            Enter System
          </Button>
        )}
      </div>
    </div>
  )
}

