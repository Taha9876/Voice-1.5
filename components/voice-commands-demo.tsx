"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Mic, StopCircle, RefreshCw } from "lucide-react"
import type SpeechRecognition from "web-speech-api"

interface VoiceCommandDemoProps {
  shopName: string
}

export default function VoiceCommandDemo({ shopName }: VoiceCommandDemoProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [groqTestMessage, setGroqTestMessage] = useState("")
  const [groqTestResponse, setGroqTestResponse] = useState("")
  const [commandResponse, setCommandResponse] = useState("")
  const [isGroqTesting, setIsGroqTesting] = useState(false)
  const [isCommandProcessing, setIsCommandProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false)

  useEffect(() => {
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
      setIsSpeechRecognitionSupported(true)
      recognitionRef.current = new SpeechRecognitionAPI()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setTranscript("")
        toast.info("Listening for commands...")
      }

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        setTranscript(speechResult)
        toast.success(`Heard: "${speechResult}"`)
        processVoiceCommand(speechResult)
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        toast.error(`Speech recognition error: ${event.error}`)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        toast.info("Stopped listening.")
      }
    } else {
      setIsSpeechRecognitionSupported(false)
      toast.error("Web Speech API is not supported in this browser. Please use Chrome or Edge.")
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening && isSpeechRecognitionSupported) {
      recognitionRef.current.start()
    } else if (!isSpeechRecognitionSupported) {
      toast.error("Speech recognition is not supported in your browser.")
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const testGroqConnection = async () => {
    setIsGroqTesting(true)
    setGroqTestResponse("")
    try {
      const response = await fetch("/api/groq-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: groqTestMessage }),
      })

      const data = await response.json()
      if (response.ok) {
        setGroqTestResponse(data.response)
        toast.success("Groq connection successful!")
      } else {
        setGroqTestResponse(`Error: ${data.error || "Unknown error"}`)
        toast.error(`Groq test failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error testing Groq connection:", error)
      setGroqTestResponse(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("Network error during Groq test.")
    } finally {
      setIsGroqTesting(false)
    }
  }

  const processVoiceCommand = async (command: string) => {
    setIsCommandProcessing(true)
    setCommandResponse("")
    try {
      const response = await fetch("/api/process-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command, shopName }),
      })

      const data = await response.json()
      if (response.ok) {
        setCommandResponse(JSON.stringify(data, null, 2))
        toast.success("Command processed successfully!")
      } else {
        setCommandResponse(`Error: ${data.error || "Unknown error"}`)
        toast.error(`Command processing failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error processing voice command:", error)
      setCommandResponse(`Network error: ${error instanceof Error ? error.message : String(error)}`)
      toast.error("Network error during command processing.")
    } finally {
      setIsCommandProcessing(false)
    }
  }

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Groq API Key & Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your Groq API key is securely managed on the server. For local development, ensure it's set in your
            `.env.local` file. For Vercel deployments, set it in your project's environment variables.
          </p>
          <Input placeholder="Groq API Key (Managed on Server)" type="password" readOnly value="********************" />
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Enter a message to test Groq connection (e.g., 'Hello Groq')"
              value={groqTestMessage}
              onChange={(e) => setGroqTestMessage(e.target.value)}
            />
            <Button onClick={testGroqConnection} disabled={isGroqTesting || !groqTestMessage}>
              {isGroqTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                "Test Groq Connection"
              )}
            </Button>
          </div>
          {groqTestResponse && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm break-words dark:bg-gray-800">
              <h4 className="font-semibold">Groq Response:</h4>
              <p>{groqTestResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Voice Command Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSpeechRecognitionSupported && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              <p>
                <strong>Warning:</strong> Web Speech API (Speech Recognition) is not fully supported in your browser.
                For the best experience, please use Google Chrome or Microsoft Edge.
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Click the microphone to start listening for commands. Try commands like "Go to products", "Search for
            t-shirts", or "Add Vintage T-Shirt to cart".
          </p>
          <div className="flex items-center gap-2">
            <Button onClick={startListening} disabled={isListening || !isSpeechRecognitionSupported}>
              <Mic className="h-4 w-4 mr-2" /> Start Listening
            </Button>
            <Button onClick={stopListening} disabled={!isListening} variant="destructive">
              <StopCircle className="h-4 w-4 mr-2" /> Stop Listening
            </Button>
            <Button onClick={() => setTranscript("")} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" /> Clear Transcript
            </Button>
          </div>
          {transcript && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm dark:bg-gray-800">
              <h4 className="font-semibold">Transcript:</h4>
              <p>{transcript}</p>
            </div>
          )}
          {isCommandProcessing && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Processing command...
            </div>
          )}
          {commandResponse && (
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-sm break-words whitespace-pre-wrap dark:bg-gray-800">
              <h4 className="font-semibold">Command Processed (JSON):</h4>
              <pre>{commandResponse}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
