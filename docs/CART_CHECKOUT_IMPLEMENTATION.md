# Cart Checkout Implementation

## Overview
This document describes the complete implementation of the cart checkout functionality in the e-commerce application. The implementation ensures a consistent user experience between the "Buy Now" button and the cart checkout process.

## Problem Statement
Previously, the cart drawer's checkout button only logged items to console instead of creating draft orders and redirecting to payment like the "Buy Now" button did. This created an inconsistent user experience.

## Solution
Implemented a comprehensive cart checkout system that mirrors the "Buy Now" button functionality, creating draft orders with multiple line items and redirecting users to payment.

## Files Modified

### 1. `/lib/actions.ts`
**Added:** `checkoutCartAction` server action (lines 135-243)

**Key Features:**
- Accepts an array of `ClientCartItem` objects and optional UTM parameters
- Validates all cart items (product ID, variant ID, price, quantity within limits)
- Generates invoice numbers for tracking
- Creates draft orders via the `/api/draft-orders` endpoint
- Appends UTM parameters to the payment URL
- Implements comprehensive error handling with user-friendly messages
- Returns a `Promise<never>` since it always redirects

**Validation Rules:**
- Cart must not be empty
- Each item must have valid product ID and variant ID
- Price must be a positive finite number
- Quantity must be between `LIMITS.MIN_QUANTITY_PER_ITEM` and `LIMITS.MAX_QUANTITY_PER_ITEM`

**UTM Parameters:**
- Default source: "cart"
- Default medium: "checkout"
- Default campaign: "cart-checkout"
- Can be overridden by URL parameters

### 2. `/components/cart/cart-drawer.tsx`
**Modified:** Lines 31, 44, 47-74, 199-206

**Changes:**
- Imported `checkoutCartAction` from `@/lib/actions`
- Added `isCheckingOut` state to manage loading state
- Implemented `handleCheckout` async function that:
  - Validates cart is not empty
  - Extracts UTM parameters from URL
  - Calls `checkoutCartAction` with cart items and UTM params
  - Shows error messages via toast notifications
  - Manages loading state
- Updated checkout button to:
  - Call `handleCheckout` on click
  - Show "Processing..." text during checkout
  - Disable button while processing

### 3. `/app/(store)/cart/page.tsx`
**Modified:** Lines 14, 22, 29-56, 145-152

**Changes:**
- Imported `checkoutCartAction` from `@/lib/actions`
- Added `isCheckingOut` state
- Implemented `handleCheckout` function (identical to cart drawer)
- Updated "Proceed to Checkout" button to:
  - Use `handleCheckout` instead of linking to `/checkout`
  - Show loading state
  - Display "Processing..." text during checkout

## User Flow

### Before Implementation
1. User adds items to cart
2. User clicks "Checkout" in cart drawer or cart page
3. Items are logged to console (cart drawer) or user is redirected to `/checkout` page (cart page)
4. No draft order is created
5. Inconsistent behavior between "Buy Now" and cart checkout

### After Implementation
1. User adds items to cart
2. User clicks "Checkout" in cart drawer or cart page
3. System validates all cart items
4. System generates invoice number
5. System creates draft order with all line items via API
6. System redirects to payment URL with UTM parameters
7. User completes payment
8. Consistent behavior across all checkout flows

## API Integration

### Draft Order Creation
**Endpoint:** `/api/draft-orders`
**Method:** POST

**Payload Structure:**
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
  "tags": "cart,checkout,cart-checkout,INV-20240115-ABC123"
}
```

**Response Structure:**
```json
{
  "draftOrder": {
    "id": "draft_order_id",
    "invoiceUrl": "https://payment.example.com/invoice/..."
  }
}
```

## Error Handling

### Validation Errors
- **Empty Cart:** "Cart is empty. Please add items before checkout."
- **Invalid Product:** "Invalid product in cart"
- **Invalid Variant:** "Invalid variant in cart"
- **Invalid Price:** "Invalid price for [Product Name]"
- **Invalid Quantity:** "Invalid quantity for [Product Name]. Must be between X and Y"

### API Errors
- **Failed Request:** "Failed to create draft order via API."
- **Missing Invoice URL:** "No invoice URL returned from draft order API."
- **Generic Error:** "An unexpected error occurred. Please try again."

### User Feedback
- Errors are displayed via toast notifications
- Loading state prevents multiple submissions
- Button shows "Processing..." during checkout
- Button is disabled during processing

## Technical Details

### Type Safety
Uses `ClientCartItem` interface from `@/lib/types`:
```typescript
interface ClientCartItem {
  product: {
    id: string;
    title: string;
    // ... other product fields
  };
  variant: {
    id: string;
    price: number;
    // ... other variant fields
  };
  quantity: number;
}
```

### Invoice Number Generation
Uses `generateInvoiceNumber()` utility from `@/lib/utils/invoice`:
- Format: `INV-YYYYMMDD-RANDOM`
- Example: `INV-20240115-ABC123`
- Included in tags for tracking

### UTM Parameter Handling
- Extracted from URL query parameters
- Defaults provided if not present
- Appended to payment URL for tracking
- Included in draft order tags

## Testing Checklist

### Cart Drawer
- [ ] Add single item to cart and checkout
- [ ] Add multiple items to cart and checkout
- [ ] Try to checkout with empty cart (should show error)
- [ ] Verify loading state during checkout
- [ ] Verify error handling for API failures
- [ ] Verify UTM parameters are preserved

### Cart Page
- [ ] Add items and checkout from cart page
- [ ] Verify same behavior as cart drawer
- [ ] Test with various quantities
- [ ] Test with different product variants
- [ ] Verify error messages display correctly

### Integration
- [ ] Verify draft order is created in backend
- [ ] Verify invoice number is generated correctly
- [ ] Verify redirect to payment URL
- [ ] Verify UTM parameters in payment URL
- [ ] Verify tags are included in draft order

### Edge Cases
- [ ] Test with maximum quantity per item
- [ ] Test with minimum quantity per item
- [ ] Test with invalid product data
- [ ] Test with network failures
- [ ] Test with slow API responses

## Future Enhancements

1. **Cart Clearing:** Automatically clear cart after successful checkout redirect
2. **Order Confirmation:** Show confirmation message before redirecting
3. **Cart Persistence:** Save cart state to localStorage or database
4. **Discount Codes:** Add support for promo codes and discounts
5. **Shipping Calculation:** Calculate shipping costs before checkout
6. **Tax Calculation:** Calculate taxes based on location
7. **Guest Checkout:** Allow checkout without account creation
8. **Save for Later:** Allow users to save items for future purchase
9. **Wishlist Integration:** Move items between cart and wishlist
10. **Analytics:** Track checkout funnel and abandonment rates

## Related Documentation
- [Buy Now Implementation](./BUY_NOW_IMPLEMENTATION.md)
- [Draft Orders API](./API_DRAFT_ORDERS.md)
- [Cart Context](./CART_CONTEXT.md)
- [Error Handling](./ERROR_HANDLING.md)

## Maintenance Notes

### When Adding New Validation Rules
1. Update validation in `checkoutCartAction`
2. Update error messages in `ERROR_MESSAGES` constant
3. Update this documentation
4. Add tests for new validation

### When Modifying Draft Order API
1. Update payload structure in `checkoutCartAction`
2. Update error handling for new response format
3. Test both cart drawer and cart page
4. Update API documentation

### When Changing UTM Parameters
1. Update default values in `checkoutCartAction`
2. Update URL parameter extraction in cart components
3. Update analytics tracking
4. Document changes in this file

## Support
For issues or questions about the cart checkout implementation, please refer to:
- Technical lead: [Your Name]
- Documentation: This file
- Code location: `/lib/actions.ts`, `/components/cart/cart-drawer.tsx`, `/app/(store)/cart/page.tsx`
