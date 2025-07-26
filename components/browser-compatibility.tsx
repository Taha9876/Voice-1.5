"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function BrowserCompatibility() {
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false)
  const [isSpeechSynthesisSupported, setIsSpeechSynthesisSupported] = useState(false)

  useEffect(() => {
    setIsSpeechRecognitionSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    setIsSpeechSynthesisSupported("speechSynthesis" in window)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser Compatibility</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This application relies on the Web Speech API, which has varying support across browsers.
        </p>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            {isSpeechRecognitionSupported ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm">Speech Recognition (Microphone Input)</span>
          </div>
          <div className="flex items-center gap-2">
            {isSpeechSynthesisSupported ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-sm">Speech Synthesis (Voice Output)</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          **Recommended Browser:** Google Chrome offers the most comprehensive and reliable support for the Web Speech
          API. Other browsers like Microsoft Edge also have good support. Firefox and Safari have limited or no support
          for Speech Recognition.
        </p>
      </CardContent>
    </Card>
  )
}
