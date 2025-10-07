# ProductCard Component - Usage Guide

## Basic Usage

```tsx
import { ProductCard } from "@/components/product/product-card";

// In your component
<ProductCard product={product} />
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `product` | `ApiProduct` | Yes | Product data from API |

## Features

### 1. Automatic Variant Handling
The component automatically detects and displays variant selectors when a product has multiple variants.

```tsx
// Product with variants - shows selector
<ProductCard product={productWithVariants} />

// Product without variants - no selector shown
<ProductCard product={simpleProduct} />
```

### 2. Image Gallery
- **Mouse:** Hover to see second image
- **Keyboard:** Use arrow keys (←/→) to navigate all images
- **Indicators:** Dots at bottom show current position

### 3. Loading States
The "Add to Cart" button shows loading state automatically:
- Spinner icon replaces cart icon
- Text changes to "Adding..."
- Button is disabled during loading

### 4. Out of Stock Handling
When a product is out of stock:
- "Out of Stock" badge appears
- Both buttons are disabled
- Tooltip explains why buttons are disabled

### 5. Price Updates
When variant is changed:
- Price updates with smooth animation
- Screen readers announce the new price
- Visual pulse effect draws attention

### 6. Accessibility Features

#### Screen Reader Support
- All images have descriptive alt text
- Price changes are announced
- Button states are clearly communicated
- Keyboard navigation instructions provided

#### Keyboard Navigation
- **Tab:** Navigate through interactive elements
- **Enter/Space:** Activate buttons and links
- **Arrow Keys:** Navigate product images (when focused on image)
- **Escape:** Close variant dropdown

#### Focus Management
- Clear focus indicators on all interactive elements
- Focus ring appears around card when any child is focused
- Logical tab order

## Examples

### Example 1: Product Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### Example 2: Featured Products
```tsx
<section className="py-12">
  <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {featuredProducts.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
</section>
```

### Example 3: Search Results
```tsx
<div className="space-y-4">
  <p>{searchResults.length} products found</p>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {searchResults.map((product) => (
      <ProductCard key={product.id} product={product} />
    ))}
  </div>
</div>
```

## Styling

### Default Styling
The component uses Tailwind CSS and respects your theme configuration:
- Card background: `bg-card`
- Text color: `text-card-foreground`
- Border: `border`
- Hover shadow: `hover:shadow-xl`

### Customization
The component is designed to work within your existing design system. It uses:
- CSS variables for colors
- Tailwind utility classes
- Responsive breakpoints

### Grid Recommendations
```css
/* Mobile: 1 column */
grid-cols-1

/* Tablet: 2 columns */
md:grid-cols-2

/* Desktop: 3-4 columns */
lg:grid-cols-3
xl:grid-cols-4
```

## Product Data Requirements

### Minimum Required Fields
```typescript
{
  id: string;
  title: string;
  handle: string;
  price: number;
  in_stock: boolean;
  images: Array<{
    src: string;
    alt?: string;
  }>;
}
```

### Optional Fields
```typescript
{
  body_html?: string;          // Product description
  compare_at_price?: number;   // Original price for discount
  variants?: Array<{           // Product variants
    id: string;
    title: string;
    price: number;
    available: boolean;
  }>;
  options?: Array<{            // Variant options
    name: string;
    values: string[];
  }>;
}
```

## Behavior Details

### Image Navigation
1. **On hover:** Shows second image (if available)
2. **On keyboard focus:** Can navigate all images with arrow keys
3. **Indicators:** Dots show current position
4. **Screen reader:** Announces current image position

### Variant Selection
1. **Initial state:** First variant auto-selected
2. **On change:** Price updates with animation
3. **Unavailable variants:** Shown but disabled
4. **No selection:** Buttons disabled until variant chosen

### Add to Cart Flow
1. User clicks "Add to Cart"
2. Button shows loading state
3. Item added to cart (via context)
4. Toast notification appears
5. Button returns to normal state

### Buy Now Flow
1. User clicks "Buy Now"
2. Button shows loading state
3. Item added to checkout
4. User redirected to checkout
5. Toast notification appears

## Accessibility Checklist

- ✅ All images have alt text
- ✅ All buttons have labels
- ✅ Keyboard navigation works
- ✅ Screen reader tested
- ✅ Focus indicators visible
- ✅ Color contrast meets WCAG AA
- ✅ Touch targets are 44x44px minimum
- ✅ No keyboard traps
- ✅ Semantic HTML used
- ✅ ARIA labels where appropriate

## Performance Considerations

### Image Loading
- Uses Next.js Image component
- Lazy loading enabled
- Responsive sizes configured
- Optimized for Core Web Vitals

### State Management
- Uses `useCallback` to prevent unnecessary re-renders
- Memoized event handlers
- Efficient state updates

### Bundle Size
- No additional dependencies
- Uses existing UI components
- Tree-shakeable imports

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Common Issues & Solutions

### Issue: Variant selector not showing
**Solution:** Ensure product has `variants` array with length > 1

### Issue: Images not loading
**Solution:** Check image URLs are valid and accessible

### Issue: Price not updating
**Solution:** Ensure variants have `price` property

### Issue: Buttons always disabled
**Solution:** Check `product.in_stock` is true and variant is available

### Issue: Keyboard navigation not working
**Solution:** Ensure product has multiple images

## Testing

### Manual Testing
```bash
# Test with different product types
- Product with no variants
- Product with variants
- Product with multiple images
- Product with one image
- Out of stock product
- Product with discount
```

### Accessibility Testing
```bash
# Use these tools
- axe DevTools
- Lighthouse
- NVDA/JAWS screen reader
- Keyboard only navigation
```

### Visual Testing
```bash
# Test responsive design
- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)
```

## Related Components

- `BuyNowButton` - Handles buy now functionality
- `useProductVariants` - Manages variant state
- `useCart` - Cart context for add to cart
- `Badge` - UI component for badges
- `Button` - UI component for buttons
- `Select` - UI component for variant selector

## Migration from Old Version

If upgrading from the previous version:

1. **No breaking changes** - Component API is the same
2. **New features** - Keyboard navigation, loading states, better accessibility
3. **CSS addition** - Price animation added to `globals.css`
4. **Testing** - Test keyboard navigation and screen reader support

## Support

For issues or questions:
1. Check this documentation
2. Review the comparison guide (`PRODUCT_CARD_COMPARISON.md`)
3. Check the improvements summary (`PRODUCT_CARD_IMPROVEMENTS.md`)

