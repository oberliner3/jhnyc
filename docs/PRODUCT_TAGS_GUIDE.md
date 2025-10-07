# Product Tags - Developer Guide

## Overview
Product tags can come from the API in multiple formats. Always use the `normalizeProductTags()` utility to safely handle them.

---

## Quick Start

### Import the Utility
```typescript
import { normalizeProductTags } from "@/lib/utils";
```

### Use in Your Component
```typescript
// ✅ CORRECT - Safe handling
const productTags = normalizeProductTags(product.tags);
productTags.forEach(tag => console.log(tag));

// ❌ WRONG - Will crash if tags is null or array
product.tags.split(",").forEach(tag => console.log(tag));
```

---

## Supported Formats

The utility handles all these formats:

### 1. Comma-Separated String (Most Common)
```typescript
const tags = "electronics, smartphones, android";
normalizeProductTags(tags);
// Returns: ["electronics", "smartphones", "android"]
```

### 2. Array Format
```typescript
const tags = ["electronics", "smartphones", "android"];
normalizeProductTags(tags);
// Returns: ["electronics", "smartphones", "android"]
```

### 3. Null or Undefined
```typescript
const tags = null;
normalizeProductTags(tags);
// Returns: []
```

### 4. Empty String
```typescript
const tags = "";
normalizeProductTags(tags);
// Returns: []
```

### 5. String with Extra Whitespace
```typescript
const tags = " electronics , smartphones ,  android ";
normalizeProductTags(tags);
// Returns: ["electronics", "smartphones", "android"]
```

---

## Common Use Cases

### 1. Displaying Tags
```typescript
import { normalizeProductTags } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function ProductTags({ product }: { product: ApiProduct }) {
  const tags = normalizeProductTags(product.tags);
  
  if (tags.length === 0) return null;
  
  return (
    <div className="flex gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
```

### 2. Filtering by Tags
```typescript
import { normalizeProductTags } from "@/lib/utils";

function filterProductsByTag(products: ApiProduct[], searchTag: string) {
  return products.filter((product) => {
    const tags = normalizeProductTags(product.tags);
    return tags.some((tag) => 
      tag.toLowerCase().includes(searchTag.toLowerCase())
    );
  });
}
```

### 3. Checking if Product Has Tag
```typescript
import { normalizeProductTags } from "@/lib/utils";

function hasTag(product: ApiProduct, targetTag: string): boolean {
  const tags = normalizeProductTags(product.tags);
  return tags.some((tag) => 
    tag.toLowerCase() === targetTag.toLowerCase()
  );
}
```

### 4. Getting Tag Count
```typescript
import { normalizeProductTags } from "@/lib/utils";

function getTagCount(product: ApiProduct): number {
  return normalizeProductTags(product.tags).length;
}
```

### 5. Search Across Multiple Fields
```typescript
import { normalizeProductTags } from "@/lib/utils";

function searchProducts(products: ApiProduct[], query: string) {
  const lowerQuery = query.toLowerCase();
  
  return products.filter((product) => {
    const tags = normalizeProductTags(product.tags);
    
    return (
      product.title.toLowerCase().includes(lowerQuery) ||
      product.body_html.toLowerCase().includes(lowerQuery) ||
      tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}
```

---

## Type Definition

```typescript
// From lib/types.ts
export interface ApiProduct {
  // ... other fields
  
  /**
   * Product tags - can be either a comma-separated string or an array
   * Use normalizeProductTags() utility to safely handle both formats
   */
  tags: string | string[] | null;
  
  // ... other fields
}
```

---

## Migration Guide

### Before (Unsafe)
```typescript
// ❌ This will crash if tags is null or an array
{product.tags && product.tags.length > 0 && (
  <div>
    {product.tags.split(",").map((tag) => (
      <Badge key={tag}>{tag}</Badge>
    ))}
  </div>
)}
```

### After (Safe)
```typescript
// ✅ This handles all formats safely
{(() => {
  const tags = normalizeProductTags(product.tags);
  return tags.length > 0 ? (
    <div>
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </div>
  ) : null;
})()}
```

Or even better, extract to a component:
```typescript
// ✅ Clean and reusable
function ProductTags({ product }: { product: ApiProduct }) {
  const tags = normalizeProductTags(product.tags);
  
  if (tags.length === 0) return null;
  
  return (
    <div className="flex gap-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="outline">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// Usage
<ProductTags product={product} />
```

---

## Best Practices

### ✅ DO
- Always use `normalizeProductTags()` when working with product tags
- Check if the returned array is empty before rendering
- Use the utility in filters, searches, and display logic
- Extract tag logic into reusable components

### ❌ DON'T
- Don't call `.split(",")` directly on `product.tags`
- Don't assume tags is always a string
- Don't check `product.tags.length` without normalizing first
- Don't use `Array.isArray()` checks - use the utility instead

---

## Testing

### Test Cases to Cover
```typescript
import { normalizeProductTags } from "@/lib/utils";

describe("normalizeProductTags", () => {
  it("handles comma-separated string", () => {
    expect(normalizeProductTags("tag1, tag2, tag3"))
      .toEqual(["tag1", "tag2", "tag3"]);
  });
  
  it("handles array format", () => {
    expect(normalizeProductTags(["tag1", "tag2", "tag3"]))
      .toEqual(["tag1", "tag2", "tag3"]);
  });
  
  it("handles null", () => {
    expect(normalizeProductTags(null)).toEqual([]);
  });
  
  it("handles undefined", () => {
    expect(normalizeProductTags(undefined)).toEqual([]);
  });
  
  it("handles empty string", () => {
    expect(normalizeProductTags("")).toEqual([]);
  });
  
  it("trims whitespace", () => {
    expect(normalizeProductTags(" tag1 , tag2 , tag3 "))
      .toEqual(["tag1", "tag2", "tag3"]);
  });
  
  it("filters empty tags", () => {
    expect(normalizeProductTags("tag1, , tag2"))
      .toEqual(["tag1", "tag2"]);
  });
});
```

---

## FAQ

### Q: Why not just fix the API to always return arrays?
**A:** The API is external and may return different formats. The utility provides a safety layer that works regardless of the API's behavior.

### Q: What if I need the original format?
**A:** You can still access `product.tags` directly, but you'll need to handle all possible formats yourself. It's recommended to use the utility.

### Q: Does this affect performance?
**A:** No. The utility is very lightweight and only does simple string/array operations. The performance impact is negligible.

### Q: Can I use this for other comma-separated fields?
**A:** Yes! The utility works for any comma-separated string or array. Just pass the value to `normalizeProductTags()`.

---

## Related Files

- **Utility Function**: `lib/utils.ts` - `normalizeProductTags()`
- **Type Definition**: `lib/types.ts` - `ApiProduct.tags`
- **Example Usage**: `hooks/use-search.ts`
- **Example Component**: `app/(store)/products/[handle]/product-details-client.tsx`

---

## Support

If you encounter issues with product tags:
1. Verify you're using `normalizeProductTags()`
2. Check the TypeScript types are correct
3. Test with different tag formats (string, array, null)
4. Review the examples in this guide

