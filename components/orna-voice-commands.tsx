import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OrnaVoiceCommands() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Voice Commands for Shopify</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Here are some common voice commands you can use to navigate and interact with your Shopify store.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Navigation</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>"Go to home page"</li>
              <li>"Go to products"</li>
              <li>"Go to collections"</li>
              <li>"Go to cart"</li>
              <li>"Go to checkout"</li>
              <li>"Go back"</li>
              <li>"Refresh page"</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Search & Interaction</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>"Search for [product name or keyword]"</li>
              <li>"Click [link text or button text]"</li>
              <li>"Scroll down"</li>
              <li>"Scroll up"</li>
              <li>"Show me [product name]" (e.g., "Show me the Vintage T-Shirt")</li>
            </ul>
          </div>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          **Tip:** Speak clearly and naturally. The system is designed to understand common phrases. If a command
          doesn't work, try rephrasing it.
        </p>
      </CardContent>
    </Card>
  )
}
