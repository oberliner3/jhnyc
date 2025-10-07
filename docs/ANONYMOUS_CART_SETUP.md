# Anonymous Cart System Setup Guide

This guide explains how to set up and use the anonymous cart system for guest user tracking and remarketing.

## Overview

The anonymous cart system provides:
- **Guest user cart tracking** - Capture and store cart data for users who haven't created accounts
- **Remarketing capabilities** - Track UTM parameters, referrers, email capture for abandoned cart campaigns
- **Analytics and insights** - Monitor conversion rates, abandonment patterns, average cart values
- **Seamless migration** - Convert anonymous carts to authenticated user carts when users sign up

## 🚀 Quick Setup

### 1. Database Migration

Run the Supabase migration to create the necessary tables:

```bash
cd supabase
npx supabase db push --file migrations/20241222_anonymous_cart_fixed.sql
```

Or apply via Supabase Studio by running the SQL from `supabase/migrations/20241222_anonymous_cart_fixed.sql`.

**Note**: Use the `_fixed.sql` file to avoid PostgreSQL function parameter issues.

### 2. Environment Variables

Ensure your Supabase environment variables are configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Basic Integration

Add the anonymous cart hook to any product page:

```typescript
import { useAnonymousCart } from "@/hooks/useAnonymousCart";

export default function ProductPage({ product }) {
  const { addItem, loading, getTotalValue } = useAnonymousCart();

  const handleAddToCart = async () => {
    await addItem(product);
    console.log('Product added to anonymous cart');
  };

  return (
    <div>
      <button onClick={handleAddToCart} disabled={loading}>
        Add to Cart
      </button>
      <p>Cart Total: ${getTotalValue()}</p>
    </div>
  );
}
```

## 📊 Database Schema

### Tables Created

**`anonymous_carts`**
- Stores cart metadata, customer info, UTM tracking
- Automatically expires carts after 7 days
- Tracks cart status (active, abandoned, converted, expired)

**`anonymous_cart_items`**
- Individual cart items with product info
- Linked to parent cart via foreign key
- Auto-updates cart totals via database triggers

### Key Features

**Automatic Cart Totals**: Database triggers automatically calculate totals when items change

**UTM Tracking**: Captures marketing attribution data automatically

**Email Capture**: Stores customer email when provided for remarketing

**Status Management**: Tracks cart lifecycle from active → abandoned/converted/expired

## 🛠 API Endpoints

### Anonymous Cart API (`/api/anonymous-cart`)

**GET** - Retrieve cart by session ID
```javascript
const response = await fetch('/api/anonymous-cart?session_id=anon_abc123');
const { cart } = await response.json();
```

**POST** - Add items or update cart
```javascript
const response = await fetch('/api/anonymous-cart', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'add_item',
    session_id: 'anon_abc123',
    product: productData,
    quantity: 1
  })
});
```

**DELETE** - Clear cart
```javascript
await fetch('/api/anonymous-cart?session_id=anon_abc123', {
  method: 'DELETE'
});
```

### Analytics API (`/api/analytics/carts`)

**GET** - Get cart performance metrics
```javascript
const response = await fetch('/api/analytics/carts?start_date=2024-01-01');
const analytics = await response.json();
// Returns: conversion rates, abandonment rates, avg cart value, etc.
```

**POST** - Trigger maintenance (cleanup, mark abandoned)
```javascript
await fetch('/api/analytics/carts', {
  method: 'POST',
  body: JSON.stringify({ action: 'cleanup_expired' })
});
```

## 🎯 Usage Examples

### Email Capture for Remarketing

```typescript
const { updateCustomerInfo } = useAnonymousCart();

// Capture email during checkout
const handleEmailBlur = async (email: string) => {
  await updateCustomerInfo(email);
  console.log('Email captured for remarketing');
};
```

### Page Leave Detection

```typescript
// Automatically mark carts as abandoned when users leave
const { markAbandoned, cart } = useAnonymousCart();

useEffect(() => {
  const handleBeforeUnload = () => {
    if (cart?.items?.length > 0) {
      setTimeout(() => markAbandoned(), 30000); // 30 sec delay
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [cart, markAbandoned]);
```

### Conversion Tracking

```typescript
const { markConverted } = useAnonymousCart();

// Mark cart as converted after successful checkout
const handleCheckoutSuccess = async (orderId: string) => {
  await markConverted();
  
  // Track with Google Analytics
  gtag('event', 'purchase', {
    transaction_id: orderId,
    value: getTotalValue(),
  });
};
```

### Analytics Dashboard

```typescript
import { useAnonymousCartAnalytics } from "@/hooks/useAnonymousCart";

export function Dashboard() {
  const { analytics, loading } = useAnonymousCartAnalytics();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <h3>Total Carts</h3>
        <p>{analytics.totalCarts}</p>
      </div>
      <div>
        <h3>Conversion Rate</h3>
        <p>{analytics.conversionRate}%</p>
      </div>
      <div>
        <h3>Abandoned Carts</h3>
        <p>{analytics.abandonedCarts}</p>
      </div>
      <div>
        <h3>Avg Cart Value</h3>
        <p>${analytics.avgCartValue}</p>
      </div>
    </div>
  );
}
```

## 🔄 Migration from Anonymous to Authenticated

When a user creates an account or logs in, migrate their anonymous cart:

```typescript
import { migrateAnonymousCartToUser } from "@/lib/anonymous-cart";

// After successful user authentication
const handleUserLogin = async (userId: string) => {
  await migrateAnonymousCartToUser(userId);
  // Anonymous cart is now marked as converted
  // Implement your logic to merge with authenticated cart
};
```

## 🕒 Maintenance & Cleanup

### Automatic Cleanup

Set up a cron job to regularly clean up expired carts:

```bash
# Add to your server's crontab (runs daily at 2 AM)
0 2 * * * curl -X POST "https://yoursite.com/api/analytics/carts" \
  -H "Content-Type: application/json" \
  -d '{"action":"cleanup_expired"}'
```

### Mark Abandoned Carts

Run regularly to identify abandoned carts for remarketing:

```bash
# Mark carts abandoned after 24 hours of inactivity
curl -X POST "https://yoursite.com/api/analytics/carts" \
  -H "Content-Type: application/json" \
  -d '{"action":"mark_abandoned"}'
```

## 📈 Marketing Integration

### UTM Parameter Tracking

The system automatically captures UTM parameters from the URL:

```typescript
// UTM params are automatically tracked when cart is created
// Example: yoursite.com/product?utm_source=facebook&utm_campaign=summer_sale

const cart = await getOrCreateAnonymousCart();
console.log(cart.utm_source);    // "facebook"
console.log(cart.utm_campaign);  // "summer_sale"
```

### Abandoned Cart Email Campaigns

Query abandoned carts with email addresses for remarketing:

```sql
-- Get abandoned carts with emails from last 7 days
SELECT 
  session_id,
  email,
  total_value,
  item_count,
  updated_at
FROM anonymous_carts 
WHERE status = 'abandoned' 
  AND email IS NOT NULL
  AND updated_at > NOW() - INTERVAL '7 days';
```

## 🚨 Important Notes

### Privacy Compliance

- **GDPR/CCPA**: Ensure you have proper consent for tracking anonymous users
- **Data Retention**: Carts auto-expire after 7 days, complete cleanup after 30 days
- **PII Handling**: Email/phone data is encrypted at rest in Supabase

### Performance Considerations

- **Database Indexes**: Migration includes optimized indexes for common queries
- **Automatic Cleanup**: Built-in cleanup functions prevent database bloat
- **Caching**: Consider Redis caching for high-traffic applications

### Security

- **Row Level Security**: Enabled on all tables with appropriate policies
- **API Validation**: All endpoints validate input and session IDs
- **Rate Limiting**: Consider adding rate limiting for production use

## 🤝 Integration with Existing Cart

To integrate with your existing authenticated cart system:

1. **Detection**: Check if user has both anonymous and authenticated carts
2. **Merge Logic**: Combine items, preferring authenticated cart data
3. **Cleanup**: Mark anonymous cart as converted after successful merge
4. **Preserve Analytics**: Keep anonymous cart record for attribution tracking

```typescript
// Example merge logic
const mergeAnonymousCart = async (userId: string, authenticatedCart: Cart) => {
  const anonymousCart = await getOrCreateAnonymousCart();
  
  // Merge logic here - combine items, handle duplicates, etc.
  const mergedItems = [...authenticatedCart.items, ...anonymousCart.items];
  
  // Update authenticated cart
  await updateAuthenticatedCart(userId, mergedItems);
  
  // Mark anonymous cart as converted
  await markCartAsConverted(anonymousCart.session_id);
};
```

## 📞 Support

This anonymous cart system is designed to work seamlessly with your existing Shopify integration and MessagePack optimizations. The system automatically:

- Handles session management across browser sessions
- Provides fallback UUID generation without external dependencies  
- Integrates with your existing API patterns
- Maintains type safety throughout the application

For questions or issues, refer to the code comments or check the API route implementations for detailed error handling patterns.