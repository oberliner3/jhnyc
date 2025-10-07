# Analytics and Marketing Pixels Setup Guide

This guide explains how to set up and use the comprehensive analytics and marketing pixel tracking system.

## 🎯 Overview

The analytics system provides:
- **Multi-platform tracking** - Google Analytics, Facebook Pixel, TikTok, Pinterest, Snapchat, Microsoft Advertising, Twitter
- **GDPR/CCPA compliance** - Cookie consent management with granular controls
- **E-commerce tracking** - Enhanced e-commerce events for all platforms
- **User privacy** - Configurable consent levels and data protection
- **Performance monitoring** - Page load and interaction tracking

## 🚀 Quick Setup

### 1. Environment Configuration

Add your tracking IDs to `.env.local` (copy from `.env.sample`):

```env
# Google Analytics 4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=123456789012345

# Google Tag Manager (optional if using GA4 directly)
NEXT_PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX

# Other platforms (add as needed)
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXXXXXXX
NEXT_PUBLIC_PINTEREST_TAG_ID=123456789012345
NEXT_PUBLIC_SNAPCHAT_PIXEL_ID=xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_MICROSOFT_UET_TAG_ID=12345678
NEXT_PUBLIC_TWITTER_PIXEL_ID=o1234

# Configuration
NEXT_PUBLIC_ANALYTICS_DEV=false  # Set to true to enable in development
NEXT_PUBLIC_CONSENT_REQUIRED=true  # Set to false to skip consent banner
```

### 2. Add to Your Layout

Update your root layout to include the analytics provider:

```tsx
// app/layout.tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { ConsentBanner } from '@/components/analytics/consent-banner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AnalyticsProvider>
          {children}
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 3. Basic Usage

Track events in your components:

```tsx
import { useAnalytics, useEcommerceTracking } from '@/hooks/useAnalytics';

function ProductPage({ product }) {
  const { trackCustomEvent } = useAnalytics();
  const { trackShopifyProductView, trackShopifyAddToCart } = useEcommerceTracking();

  useEffect(() => {
    // Track product view
    trackShopifyProductView(product);
  }, [product]);

  const handleAddToCart = async () => {
    // Track add to cart
    trackShopifyAddToCart(product, selectedVariant, quantity);
    
    // Your add to cart logic here...
  };

  return (
    // Your component JSX
  );
}
```

## 📊 Supported Platforms

### Google Analytics 4
- **Events**: Page views, e-commerce events, custom events
- **Features**: Enhanced e-commerce, user properties, conversion tracking
- **Setup**: Create GA4 property, get Measurement ID

### Facebook Pixel
- **Events**: PageView, ViewContent, AddToCart, Purchase, Lead, etc.
- **Features**: Advanced matching, conversion API ready, custom audiences
- **Setup**: Create Facebook Pixel in Business Manager

### TikTok Pixel
- **Events**: ViewContent, AddToCart, InitiateCheckout, CompletePayment
- **Features**: Campaign optimization, audience building
- **Setup**: Create TikTok Pixel in TikTok Ads Manager

### Pinterest Pixel
- **Events**: PageVisit, ViewCategory, AddToCart, Checkout, Search
- **Features**: Shopping ads optimization, audience insights
- **Setup**: Create Pinterest Tag in Pinterest Business

### Snapchat Pixel
- **Events**: PAGE_VIEW, VIEW_CONTENT, ADD_CART, PURCHASE, SIGN_UP
- **Features**: Snap Ads optimization, lookalike audiences
- **Setup**: Create Snapchat Pixel in Ads Manager

### Microsoft Advertising (Bing)
- **Events**: Page loads, conversions with revenue tracking
- **Features**: Microsoft Ads optimization, cross-platform reach
- **Setup**: Create UET tag in Microsoft Advertising

### Twitter/X Pixel
- **Events**: PageView, Purchase, AddToCart, CompleteRegistration
- **Features**: Twitter Ads optimization, engagement tracking
- **Setup**: Create Twitter Pixel in Twitter Ads

## 🛠 Advanced Usage

### Custom Event Tracking

```tsx
const { trackCustomEvent } = useAnalytics();

// Track custom business events
trackCustomEvent('video_play', {
  video_title: 'Product Demo',
  video_duration: 120,
  video_position: 'homepage_hero'
});

trackCustomEvent('newsletter_signup', {
  signup_location: 'footer',
  user_type: 'returning_visitor'
});
```

### User Identification

```tsx
const { setUser } = useAnalytics();

// Identify user after login
setUser({
  user_id: user.id,
  email: user.email,
  first_name: user.firstName,
  customer_lifetime_value: user.totalSpent,
  subscription_status: user.isSubscriber ? 'active' : 'inactive'
});
```

### E-commerce Tracking

```tsx
const { trackShopifyPurchase } = useEcommerceTracking();

// Track completed purchase
trackShopifyPurchase(
  order.id,
  order.line_items.map(item => ({
    product: item.product,
    variant: item.variant,
    quantity: item.quantity
  })),
  order.total_price,
  order.tax_price,
  order.shipping_price,
  order.coupon_code
);
```

### Consent Management

```tsx
const { grantAllConsent, denyAllConsent, setAnalyticsOnly } = useConsentManagement();

// Programmatically manage consent
const handleAcceptAnalytics = () => {
  setAnalyticsOnly(); // Only analytics, no advertising
};

const handleAcceptAll = () => {
  grantAllConsent(); // All tracking enabled
};
```

## 🔒 Privacy & Compliance

### GDPR Compliance

The system is designed with GDPR compliance in mind:

- **Consent Before Tracking**: No tracking scripts load until user consent
- **Granular Controls**: Users can choose specific cookie categories
- **Data Minimization**: Only necessary data is collected
- **Right to Withdraw**: Users can change consent preferences anytime

### Consent Categories

1. **Essential**: Always enabled (security, cart functionality)
2. **Analytics**: Website usage analytics (Google Analytics)
3. **Marketing**: Advertising and retargeting pixels
4. **Personalization**: User preferences and customization

### Cookie Banner Configuration

```tsx
<ConsentBanner
  position="bottom"  // or "top"
  theme="light"      // or "dark"
  className="custom-banner-styles"
/>
```

## 🎨 Customization

### Custom Consent Flow

```tsx
import { useAnalyticsContext } from '@/components/analytics/analytics-provider';

function CustomConsentModal() {
  const { setConsent } = useAnalyticsContext();

  const handleCustomConsent = () => {
    setConsent({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    });
  };

  return (
    // Your custom consent UI
  );
}
```

### Platform-Specific Configuration

```tsx
// lib/analytics/config.ts
export const analyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  // ... other platforms
  
  // Custom settings
  enableInDevelopment: true, // Enable tracking in dev mode
  debugMode: true,           // Console logging
  consentRequired: false,    // Skip consent banner
};
```

## 🧪 Development & Testing

### Debug Mode

Enable debug logging in development:

```tsx
// Add to your layout
import { AnalyticsDebugInfo } from '@/components/analytics/analytics-provider';

<AnalyticsProvider>
  {children}
  <AnalyticsDebugInfo /> {/* Shows consent status in dev */}
</AnalyticsProvider>
```

### Testing Events

Use browser developer tools:

```js
// Google Analytics Debug
gtag('config', 'GA_MEASUREMENT_ID', { debug_mode: true });

// Facebook Pixel Debug
fbq('track', 'PageView'); // Check Network tab for pixel fires

// Custom events
analytics.track({
  event_name: 'test_event',
  test_parameter: 'test_value'
});
```

### Environment Testing

```env
# Enable analytics in development
NEXT_PUBLIC_ANALYTICS_DEV=true

# Skip consent for testing
NEXT_PUBLIC_CONSENT_REQUIRED=false
```

## 📈 Analytics Best Practices

### Event Naming Convention

Use consistent naming for custom events:

```tsx
// Good: snake_case, descriptive
trackCustomEvent('product_quick_view', { product_id: 'abc123' });
trackCustomEvent('newsletter_signup_modal', { source: 'exit_intent' });

// Avoid: inconsistent naming
trackCustomEvent('productView', { id: 'abc123' });
trackCustomEvent('newsletter-signup', { src: 'modal' });
```

### E-commerce Events

Track the complete customer journey:

```tsx
// Product discovery
trackShopifyProductView(product);

// Engagement
trackCustomEvent('product_image_zoom', { product_id: product.id });

// Intent
trackShopifyAddToCart(product, variant, quantity);

// Conversion
trackShopifyPurchase(orderId, items, total);
```

### Performance Considerations

- Scripts load asynchronously to avoid blocking page render
- Events are queued until scripts are ready
- Consent state is cached in localStorage
- Debug mode is automatically disabled in production

## 🔧 Troubleshooting

### Common Issues

**Analytics not tracking in development:**
```env
NEXT_PUBLIC_ANALYTICS_DEV=true
```

**Consent banner not appearing:**
```js
// Clear saved consent
localStorage.removeItem('analytics_consent');
localStorage.removeItem('consent_banner_seen');
```

**Events not firing:**
```js
// Check if consent is granted
const { consentGiven } = useAnalyticsContext();
console.log('Consent granted:', consentGiven);
```

**Platform-specific debugging:**
- Google Analytics: Use GA4 DebugView
- Facebook: Use Facebook Pixel Helper browser extension
- All platforms: Check browser Network tab for pixel requests

### Console Logs

In development mode, you'll see detailed logging:

```
🔍 Initializing Analytics Manager...
✅ Analytics initialized with services: ['Google Analytics', 'Facebook Pixel']
📊 Tracking event: { event_name: 'page_view', page_title: '...', ... }
👤 Setting user properties: { user_id: '12345', email: '...' }
🔒 Setting consent: { analytics_storage: 'granted', ... }
```

## 🤝 Integration Examples

The analytics system is designed to work seamlessly with your existing components and flows. Check the following files for integration examples:

- Product pages: Track views and add to cart events
- Checkout flow: Track funnel progression and conversions
- User authentication: Identity and lifecycle events
- Newsletter signup: Lead generation tracking
- Search functionality: Query and results tracking

This comprehensive analytics system provides enterprise-level tracking capabilities while maintaining user privacy and regulatory compliance.