# API Reference - OriGenZ

**Version**: 1.0  
**Last Updated**: 2025-10-05

---

## COSMOS API Client

### Overview

The COSMOS API client (`lib/api/cosmos-client.ts`) provides a type-safe interface to the external COSMOS product catalog API.

**Base URL**: `https://moritotabi.com`  
**Authentication**: API Key via `X-API-Key` header

### Configuration

```typescript
// Environment variables (server-side only)
COSMOS_API_BASE_URL=https://moritotabi.com
COSMOS_API_KEY=your-api-key-here
```

### Methods

#### `getProducts(options)`
Fetch paginated list of products.

#### `searchProducts(query, options)`
Search for products by query string.

#### `getProductByKey(key, options)`
Get a single product by its unique key.

#### `getCollectionProducts(handle, options)`
Get products from a specific collection.

---

## Internal API Routes

### `/api/products`
Fetch products with pagination (GET)

### `/api/feed/bing-merchant`
Generate Bing Merchant Center product feed (GET)

### `/api/feed/google-merchant`
Generate Google Merchant Center product feed (GET)

### `/api/draft-orders`
Create a Shopify draft order (POST)

---

## Utility Functions

### Product Utilities (`lib/utils/product-utils.ts`)
- `fetchAllProducts(pageSize?)` - Fetch all products with pagination
- `formatPriceForMerchant(amount, currency?)` - Format price for feeds
- `formatWeight(grams?)` - Format weight in pounds
- `isLikelyGTIN(sku?)` - Check if SKU is a GTIN

### Merchant Feed Utilities (`lib/utils/merchant-feed-utils.ts`)
- `processProductVariants(...)` - Process variants into feed items
- `generateMerchantFeedXml(...)` - Generate complete XML feed
- `getVariantOptionValue(...)` - Extract variant options
- `calculateVariantPricing(...)` - Calculate pricing
- `getVariantImageUrl(...)` - Get best image URL

### Phone Utilities (`lib/utils/phone-utils.ts`)
- `formatPhoneAsYouType(value, countryCode)` - Format as user types
- `validatePhoneNumber(value, countryCode)` - Validate phone
- `formatPhoneForStorage(phoneNumber, countryCode)` - E.164 format
- `formatPhoneForDisplay(phoneNumber, countryCode)` - International format
- `getCountryCallingCode(countryCode)` - Get calling code

### XML Utilities (`lib/utils/xml-utils.ts`)
- `escapeXml(str)` - Escape XML special characters
- `stripHtml(html)` - Strip HTML tags
- `createCDATA(content)` - Create CDATA section
- `buildXmlElement(tag, content, attributes?)` - Build XML element

### Validation Utilities (`lib/utils/validation-utils.ts`)
- `transformZodErrors(error)` - Transform Zod errors to field-error format
- `transformZodErrorsToArray(error)` - Transform to array format
- `validateField(schema, value)` - Validate single field
- `safeValidate(schema, data)` - Safe validation wrapper

### Logger (`lib/utils/logger.ts`)
- `logger.debug(message, context?)` - Debug logging
- `logger.info(message, context?)` - Info logging
- `logger.warn(message, context?)` - Warning logging
- `logger.error(message, error?)` - Error logging
- `logger.api(method, url, status, duration?)` - API logging
- `logger.perf(operation, duration, context?)` - Performance logging

---

## Complete Documentation

For detailed documentation with examples, parameters, and return types, see:
- JSDoc comments in source files
- `lib/utils/merchant-feed-utils.ts` - Comprehensive JSDoc
- `lib/utils/phone-utils.ts` - Comprehensive JSDoc
- `lib/api/cosmos-client.ts` - Full API client documentation

---

**Last Updated**: 2025-10-05

