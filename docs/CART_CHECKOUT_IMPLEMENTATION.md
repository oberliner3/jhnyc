# Cart Checkout Implementation

## Overview
This document describes the implementation of the cart checkout functionality that creates draft orders and redirects users directly to payment, matching the behavior of the "Buy Now" button.

## Implementation Date
January 2025

## Problem Statement
Previously, the cart drawer's checkout button only logged items to the console without implementing any actual checkout logic. This created an inconsistent user experience compared to the "Buy Now" button which properly created draft orders and redirected to payment.

## Solution
Implemented a new server action `checkoutCartAction` that:
1. Validates all cart items
2. Creates a draft order with multiple line items
3. Generates an invoice number for tracking
4. Redirects to the payment page with UTM parameters

## Files Modified

### 1. `/lib/actions.ts`
**Changes:**
- Added `ClientCartItem` type import
- Created new `checkoutCartAction` server action

**Key Features:**
- Comprehensive validation for all cart items
- Support for UTM parameters (source, medium, campaign)
- Invoice number generation for tracking
- Error handling with user-friendly messages
- Redirects to payment URL with tracking parameters

**Function Signature:**
```typescript
export async function checkoutCartAction(
  cartItems: ClientCartItem[],
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
  }
): Promise<never>
```

### 2. `/components/cart/cart-drawer.tsx`
**Changes:**
- Added imports: `useState`, `toast`, `checkoutCartAction`
- Added `isCheckingOut` state to track checkout process
- Implemented `handleCheckout` function
- Updated checkout button to use the new handler

**Key Features:**
- Extracts UTM parameters from URL
- Shows loading state during checkout
- Displays error messages via toast notifications
- Disables button during processing

### 3. `/app/(store)/cart/page.tsx`
**Changes:**
- Added imports: `useState`, `toast`, `checkoutCartAction`
- Added `isCheckingOut` state to CartContent component
- Implemented `handleCheckout` function
- Updated "Proceed to Checkout" button to use the new handler

**Key Features:**
- Same functionality as cart drawer
- Consistent user experience across cart views
- Direct checkout without intermediate forms

## User Flow

### Before Implementation
1. User adds items to cart
2. User clicks "Checkout" in cart drawer → **Nothing happens** (only console.log)
3. User clicks "Proceed to Checkout" on cart page → Goes to checkout form page

### After Implementation
1. User adds items to cart
2. User clicks "Checkout" in cart drawer OR "Proceed to Checkout" on cart page
3. System validates cart items
4. System creates draft order via API
5. System redirects to payment page with tracking parameters
6. User completes payment

## Validation Rules
The implementation validates:
- Cart is not empty
- Each item has valid product ID
- Each item has valid variant ID
- Each item has valid price (> 0)
- Each item quantity is within limits (MIN_QUANTITY_PER_ITEM to MAX_QUANTITY_PER_ITEM)

## UTM Parameter Handling
- Extracts UTM parameters from current URL
- Defaults:
  - `utm_source`: "cart"
  - `utm_medium`: "checkout"
  - `utm_campaign`: "cart-checkout"
- Appends parameters to payment URL for tracking

## Error Handling
- Validates all inputs before API call
- Catches and logs errors with context
- Displays user-friendly error messages via toast
- Maintains UI state (re-enables button on error)
- Prevents multiple simultaneous checkout attempts

## API Integration
The implementation uses the existing `/api/draft-orders` endpoint:

**Request Payload:**
```json
{
  "lineItems": [
    {
      "productTitle": "Product Name",
      "variantId": "variant_id",
      "productId": "product_id",
      "price": 29.99,
      "quantity": 2
    }
  ],
  "tags": "cart,checkout,cart-checkout,INV-20250101-ABC123"
}
```

**Expected Response:**
```json
{
  "draftOrder": {
    "invoiceUrl": "https://payment.example.com/invoice/..."
  }
}
```

## Testing Checklist

### Cart Drawer
- [ ] Add items to cart
- [ ] Click "Checkout" button
- [ ] Verify loading state shows "Processing..."
- [ ] Verify redirect to payment page
- [ ] Verify UTM parameters in URL
- [ ] Test with empty cart (should show error)
- [ ] Test with invalid items (should show error)

### Cart Page
- [ ] Navigate to `/cart` with items
- [ ] Click "Proceed to Checkout" button
- [ ] Verify loading state shows "Processing..."
- [ ] Verify redirect to payment page
- [ ] Verify UTM parameters in URL
- [ ] Test with empty cart (should redirect to empty cart view)

### Error Scenarios
- [ ] Test with network error (API down)
- [ ] Test with invalid product data
- [ ] Test with quantity exceeding limits
- [ ] Verify error messages are user-friendly
- [ ] Verify button re-enables after error

## Consistency with Buy Now Button
The cart checkout implementation follows the same pattern as the "Buy Now" button:
- Uses server actions for security
- Creates draft orders via API
- Generates invoice numbers
- Includes UTM tracking
- Redirects to payment URL
- Handles errors gracefully

## Future Enhancements
Potential improvements:
1. Add cart clearing after successful checkout
2. Implement order confirmation page
3. Add email notifications
4. Support for discount codes
5. Save cart state for logged-in users
6. Add analytics tracking for checkout funnel

## Related Documentation
- [Buy Now Implementation](./BUY_NOW_IMPLEMENTATION.md)
- [Draft Orders API](../app/api/draft-orders/route.ts)
- [Cart Context](../contexts/cart-context.tsx)

## Notes
- The checkout page at `/app/(checkout)/checkout/page.tsx` still exists but is now bypassed for direct cart checkout
- Users can still access the checkout form page if needed for custom flows
- The implementation maintains backward compatibility with existing cart functionality
