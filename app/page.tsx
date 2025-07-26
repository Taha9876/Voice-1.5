"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import VoiceCommandDemo from "@/components/voice-commands-demo"
import { Toaster } from "sonner"
import type { SpeechRecognition } from "web-speech-api"

export default function VoiceShopifyAgent() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [shopifyUrl] = useState("https://cfcu5s-iu.myshopify.com") // Default Shopify URL
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connected" | "error">("connected")
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(true)
  const [pageContext, setPageContext] = useState(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check for speech recognition support with better fallbacks
    const checkSpeechSupport = () => {
      if (typeof window !== "undefined") {
        if ("webkitSpeechRecognition" in window) {
          return window.webkitSpeechRecognition
        } else if ("SpeechRecognition" in window) {
          return window.SpeechRecognition
        }
      }
      return null
    }

    const SpeechRecognitionAPI = checkSpeechSupport()

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        setTranscript(transcript)

        if (event.results[current].isFinal) {
          processVoiceCommand(transcript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }
    } else {
      console.warn("Speech recognition not supported in this browser")
      setIsSpeechRecognitionSupported(false)
    }

    // Initialize speech synthesis with fallback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis
    }

    // Get page context from extension if available
    // Note: This part is for the *Next.js app's* page, not the Shopify store.
    // The Shopify integration handles its own context.
    getPageContext()

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const getPageContext = async () => {
    // This function is primarily for the Next.js app's own context display.
    // The Shopify Liquid script handles context for the Shopify store itself.
    try {
      // Simulate getting context if running in a browser environment that supports it
      // For this Next.js app, we'll just set a default context
      setPageContext({
        url: typeof window !== "undefined" ? window.location.href : "server-side",
        pageType: "Next.js Demo Page",
        cartCount: 0, // Placeholder
      })
    } catch (error) {
      console.log("Could not get page context:", error)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript("")
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false)
      recognitionRef.current.stop()
    }
  }

  const speak = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      synthRef.current.speak(utterance)
    }
  }

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/process-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command,
          shopifyUrl,
          // groqApiKey is no longer sent from client
          pageContext, // This page context is for the Next.js demo page
        }),
      })

      const data = await response.json()
      setResponse(data.speech) // Assuming the API returns a 'speech' field
      speak(data.speech)

      // Execute the action(s) if provided (this would be simulated for the demo page)
      if (data.action) {
        console.log("Simulating action on demo page:", data.action)
      }
      if (data.followUp && Array.isArray(data.followUp)) {
        for (const action of data.followUp) {
          console.log("Simulating follow-up action on demo page:", action)
        }
      }
    } catch (error) {
      console.error("Error processing command:", error)
      const errorMsg = "Sorry, I encountered an error processing your command."
      setResponse(errorMsg)
      speak(errorMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const testConnection = async () => {
    try {
      setConnectionStatus("disconnected")
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopifyUrl,
          // groqApiKey is no longer sent from client
        }),
      })

      if (response.ok) {
        setConnectionStatus("connected")
        speak("Connection successful!")
      } else {
        setConnectionStatus("error")
        speak("Connection failed. Please check your settings.")
      }
    } catch (error) {
      setConnectionStatus("error")
      speak("Connection failed. Please check your settings.")
    }
  }

  const shopName = process.env.NEXT_PUBLIC_SHOPIFY_STORE_NAME || "Your Shopify Store"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Shopify Voice Automation</CardTitle>
          <CardDescription className="mt-2 text-lg text-muted-foreground">
            Automate your Shopify store with voice commands using Groq and the Web Speech API.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VoiceCommandDemo shopName={shopName} />
        </CardContent>
      </Card>
      <Toaster />
    </main>
  )
}
