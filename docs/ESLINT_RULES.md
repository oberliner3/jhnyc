# ESLint Rules - OriGenZ

**Last Updated**: 2025-10-05

This document explains the custom ESLint rules configured for the OriGenZ project.

---

## Table of Contents

1. [Server-Side Import Restriction](#server-side-import-restriction)
2. [React Danger Rules](#react-danger-rules)
3. [Testing the Rules](#testing-the-rules)

---

## Server-Side Import Restriction

### Rule: `no-restricted-imports`

**Purpose**: Prevent importing server-side modules in client components to avoid exposing environment variables to the client bundle.

**Severity**: Error

**Patterns Restricted**:
- `**/lib/api/*` - API clients (e.g., `cosmos-client.ts`)
- `**/lib/utils/*-server-utils*` - Server-side utilities (e.g., `product-server-utils.ts`)

### Why This Rule Exists

This rule prevents a critical production error where server-side environment variables are accessed on the client, causing the application to crash. See `PRODUCTION_ERROR_FIX_V2.md` for the full incident report.

### Error Message

```
'@/lib/api/cosmos-client' import is restricted from being used by a pattern.
Server-side modules cannot be imported in client components.
Use API routes (e.g., /api/products) instead.
See docs/MIGRATION_GUIDE.md for details.
```

### Examples

#### ❌ INCORRECT - Client Component

```typescript
"use client";

// ❌ ERROR: Cannot import server-side modules in client components
import { getProducts } from "@/lib/api/cosmos-client";
import { fetchAllProducts } from "@/lib/utils/product-server-utils";

export default function ProductsPage() {
  // This will trigger ESLint error
}
```

#### ✅ CORRECT - Client Component

```typescript
"use client";

// ✅ OK: Use API routes instead
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

#### ✅ CORRECT - Server Component

```typescript
// ✅ OK: Server components can import server-side modules
import { getProducts } from "@/lib/api/cosmos-client";

export default async function ProductsPage() {
  const products = await getProducts({ limit: 24 });
  
  return <div>{/* ... */}</div>;
}
```

#### ✅ CORRECT - API Route

```typescript
// ✅ OK: API routes can import server-side modules
import { fetchAllProducts } from "@/lib/utils/product-server-utils";

export async function GET() {
  const products = await fetchAllProducts();
  return Response.json({ products });
}
```

### Exempted Files

The following file patterns are **exempt** from this rule (they can import server-side modules):

- `app/api/**/*.ts` - API routes
- `app/api/**/*.tsx` - API route components
- `lib/api/**/*.ts` - API client implementations
- `lib/utils/*-server-utils.ts` - Server-side utility implementations
- `lib/data/**/*.ts` - Data layer files

### Configuration

```javascript
// eslint.config.mjs
{
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{
        group: ["**/lib/api/*", "**/lib/utils/*-server-utils*"],
        message: "Server-side modules cannot be imported in client components. Use API routes (e.g., /api/products) instead. See docs/MIGRATION_GUIDE.md for details."
      }]
    }],
  },
}
```

---

## React Danger Rules

### Rule: `react/no-danger`

**Purpose**: Prevent the use of `dangerouslySetInnerHTML` to avoid XSS vulnerabilities.

**Severity**: Error

**Exempted Files**:
- `components/common/product-schema.tsx` - Structured data (JSON-LD)
- `components/common/website-schema.tsx` - Structured data (JSON-LD)
- `components/common/safe-html.tsx` - Sanitized HTML rendering

### Rule: `react/no-danger-with-children`

**Purpose**: Prevent using `dangerouslySetInnerHTML` with children, which is invalid.

**Severity**: Error

**Exempted Files**: Same as `react/no-danger`

---

## Testing the Rules

### Manual Testing

You can test the ESLint rules by creating a test file:

```typescript
// test-eslint.tsx
"use client";

import { getProducts } from "@/lib/api/cosmos-client"; // Should error

export default function Test() {
  return <div>Test</div>;
}
```

Run ESLint:
```bash
pnpm eslint test-eslint.tsx
```

Expected output:
```
test-eslint.tsx
  3:1  error  '@/lib/api/cosmos-client' import is restricted...
```

### Automated Testing

The rule is automatically checked during:

1. **Development**: ESLint runs in your IDE
2. **Pre-commit**: (if configured)
3. **Build**: `pnpm build` runs linting
4. **CI/CD**: (if configured)

---

## Troubleshooting

### False Positives

If you encounter a false positive (a server-side file being flagged):

1. **Check if the file should be exempt**: Is it an API route or server component?
2. **Add to exemptions**: Update `eslint.config.mjs` to include the file pattern

Example:
```javascript
{
  files: [
    "app/api/**/*.ts",
    "your/new/pattern/**/*.ts", // Add here
  ],
  rules: {
    "no-restricted-imports": "off",
  },
}
```

### Disabling for Specific Lines

If you absolutely need to disable the rule for a specific line (not recommended):

```typescript
// eslint-disable-next-line no-restricted-imports
import { getProducts } from "@/lib/api/cosmos-client";
```

**Warning**: Only do this if you're certain the code is server-side only!

---

## Best Practices

### 1. Follow File Naming Convention

- `*-utils.ts` - Client-safe utilities
- `*-server-utils.ts` - Server-side utilities
- `*-client.ts` - API clients

### 2. Use API Routes for Client Components

```typescript
// ✅ Good
const response = await fetch('/api/products');

// ❌ Bad
import { getProducts } from "@/lib/api/cosmos-client";
```

### 3. Use Server Components When Possible

```typescript
// ✅ Good - Server Component
export default async function Page() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// ❌ Less optimal - Client Component with API route
"use client";
export default function Page() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(/* ... */);
  }, []);
  return <ProductList products={products} />;
}
```

### 4. Document Exceptions

If you add a file to the exemptions, document why:

```javascript
{
  files: [
    "lib/special-case.ts", // Exempt because: [reason]
  ],
  rules: {
    "no-restricted-imports": "off",
  },
}
```

---

## Related Documentation

- **Migration Guide**: `docs/MIGRATION_GUIDE.md` - Import patterns and file naming
- **Production Error Fix**: `PRODUCTION_ERROR_FIX_V2.md` - Why this rule exists
- **Critical Fix Summary**: `CRITICAL_FIX_SUMMARY.md` - Quick reference

---

## Future Improvements

### Potential Enhancements

1. **Custom ESLint Plugin**: Create a custom plugin with more specific rules
2. **Auto-fix**: Automatically suggest API route usage
3. **Type Checking**: Integrate with TypeScript for better detection
4. **Pre-commit Hook**: Automatically run ESLint before commits

### Suggested Additional Rules

```javascript
// Prevent importing from lib/data in client components
{
  patterns: [{
    group: ["**/lib/data/*"],
    message: "Data layer cannot be imported in client components."
  }]
}
```

---

## Support

If you have questions about the ESLint rules:

1. Check this documentation
2. Review `docs/MIGRATION_GUIDE.md`
3. Check the error message for guidance
4. Contact the development team

---

**Last Updated**: 2025-10-05

