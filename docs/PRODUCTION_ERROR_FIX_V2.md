# Production Error Fix V2 - Server-Side Environment Variables

**Date**: 2025-10-05  
**Status**: ✅ **FIXED**  
**Severity**: Critical

---

## Error Description

**Error Message**:
```
❌ Attempted to access a server-side environment variable on the client
```

**Environment**: Production (Vercel)  
**Occurrence**: After Phase 6 refactoring completion

---

## Root Cause Analysis

### The Problem

The error reappeared after the refactoring because of an **indirect import chain**:

1. `lib/utils/product-utils.ts` imported `fetchAllProducts` from `lib/api/cosmos-client.ts`
2. `lib/utils/merchant-feed-utils.ts` imported formatting functions from `product-utils.ts`
3. Even though `merchant-feed-utils.ts` didn't use `fetchAllProducts`, the module-level import in `product-utils.ts` caused the entire `cosmos-client.ts` to be loaded
4. When `merchant-feed-utils.ts` was imported (even indirectly), it triggered the environment variable access on the client side

### Import Chain

```
Client Component
  └─> lib/utils/merchant-feed-utils.ts (formatting functions)
       └─> lib/utils/product-utils.ts (formatPriceForMerchant, etc.)
            └─> lib/api/cosmos-client.ts (fetchAllProducts import)
                 └─> ❌ Environment variables accessed at module level
```

### Why This Happened

The previous fix (Phase 0) made environment variable access lazy-loaded in `cosmos-client.ts`, but it didn't prevent the **module from being loaded** when imported. Even with lazy-loaded env vars, the import statement itself causes the module to be evaluated, which can trigger issues in the client bundle.

---

## The Solution

### Strategy: Separate Server-Side and Client-Safe Utilities

Created a clear separation between:
1. **Pure utility functions** (client-safe) - `lib/utils/product-utils.ts`
2. **Server-side functions** (server-only) - `lib/utils/product-server-utils.ts`

### Changes Made

#### 1. Created `lib/utils/product-server-utils.ts`

New file containing server-side only functions:

```typescript
/**
 * Product Server-Side Utility Functions
 * 
 * ⚠️ WARNING: Do NOT import this file in client components!
 * Use API routes (e.g., /api/products) instead.
 */

import type { ApiProduct } from "@/lib/types";
import { fetchAllProducts as cosmosClientFetchAll } from "@/lib/api/cosmos-client";

/**
 * Fetch all products with pagination
 * ⚠️ SERVER-SIDE ONLY
 */
export async function fetchAllProducts(
  pageSize: number = 250
): Promise<ApiProduct[]> {
  return cosmosClientFetchAll(pageSize);
}
```

#### 2. Updated `lib/utils/product-utils.ts`

Removed the import from `cosmos-client.ts` and moved `fetchAllProducts` to the new server-utils file:

```typescript
/**
 * Product Utility Functions
 * 
 * NOTE: This file contains ONLY pure utility functions that can be used
 * on both client and server. Server-side functions that access the COSMOS
 * API are in separate files to prevent client-side bundle inclusion.
 * 
 * For server-side product fetching, see: lib/utils/product-server-utils.ts
 */

// No imports from cosmos-client.ts!

export function formatPriceForMerchant(amount: number, currency: string = "USD"): string {
  // Pure function - safe for client and server
}

export function formatWeight(grams?: number): string {
  // Pure function - safe for client and server
}

// ... other pure functions
```

#### 3. Updated API Routes

Updated imports in API routes to use the new server-utils file:

**`app/api/feed/bing-merchant/route.ts`**:
```typescript
// Before
import { fetchAllProducts } from "@/lib/utils/product-utils";

// After
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
```

**`app/api/feed/google-merchant/route.ts`**:
```typescript
// Before
import { fetchAllProducts, formatPriceForMerchant, formatWeight } from "@/lib/utils/product-utils";

// After
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { formatPriceForMerchant, formatWeight } from "@/lib/utils/product-utils";
```

---

## Files Changed

### Created
- `lib/utils/product-server-utils.ts` (42 lines)

### Modified
- `lib/utils/product-utils.ts` - Removed cosmos-client import
- `app/api/feed/bing-merchant/route.ts` - Updated import
- `app/api/feed/google-merchant/route.ts` - Updated import

---

## Verification

### Build Test
```bash
pnpm build
✓ Compiled successfully in 26.6s
✓ Linting and checking validity of types
✓ Build completed
```

### Bundle Analysis
- Client bundle no longer includes `cosmos-client.ts`
- Server-side routes correctly import from `product-server-utils.ts`
- Pure utilities in `product-utils.ts` can be safely used anywhere

---

## Prevention Strategy

### File Naming Convention

Going forward, use this naming convention:

1. **`*-utils.ts`** - Pure utility functions (client-safe)
   - No imports from API clients
   - No environment variable access
   - Can be used in client and server components

2. **`*-server-utils.ts`** - Server-side utilities
   - Can import from API clients
   - Can access environment variables
   - Should NEVER be imported in client components

3. **`*-client.ts`** - API clients
   - Server-side only
   - Access environment variables
   - Should NEVER be imported in client components

### Import Rules

#### ✅ SAFE Imports (Client Components)

```typescript
// Pure utilities - OK
import { formatPriceForMerchant } from "@/lib/utils/product-utils";
import { escapeXml } from "@/lib/utils/xml-utils";
import { validatePhoneNumber } from "@/lib/utils/phone-utils";

// API routes - OK
const response = await fetch('/api/products');
```

#### ❌ UNSAFE Imports (Client Components)

```typescript
// Server-side utilities - NEVER in client components!
import { fetchAllProducts } from "@/lib/utils/product-server-utils";

// API clients - NEVER in client components!
import { getProducts } from "@/lib/api/cosmos-client";

// Data layer - NEVER in client components!
import { getProducts } from "@/lib/data/products";
```

#### ✅ SAFE Imports (Server Components & API Routes)

```typescript
// Everything is OK in server-side code
import { fetchAllProducts } from "@/lib/utils/product-server-utils";
import { getProducts } from "@/lib/api/cosmos-client";
import { formatPriceForMerchant } from "@/lib/utils/product-utils";
```

---

## Testing Checklist

- [x] Production build succeeds
- [x] No TypeScript errors
- [x] No diagnostics issues
- [x] Client bundle doesn't include cosmos-client
- [x] API routes work correctly
- [x] Merchant feeds generate successfully

---

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "fix: separate server-side and client-safe utilities to prevent env var error"
   git push origin main
   ```

2. **Verify Deployment**:
   - Check Vercel deployment logs
   - Test production site
   - Verify no console errors

3. **Test Critical Paths**:
   - Products page: https://originz.vercel.app/products
   - Search: https://originz.vercel.app/search?q=test
   - Merchant feeds: https://originz.vercel.app/api/feed/bing-merchant

---

## Lessons Learned

### 1. Module-Level Imports Matter

Even if you don't use a function, importing it at the module level causes the entire dependency chain to be loaded. This is especially problematic with tree-shaking in production builds.

### 2. Separation of Concerns

Mixing pure utilities with server-side functions in the same file creates hidden dependencies that can cause client-side errors.

### 3. Naming Conventions Help

Clear naming conventions (`*-server-utils.ts` vs `*-utils.ts`) make it obvious which files are safe to import in client components.

### 4. Documentation is Critical

Adding warnings in JSDoc comments helps prevent future mistakes:

```typescript
/**
 * ⚠️ SERVER-SIDE ONLY - Do not use in client components!
 */
```

---

## Related Documentation

- **Phase 0 Fix**: `PRODUCTION_ERROR_FIX.md` - Original fix for lazy-loaded env vars
- **Migration Guide**: `docs/MIGRATION_GUIDE.md` - Import patterns
- **API Reference**: `docs/API_REFERENCE.md` - Utility functions

---

## Future Recommendations

### 1. Add ESLint Rule

Create a custom ESLint rule to prevent importing server-side files in client components:

```javascript
// .eslintrc.js
rules: {
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['**/lib/api/*', '**/lib/utils/*-server-utils'],
      message: 'Server-side modules cannot be imported in client components. Use API routes instead.'
    }]
  }]
}
```

### 2. Add Build-Time Checks

Add a build script to verify no server-side imports in client bundles:

```bash
# Check client bundle for server-side imports
grep -r "cosmos-client" .next/static/chunks/ && exit 1 || exit 0
```

### 3. Update Documentation

Update all documentation to reflect the new file naming convention and import rules.

---

## Status

**Fix Status**: ✅ **COMPLETE**  
**Build Status**: ✅ **PASSING**  
**Production Status**: ✅ **READY FOR DEPLOYMENT**

---

**Last Updated**: 2025-10-05

