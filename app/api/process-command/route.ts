import { NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

// Define the schema for the expected action from the AI model
const actionSchema = z.object({
  type: z.enum([
    "navigate",
    "search",
    "add_to_cart",
    "go_to_cart",
    "go_to_checkout",
    "click_element",
    "scroll",
    "refresh_page",
    "inform", // For responses that don't require a specific DOM action
  ]),
  payload: z.record(z.any()).optional(), // Flexible payload for different action types
})

export async function POST(req: Request) {
  try {
    const { command, shopifyUrl, pageContext } = await req.json()

    const GROQ_API_KEY = process.env.GROQ_API_KEY

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API Key not configured on the server." }, { status: 500 })
    }

    const systemPrompt = `
      You are an AI assistant for a Shopify store. Your goal is to interpret user voice commands and translate them into actionable steps for a browser extension to execute on a Shopify store.
      You have access to the current Shopify page context.
      
      Current Shopify URL: ${shopifyUrl}
      Current Page Context: ${JSON.stringify(pageContext, null, 2)}

      Based on the user's command, determine the most appropriate action and its parameters.
      If a command requires navigating to a specific page, use the 'navigate' action.
      If a command requires searching, use the 'search' action.
      If a command requires adding to cart, use the 'add_to_cart' action.
      If a command requires going to cart, use the 'go_to_cart' action.
      If a command requires going to checkout, use the 'go_to_checkout' action.
      If a command requires clicking a specific element (e.g., a button or link by text or selector), use 'click_element'.
      If a command requires scrolling, use 'scroll'.
      If a command requires refreshing the page, use 'refresh_page'.
      If the command is purely informational or cannot be translated into a direct action, use the 'inform' action and provide a helpful response.

      Provide your response as a JSON object with the following structure:
      {
        "speech": "A short, natural language response to the user.",
        "action": {
          "type": "navigate" | "search" | "add_to_cart" | "go_to_cart" | "go_to_checkout" | "click_element" | "scroll" | "refresh_page" | "inform",
          "payload": {
            // Parameters specific to the action type
            // For 'navigate': { "path": "/products" } or { "url": "full_url" }
            // For 'search': { "query": "t-shirt" }
            // For 'add_to_cart': { "productName": "Vintage T-Shirt", "quantity": 1 }
            // For 'click_element': { "selector": "button.add-to-cart", "text": "Add to Cart" } (use one or both)
            // For 'scroll': { "direction": "up" | "down" }
            // For 'inform': { "message": "Your message here" }
          }
        }
      }

      Examples:
      User: "Go to products"
      Response: { "speech": "Navigating to the products page.", "action": { "type": "navigate", "payload": { "path": "/products" } } }

      User: "Search for vintage t-shirts"
      Response: { "speech": "Searching for vintage t-shirts.", "action": { "type": "search", "payload": { "query": "vintage t-shirts" } } }

      User: "Add the blue shirt to my cart"
      Response: { "speech": "Adding the blue shirt to your cart.", "action": { "type": "add_to_cart", "payload": { "productName": "blue shirt", "quantity": 1 } } }

      User: "What is my cart total?" (assuming pageContext has cart info)
      Response: { "speech": "Your current cart has ${pageContext.cartCount} items.", "action": { "type": "inform", "payload": { "message": "Cart total requested" } } }

      User: "Go to checkout"
      Response: { "speech": "Proceeding to checkout.", "action": { "type": "go_to_checkout", "payload": {} } }

      User: "Click the buy now button"
      Response: { "speech": "Clicking the buy now button.", "action": { "type": "click_element", "payload": { "text": "Buy Now" } } }

      User: "Scroll down"
      Response: { "speech": "Scrolling down the page.", "action": { "type": "scroll", "payload": { "direction": "down" } } }

      User: "Refresh the page"
      Response: { "speech": "Refreshing the page.", "action": { "type": "refresh_page", "payload": {} } }

      User: "Tell me a joke"
      Response: { "speech": "Why don't scientists trust atoms? Because they make up everything!", "action": { "type": "inform", "payload": { "message": "Joke requested" } } }

      Prioritize direct actions over informational responses if a clear action can be inferred.
      If a product name is mentioned for 'add_to_cart', extract it accurately.
      Ensure the 'path' for 'navigate' is relative to the Shopify store root (e.g., /products, /collections/summer-sale).
      For 'click_element', try to infer a common selector or text if possible.
    `

    const { object: aiResponse } = await generateText({
      model: groq("llama3-8b-8192"), // Use a suitable Groq model
      system: systemPrompt,
      prompt: command,
      apiKey: GROQ_API_KEY,
      schema: z.object({
        speech: z.string(),
        action: actionSchema,
      }),
    })

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("Error in /api/process-command:", error)
    return NextResponse.json(
      {
        speech: "Sorry, I couldn't process that command. Please try again.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
