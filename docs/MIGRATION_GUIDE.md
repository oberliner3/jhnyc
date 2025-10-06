# Migration Guide - OriGenZ Refactoring

**Version**: 1.0
**Date**: 2025-10-05

This guide helps you migrate from the old codebase patterns to the new refactored patterns.

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [API Client Usage](#api-client-usage)
3. [Utility Functions](#utility-functions)
4. [Component Patterns](#component-patterns)
5. [Error Handling](#error-handling)

---

## Environment Variables

### Deprecated Variables

The following environment variables have been **removed** and should no longer be used:

```bash
# ❌ REMOVED - Do not use
SHOPIFY_TOKEN=...                          # Use SHOPIFY_ACCESS_TOKEN instead
PRODUCT_STREAM_API=...                     # Removed (unused)
PRODUCT_STREAM_X_KEY=...                   # Removed (unused)
NEXT_PUBLIC_CHAT_WIDGET_AUTO_OPEN=...      # Removed (unused)
NEXT_PUBLIC_CHAT_WIDGET_POSITION=...       # Removed (unused)
NEXT_PUBLIC_CHAT_WIDGET_THEME=...          # Removed (unused)
```

### New/Updated Variables

```bash
# ✅ USE THESE

# Shopify (standardized name)
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_SHOP=your-shop.myshopify.com

# COSMOS API (new)
COSMOS_API_BASE_URL=https://moritotabi.com
COSMOS_API_KEY=your-cosmos-api-key

# Chat Widget (simplified)
NEXT_PUBLIC_CHAT_WIDGET_ENABLED=false
```

### Migration Steps

1. **Update `.env.local`**:
   ```bash
   # Remove old variables
   # Add new variables from .env.sample
   ```

2. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Remove deprecated variables
   - Add new variables
   - Redeploy

3. **Update Code References**:
   ```typescript
   // ❌ Old
   const token = process.env.SHOPIFY_TOKEN;

   // ✅ New
   const token = env.SHOPIFY_ACCESS_TOKEN;
   ```

---

## API Client Usage

### Old Pattern (Deprecated)

```typescript
// ❌ DO NOT USE - Causes client-side env var error
import { getProducts } from "@/lib/data/products";

function MyComponent() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);
}
```

**Problem**: This imports server-side code into client components, exposing environment variables.

### New Pattern (Correct)

```typescript
// ✅ USE THIS - Client components use API routes
function MyComponent() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products?page=1&limit=24')
      .then(res => res.json())
      .then(data => setProducts(data.products))
      .catch(error => {
        // Error already logged by API route
      });
  }, []);
}
```

### Server Components

```typescript
// ✅ Server components can import directly
import { getProducts } from "@/lib/api/cosmos-client";

export default async function ProductsPage() {
  const products = await getProducts({ limit: 24 });

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## Utility Functions

### Product Utilities

#### Old Pattern

```typescript
// ❌ Duplicate code in each file
const price = `${amount.toFixed(2)} USD`;
const weight = grams ? `${(grams / 453.592).toFixed(1)} lb` : "";
```

#### New Pattern

```typescript
// ✅ Use shared utilities (client-safe)
import { formatPriceForMerchant, formatWeight } from "@/lib/utils/product-utils";

const price = formatPriceForMerchant(amount);
const weight = formatWeight(grams);
```

### Server-Side Product Fetching

#### Old Pattern

```typescript
// ❌ Mixed server and client utilities
import { fetchAllProducts, formatPrice } from "@/lib/utils/product-utils";
```

#### New Pattern

```typescript
// ✅ Separate server-side and client-safe utilities
// In API routes or server components:
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { formatPriceForMerchant } from "@/lib/utils/product-utils";

// In client components:
import { formatPriceForMerchant } from "@/lib/utils/product-utils";
// ❌ DO NOT import from product-server-utils in client components!
```

### Merchant Feed Generation

#### Old Pattern

```typescript
// ❌ Complex inline logic (100+ lines)
export async function GET() {
  const products = await fetchAllProducts();
  const items = [];

  for (const product of products) {
    for (const variant of product.variants) {
      // 50+ lines of XML generation logic
      const xml = `<item>...</item>`;
      items.push(xml);
    }
  }

  const feed = `<?xml version="1.0"?>...`;
  return new NextResponse(feed);
}
```

#### New Pattern

```typescript
// ✅ Use shared utilities (10-20 lines)
import { processProductVariants, generateMerchantFeedXml } from "@/lib/utils/merchant-feed-utils";

export async function GET() {
  const products = await fetchAllProducts();

  const allItems = [];
  for (const product of products) {
    const items = processProductVariants(product, SITE_URL, SITE_NAME);
    allItems.push(...items);
  }

  const xml = generateMerchantFeedXml(allItems, SITE_NAME, SITE_URL, "Feed description");
  return new NextResponse(xml, { headers: { "Content-Type": "application/xml" } });
}
```

### Phone Number Handling

#### Old Pattern

```typescript
// ❌ Complex inline logic with useMemo
const formattedPhone = useMemo(() => {
  const formatter = new AsYouType(countryCode);
  return formatter.input(value);
}, [value, countryCode]);

const isValid = useMemo(() => {
  try {
    const phone = parsePhoneNumberWithError(value, countryCode);
    return phone.isValid();
  } catch {
    return false;
  }
}, [value, countryCode]);
```

#### New Pattern

```typescript
// ✅ Use shared utilities (simpler, no useMemo needed)
import { formatPhoneAsYouType, validatePhoneNumber } from "@/lib/utils/phone-utils";

const formattedPhone = formatPhoneAsYouType(value, countryCode);
const isValid = validatePhoneNumber(value, countryCode);
```

---

## Component Patterns

### Error Handling

#### Old Pattern

```typescript
// ❌ Redundant error logging
useEffect(() => {
  fetchProducts()
    .then(setProducts)
    .catch(error => {
      console.error("Failed to fetch products:", error);  // Redundant
      // Error already logged by fetch function
    });
}, []);
```

#### New Pattern

```typescript
// ✅ Simplified error handling
useEffect(() => {
  fetchProducts()
    .then(setProducts)
    .catch(() => {
      // Error already logged by fetch, just update UI state
      setHasMore(false);
    });
}, []);
```

### Loading States

#### Old Pattern

```typescript
// ❌ Loading state not displayed
const [isLoading, setIsLoading] = useState(false);

// ... loading logic ...

return (
  <Button onClick={loadMore}>Load More</Button>
);
```

#### New Pattern

```typescript
// ✅ Loading state displayed to user
const [isLoading, setIsLoading] = useState(false);

// ... loading logic ...

return (
  <Button onClick={loadMore} disabled={isLoading}>
    {isLoading ? "Loading..." : "Load More"}
  </Button>
);
```

---

## Error Handling

### Logging

#### Old Pattern

```typescript
// ❌ Direct console.log usage
console.log("Fetching products...");
console.error("Error:", error);
```

#### New Pattern

```typescript
// ✅ Use centralized logger
import { logger } from "@/lib/utils/logger";

logger.info("Fetching products");
logger.error("Failed to fetch products", error);
```

### Validation

#### Old Pattern

```typescript
// ❌ Manual error transformation
try {
  schema.parse(data);
} catch (error) {
  const errors = {};
  error.errors.forEach(err => {
    errors[err.path[0]] = err.message;
  });
  return errors;
}
```

#### New Pattern

```typescript
// ✅ Use validation utilities
import { transformZodErrors } from "@/lib/utils/validation-utils";

try {
  schema.parse(data);
} catch (error) {
  return transformZodErrors(error);
}
```

---

## File Naming Convention

### Understanding Utility File Types

The codebase now uses a clear naming convention to prevent server-side code from being included in client bundles:

#### 1. `*-utils.ts` - Client-Safe Utilities

**Purpose**: Pure utility functions that can be used anywhere
**Imports**: No API clients, no environment variables
**Usage**: Safe in both client and server components

**Examples**:
- `lib/utils/product-utils.ts` - Price/weight formatting
- `lib/utils/xml-utils.ts` - XML escaping
- `lib/utils/phone-utils.ts` - Phone formatting
- `lib/utils/validation-utils.ts` - Zod helpers

#### 2. `*-server-utils.ts` - Server-Side Utilities

**Purpose**: Server-side only functions
**Imports**: Can import API clients and access env vars
**Usage**: ⚠️ NEVER import in client components!

**Examples**:
- `lib/utils/product-server-utils.ts` - Product fetching

#### 3. `*-client.ts` - API Clients

**Purpose**: API integration
**Imports**: Accesses environment variables
**Usage**: ⚠️ NEVER import in client components!

**Examples**:
- `lib/api/cosmos-client.ts` - COSMOS API client

### Import Rules Summary

```typescript
// ✅ Client Components - SAFE
import { formatPrice } from "@/lib/utils/product-utils";
import { escapeXml } from "@/lib/utils/xml-utils";

// ❌ Client Components - UNSAFE
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { getProducts } from "@/lib/api/cosmos-client";

// ✅ Server Components/API Routes - ALL SAFE
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { getProducts } from "@/lib/api/cosmos-client";
import { formatPrice } from "@/lib/utils/product-utils";
```

---

## Breaking Changes

### 1. Environment Variables

**Breaking**: `SHOPIFY_TOKEN` no longer supported

**Migration**:
```bash
# Old
SHOPIFY_TOKEN=shpat_xxxxx

# New
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

### 2. Client Component Imports

**Breaking**: Cannot import `lib/api/cosmos-client.ts` in client components

**Migration**:
```typescript
// Old (causes error)
import { getProducts } from "@/lib/data/products";

// New (use API route)
const response = await fetch('/api/products');
const data = await response.json();
```

### 3. Merchant Feed Functions

**Breaking**: Inline merchant feed logic replaced with utilities

**Migration**: Use `processProductVariants()` and `generateMerchantFeedXml()` from `lib/utils/merchant-feed-utils.ts`

### 4. Product Utilities Split

**Breaking**: `fetchAllProducts` moved from `product-utils.ts` to `product-server-utils.ts`

**Migration**:
```typescript
// Old
import { fetchAllProducts } from "@/lib/utils/product-utils";

// New (server-side only)
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
```

**Reason**: Prevents server-side code from being included in client bundles

---

## Checklist

Use this checklist to ensure complete migration:

- [ ] Updated all environment variables in `.env.local`
- [ ] Updated environment variables in Vercel
- [ ] Replaced `SHOPIFY_TOKEN` with `SHOPIFY_ACCESS_TOKEN`
- [ ] Removed unused environment variables
- [ ] Updated client components to use API routes
- [ ] Replaced inline utility code with shared utilities
- [ ] Updated error handling to use logger
- [ ] Tested all critical paths
- [ ] Verified production build succeeds
- [ ] Deployed and tested in production

---

## Support

If you encounter issues during migration:

1. Check the error message carefully
2. Review the relevant section in this guide
3. Check JSDoc comments in source files
4. Review `DEPLOYMENT_GUIDE.md` for deployment issues
5. Check Vercel logs for runtime errors

---

## Additional Resources

- **API Reference**: `docs/API_REFERENCE.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **Complete Summary**: `COMPLETE_REFACTORING_SUMMARY.md`
- **Phase 4-5 Details**: `PHASE_4_5_REFACTORING_SUMMARY.md`

---

**Last Updated**: 2025-10-05

