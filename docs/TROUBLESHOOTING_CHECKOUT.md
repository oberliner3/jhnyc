# Troubleshooting Checkout Issues

## Common Issues

### Issue 1: "Body has already been read" Error

#### Error Message
```
TypeError: Body is unusable: Body has already been read
```

#### Root Cause
This error occurred when trying to read the HTTP response body multiple times. The Fetch API only allows reading the response body once.

#### Solution
✅ **FIXED** - The error handling code has been updated to read the response body as text first, then parse it as JSON. This allows proper error handling without consuming the body stream multiple times.

### Issue 2: JSON Parse Error

#### Error Message
```
SyntaxError: Unexpected token 'T', "The deploy"... is not valid JSON
```

#### Root Cause
The `/api/draft-orders` endpoint is returning an HTML error page instead of JSON. This typically happens when:

1. **Shopify Configuration is Missing or Invalid**
2. **Environment Variables are Not Set**
3. **API Endpoint is Not Accessible**

#### Solution
✅ **FIXED** - The API endpoint now validates Shopify configuration early and returns proper JSON error responses. The error handling in actions has been improved to show clear error messages.

## Solution Steps

### Step 1: Verify Environment Variables

Check that your `.env.local` file contains all required Shopify configuration:

```bash
# Required Shopify Configuration
SHOPIFY_ACCESS_TOKEN=your-shopify-access-token
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_SHOP=your-shop-name.myshopify.com
```

**Note:** You need either `SHOPIFY_ACCESS_TOKEN` or `SHOPIFY_TOKEN` (they're aliases).

### Step 2: Get Shopify Credentials

If you don't have Shopify credentials yet:

1. **Log in to Shopify Admin**
   - Go to your Shopify store admin panel
   - URL format: `https://your-shop-name.myshopify.com/admin`

2. **Create a Custom App**
   - Navigate to: Settings → Apps and sales channels → Develop apps
   - Click "Create an app"
   - Name it (e.g., "Draft Orders API")
   - Click "Create app"

3. **Configure API Scopes**
   - Go to "Configuration" tab
   - Under "Admin API access scopes", select:
     - `write_draft_orders` (required)
     - `read_draft_orders` (recommended)
     - `write_products` (if needed)
     - `read_products` (if needed)
   - Click "Save"

4. **Install the App**
   - Go to "API credentials" tab
   - Click "Install app"
   - Confirm installation

5. **Get Access Token**
   - After installation, you'll see "Admin API access token"
   - Click "Reveal token once" and copy it
   - **IMPORTANT:** Save this token securely - you can only see it once!

6. **Update Environment Variables**
   ```bash
   SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SHOPIFY_SHOP_NAME=your-shop-name
   SHOPIFY_SHOP=your-shop-name.myshopify.com
   ```

### Step 3: Restart Development Server

After updating environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

### Step 4: Test the API Endpoint

Test the draft orders API directly:

```bash
curl -X POST http://localhost:3000/api/draft-orders \
  -H "Content-Type: application/json" \
  -d '{
    "lineItems": [{
      "variantId": "40559153610795",
      "productId": "7013271994411",
      "quantity": 1,
      "price": "293.99",
      "title": "Test Product"
    }]
  }'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "draftOrder": {
    "id": "gid://shopify/DraftOrder/...",
    "name": "#D1",
    "invoiceUrl": "https://...",
    "totalPrice": "293.99",
    ...
  }
}
```

**Expected Response (Configuration Error):**
```json
{
  "success": false,
  "error": "Shopify configuration is missing. Provide SHOPIFY_ACCESS_TOKEN (or SHOPIFY_TOKEN), SHOPIFY_SHOP, and SHOPIFY_SHOP_NAME."
}
```

### Step 5: Verify Error Handling

With the updated code, you should now see more helpful error messages:

- **Before:** `Unexpected token 'T', "The deploy"... is not valid JSON`
- **After:** `Shopify configuration is missing. Provide SHOPIFY_ACCESS_TOKEN...`

## Common Issues and Solutions

### Issue 1: "Shopify configuration is missing"

**Solution:**
- Verify all three environment variables are set:
  - `SHOPIFY_ACCESS_TOKEN` (or `SHOPIFY_TOKEN`)
  - `SHOPIFY_SHOP`
  - `SHOPIFY_SHOP_NAME`
- Restart the dev server after adding them

### Issue 2: "Shopify API request failed: 401 Unauthorized"

**Solution:**
- Your access token is invalid or expired
- Create a new custom app and get a new token
- Update `SHOPIFY_ACCESS_TOKEN` in `.env.local`

### Issue 3: "Shopify API request failed: 403 Forbidden"

**Solution:**
- Your app doesn't have the required permissions
- Go to your custom app settings
- Add `write_draft_orders` scope
- Reinstall the app

### Issue 4: "No invoice URL returned from draft order API"

**Solution:**
- The draft order was created but doesn't have an invoice URL
- This might happen if the product/variant doesn't exist
- Verify the product and variant IDs are correct
- Check Shopify admin to see if the draft order was created

### Issue 5: "API returned non-JSON response"

**Solution:**
- The API endpoint is returning HTML instead of JSON
- This usually means there's a server error
- Check the server logs for more details
- Verify Shopify configuration is correct

## Testing Checklist

After fixing the configuration:

- [ ] Environment variables are set correctly
- [ ] Dev server has been restarted
- [ ] API endpoint returns JSON (not HTML)
- [ ] "Buy Now" button creates draft orders
- [ ] Cart checkout creates draft orders
- [ ] Error messages are user-friendly
- [ ] Redirects to payment URL work correctly

## Debugging Tips

### Enable Detailed Logging

Add console logs to see what's happening:

```typescript
// In lib/actions.ts
console.log('Creating draft order with payload:', payload);
console.log('API URL:', `${process.env.NEXT_PUBLIC_SITE_URL}/api/draft-orders`);
```

### Check Server Logs

Watch the terminal where `pnpm dev` is running for error messages.

### Inspect Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Buy Now" or "Checkout"
4. Look for the request to `/api/draft-orders`
5. Check the response body

### Test with Minimal Data

Try creating a draft order with minimal data:

```json
{
  "lineItems": [{
    "variantId": "your-variant-id",
    "quantity": 1
  }]
}
```

## Environment Variables Reference

### Required Variables

```bash
# Shopify Configuration (Server-side only)
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SHOPIFY_SHOP_NAME=your-shop-name
SHOPIFY_SHOP=your-shop-name.myshopify.com

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Optional Variables

```bash
# Alternative to SHOPIFY_ACCESS_TOKEN
SHOPIFY_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Notes

1. **Never commit `.env.local` to git**
   - It's already in `.gitignore`
   - Contains sensitive credentials

2. **Use server-side variables for Shopify**
   - Don't use `NEXT_PUBLIC_` prefix for Shopify credentials
   - They should never be exposed to the client

3. **Rotate tokens regularly**
   - Create new custom apps periodically
   - Delete old apps after migration

4. **Limit API scopes**
   - Only grant necessary permissions
   - Use `write_draft_orders` and `read_draft_orders` only

## Additional Resources

- [Shopify Admin API Documentation](https://shopify.dev/docs/api/admin)
- [Draft Orders API Reference](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftOrderCreate)
- [Custom App Setup Guide](https://shopify.dev/docs/apps/auth/admin-app-access-tokens)

## Support

If you're still experiencing issues after following this guide:

1. Check the error logs in the terminal
2. Verify all environment variables are set
3. Test the API endpoint directly with curl
4. Check Shopify admin for any draft orders that were created
5. Review the network requests in browser DevTools

## Recent Changes

### Improved Error Handling (Latest Update)

The following improvements have been made:

1. **Better JSON Parse Error Handling**
   - Catches non-JSON responses
   - Shows first 200 characters of error response
   - Provides more context about what went wrong

2. **Configuration Validation**
   - Checks Shopify config before processing requests
   - Returns proper JSON error responses
   - Logs configuration errors to console

3. **User-Friendly Error Messages**
   - Replaces cryptic parse errors with clear messages
   - Helps identify the root cause quickly
   - Guides users to the solution

These changes ensure that configuration issues are caught early and reported clearly, making it easier to diagnose and fix problems.
