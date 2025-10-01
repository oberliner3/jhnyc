# Buy Now Button Implementation

This document explains how the Buy Now functionality works in the OriginZ application, which has been refactored to match the PHP/WordPress implementation in functionality and style.

## Overview

The Buy Now feature allows customers to skip the cart and go directly to checkout with a product. It uses Shopify Draft Orders to create an invoice that the customer can pay immediately.

## Components

### 1. BuyNowButton Component

A flexible React component that renders a customizable Buy Now button with various styling options:

```tsx
<BuyNowButton
  product={product}
  variant={variant}
  quantity={1}
  style="minimal" // or "default" or "full-width"
  size="sm" // or "md" or "lg"
  utmParams={{
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "buy-now"
  }}
  className="additional-classes"
/>
```

#### Props

- `product`: The product to purchase (required)
- `variant`: Optional variant of the product
- `quantity`: Quantity to purchase (default: 1)
- `style`: Visual style of the button
  - `default`: Orange button with standard styling
  - `minimal`: Dark gray/black button with minimal styling (matches PHP)
  - `full-width`: Full width dark button with responsive styling (matches PHP)
- `size`: Button size (`sm`, `md`, `lg`)
- `utmParams`: UTM parameters for tracking (defaults match PHP)
- `className`: Additional CSS classes

### 2. API Routes

Two API endpoints handle the Buy Now flow:

#### POST `/api/buy-now`

Creates a Shopify draft order from form data and returns invoice URL.

```ts
// Example request body (FormData):
{
  productId: "123456789",
  variantId: "987654321",
  price: "29.99", 
  quantity: "2",
  productTitle: "Product Name",
  productImage: "https://example.com/image.jpg",
  utm_source: "google",
  utm_medium: "cpc",
  utm_campaign: "buy-now"
}

// Example response:
{
  success: true,
  invoiceUrl: "https://shop.myshopify.com/...",
  draftOrderId: "gid://shopify/DraftOrder/123456789",
  draftOrderName: "#D123",
  invoiceNumber: "Invoice1234567"
}
```

#### GET `/api/buy-now?go_checkout=1&...`

Handles URL-based checkout flow similar to WordPress implementation.

```
GET /api/buy-now?go_checkout=1&product_id=123&price=29.99&quantity=1&utm_source=google
```

### 3. Server Actions

The `buyNowAction` server action can be used in form actions:

```tsx
<form action={buyNowAction}>
  <input type="hidden" name="productId" value="123" />
  <input type="hidden" name="variantId" value="456" />
  <input type="hidden" name="price" value="29.99" />
  <input type="hidden" name="quantity" value="1" />
  <input type="hidden" name="productTitle" value="Product Name" />
  <input type="hidden" name="productImage" value="https://example.com/image.jpg" />
  <input type="hidden" name="utm_source" value="google" />
  <input type="hidden" name="utm_medium" value="cpc" />
  <input type="hidden" name="utm_campaign" value="buy-now" />
  <button type="submit">Buy Now</button>
</form>
```

### 4. Client-Side Utilities

Two utility functions for client-side implementation:

#### `initializeCampaignButton`

Attaches a click handler to a button that builds a checkout URL:

```ts
initializeCampaignButton(
  ".buy-now-button", // Button selector
  "input[name=quantity]", // Quantity input selector
  "input[name=variation_id]", // Variation input selector
  { 
    utm_source: "google",
    utm_medium: "cpc", 
    utm_campaign: "promotion"
  }
);
```

#### `handleBuyNowClick`

Creates form data for programmatic buy now requests:

```ts
const { url, formData } = handleBuyNowClick(
  {
    productId: "123",
    variantId: "456",
    price: 29.99,
    productTitle: "Product Name",
    productImage: "https://example.com/image.jpg"
  },
  2, // quantity
  { utm_source: "instagram" }
);

// Use fetch or other methods to submit
fetch(url, {
  method: "POST",
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    window.location.href = data.invoiceUrl;
  }
});
```

## Integration with Cloudflare Worker

The Buy Now implementation adds `product_title` and `product_image` URL parameters to the Shopify checkout URL, which are used by the Cloudflare Worker to customize the checkout page:

- The worker replaces "Invoice" text with the actual product title
- The worker replaces the default SVG with the actual product image

## Styling

The refactored button implements the same styling patterns as the PHP version:

- Dark gray/black background (`#212121`)
- Light gray hover state (`#757575`)
- Responsive sizing for different viewports
- Various display options (inline, block, full-width)

## Invoice Number Generation

Both server-side implementations generate invoice numbers in the format `Invoice` + random 7-digit number, which matches the PHP implementation.