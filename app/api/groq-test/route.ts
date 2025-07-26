import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const GROQ_API_KEY = process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key not configured on the server." }, { status: 500 })
    }

    const { text } = await generateText({
      model: groq("llama3-8b-8192"), // You can choose a different Groq model if needed
      prompt: `Echo this message: "${message}"`,
      apiKey: GROQ_API_KEY,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Error in /api/groq-test:", error)
    return NextResponse.json(
      { error: "Failed to connect to Groq API.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
