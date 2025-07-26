import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { shopifyUrl } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key not configured on the server." }, { status: 500 })
    }

    // Test Groq connection by generating a simple text
    const { text } = await generateText({
      model: groq("llama3-8b-8192"), // Using a small, fast model for a quick test
      prompt: "Say 'hello' to confirm connection.",
    })

    if (text.toLowerCase().includes("hello")) {
      return NextResponse.json({ message: "Connection to Groq successful!", shopifyUrl })
    } else {
      return NextResponse.json({ error: "Groq connection failed: Unexpected response." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in /api/test-connection:", error)
    return NextResponse.json(
      { error: "Failed to connect to Groq API.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
