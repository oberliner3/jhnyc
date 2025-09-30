# Shopify Draft Order Integration Refactor

## Overview

This document outlines the comprehensive refactoring of the Shopify integration to fully support draft order and invoice creation using modern GraphQL APIs instead of raw REST API calls.

## Changes Made

### 1. Dependencies Updated

**Added:**
- `@shopify/admin-api-client` - Modern Shopify Admin API client with GraphQL support

### 2. Environment Variables

**Updated `.env.local`:**
```env
# Shopify Configuration
SHOPIFY_SHOP_NAME="maa7ha-jh" 
SHOPIFY_SHOP="maa7ha-jh.myshopify.com" 
SHOPIFY_ACCESS_TOKEN={{SHOPIFY_ACCESS_TOKEN}}
SHOPIFY_TOKEN="{{SHOPIFY_ACCESS_TOKEN}}"  # Legacy support

# For public access (current implementation)
NEXT_PUBLIC_SHOPIFY_SHOP="maa7ha-jh.myshopify.com"
NEXT_PUBLIC_SHOPIFY_TOKEN="{{SHOPIFY_ACCESS_TOKEN}}"
```

### 3. New Shopify Client Utility

**Created:** `lib/shopify-client.ts`

Features:
- Modern GraphQL-based Admin API client using `@shopify/admin-api-client`
- Comprehensive TypeScript interfaces for draft orders
- Support for customer information, shipping addresses, line items
- Invoice sending capabilities
- Error handling with detailed Shopify API error messages
- Legacy compatibility with existing implementations

Key Functions:
- `createDraftOrder(orderData: DraftOrderInput)` - Create draft orders with full customization
- `sendDraftOrderInvoice(draftOrderId, invoiceData)` - Send invoices to customers
- `createSimpleDraftOrder()` - Simplified interface for backward compatibility

### 4. Refactored Server Actions

**Updated:** `lib/actions.ts`

- `buyNowAction()` - Now uses modern Shopify client instead of raw fetch
- `handleCampaignRedirect()` - Updated to use GraphQL API
- Enhanced error handling and validation
- Support for optional customer email collection

### 5. Updated API Routes

**Enhanced:** `app/api/buy-now/route.ts`
- Refactored to use modern Shopify client
- Better error handling and response structure
- Support for customer email

**Created:** `app/api/draft-orders/route.ts`
- Comprehensive draft order creation endpoint
- Support for:
  - Multiple line items with product/variant details
  - Customer information (email, name, phone)
  - Shipping and billing addresses
  - Order notes and tags
  - Automatic invoice sending
  - Full validation and error handling

### 6. Enhanced Components

**Updated:** `components/product/buy-now-button.tsx`
- Added optional customer email collection
- Enhanced toast notifications for better UX
- Backward compatible - existing usage continues to work
- New props: `collectCustomerEmail`, `customerEmail`

**Created:** `components/admin/draft-order-form.tsx`
- Full-featured draft order creation form
- Dynamic line item management
- Customer and shipping address forms
- Order notes, tags, and invoice sending options
- Real-time validation and feedback

### 7. Admin Interface

**Created:** `app/(routes)/admin/draft-orders/page.tsx`
- Admin page for creating draft orders
- Accessible at `/admin/draft-orders`

## API Endpoints

### POST `/api/buy-now`
Enhanced buy-now endpoint with optional customer email support.

**Request (FormData):**
```
productId: string
variantId: string
price: number
quantity: number
productTitle: string
productImage: string
customerEmail?: string (new)
```

**Response:**
```json
{
  "success": true,
  "invoiceUrl": "https://...",
  "draftOrderId": "...",
  "draftOrderName": "..."
}
```

### POST `/api/draft-orders`
Comprehensive draft order creation endpoint.

**Request (JSON):**
```json
{
  "lineItems": [
    {
      "variantId": "string",
      "title": "string",
      "quantity": number,
      "price": "string",
      "sku": "string"
    }
  ],
  "customerEmail": "string",
  "customerFirstName": "string",
  "customerLastName": "string",
  "customerPhone": "string",
  "shippingAddress": {
    "first_name": "string",
    "last_name": "string",
    "address1": "string",
    "city": "string",
    "province": "string",
    "zip": "string",
    "country": "string"
  },
  "note": "string",
  "tags": "string",
  "sendInvoice": boolean,
  "invoiceData": {
    "subject": "string",
    "customMessage": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "draftOrder": {
    "id": "string",
    "name": "string",
    "invoiceUrl": "string",
    "totalPrice": "string",
    "customer": { ... },
    "createdAt": "string"
  },
  "invoiceSent": boolean
}
```

## Usage Examples

### Simple Buy Now (Existing)
```tsx
<BuyNowButton
  product={product}
  variant={selectedVariant}
  quantity={1}
/>
```

### Buy Now with Email Collection
```tsx
<BuyNowButton
  product={product}
  variant={selectedVariant}
  quantity={1}
  collectCustomerEmail={true}
  customerEmail="user@example.com"
/>
```

### Create Draft Order via API
```javascript
const response = await fetch('/api/draft-orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lineItems: [{ 
      variantId: '12345', 
      quantity: 2, 
      title: 'Product Name' 
    }],
    customerEmail: 'customer@example.com',
    shippingAddress: { ... },
    sendInvoice: true
  })
});
```

## Key Improvements

1. **Modern GraphQL API**: Replaced REST calls with GraphQL for better performance and type safety
2. **Enhanced Error Handling**: Detailed Shopify API error messages and validation
3. **TypeScript Support**: Comprehensive type definitions for all API interactions
4. **Customer Data**: Full support for customer information and addresses
5. **Invoice Management**: Automated invoice generation and sending
6. **Backward Compatibility**: Existing implementations continue to work unchanged
7. **Admin Interface**: User-friendly form for manual draft order creation
8. **Toast Notifications**: Enhanced user feedback during operations

## Testing

- **Linting**: All code passes ESLint validation
- **Build**: Successfully compiles with TypeScript
- **Routes**: All API routes are properly generated
- **Admin Interface**: Available at `/admin/draft-orders` for testing

## Migration Notes

### Existing Code
No changes required for existing `BuyNowButton` usage. All existing functionality is preserved.

### New Features
- Use `collectCustomerEmail={true}` to enable email collection
- Access the new draft order API at `/api/draft-orders`
- Visit `/admin/draft-orders` for manual draft order creation

### Environment Setup
Ensure your Shopify app has the following permissions:
- `draft_orders` (read/write)
- `customers` (read)

The refactored implementation uses GraphQL which requires these permissions to be properly configured in your Shopify custom app settings.