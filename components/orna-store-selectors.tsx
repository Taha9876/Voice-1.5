import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function OrnaStoreSelectors() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shopify Store DOM Selectors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          For the voice commands to interact correctly with your Shopify store, the system needs to know how to find
          specific elements on your store's pages. These are common selectors for a default Shopify theme.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Navigation & Search</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>`Search Input`: `input[name="q"]` or `input[type="search"]`</li>
              <li>`Search Button`: `button[type="submit"]` within a search form</li>
              <li>`Cart Icon/Link`: `a[href="/cart"]` or `[data-cart-icon]`</li>
              <li>`Product Page Link`: `a[href*="/products/"]`</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Product & Cart Actions</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>`Add to Cart Button`: `button[name="add"]` or `button[type="submit"][name="add"]`</li>
              <li>`Product Quantity Input`: `input[name="quantity"]`</li>
              <li>`Cart Item Quantity Input`: `input[name*="updates[]"]`</li>
              <li>`Remove Cart Item Button`: `button[name="update"]` or `a[href*="/cart/change"]`</li>
              <li>`Checkout Button`: `button[name="checkout"]` or `a[href="/checkout"]`</li>
            </ul>
          </div>
        </div>
        <Separator />
        <p className="text-sm text-muted-foreground">
          **Customization:** If your Shopify theme uses different HTML structures or class names, you might need to
          update these selectors in the `public/extension/content.js` file to ensure the voice commands work seamlessly.
        </p>
      </CardContent>
    </Card>
  )
}
