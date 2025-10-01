# Experience Tracking System

A comprehensive user behavior tracking system for Next.js applications with Supabase integration.

## Overview

This experience tracking system provides:
- **Automatic tracking** of page views, clicks, scrolls, form interactions, and errors
- **Performance monitoring** with Core Web Vitals (LCP, FID, CLS)
- **User journey tracking** for conversion funnels
- **E-commerce tracking** for product interactions and purchases
- **Real-time data collection** with efficient batching
- **Privacy-compliant** with GDPR/CCPA support (Do Not Track, IP anonymization)
- **TypeScript support** with comprehensive type definitions

## Quick Start

### 1. Database Setup

First, run the experience tracking migration in your Supabase database:

```sql
-- Run the migration file: supabase/migrations/20241222_experience_tracking.sql
```

### 2. Environment Variables

Add your Supabase service role key to your environment variables:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Wrap Your App with the Provider

```tsx
// app/layout.tsx or _app.tsx
import { ExperienceTrackingProvider } from '@/lib/experience-tracking/provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ExperienceTrackingProvider
          config={{
            enablePageViews: true,
            enableClicks: true,
            enableScrollTracking: true,
            enableFormTracking: true,
            enablePerformanceTracking: true,
            sampleRate: 1.0, // Track 100% of users
            debug: process.env.NODE_ENV === 'development',
          }}
        >
          {children}
        </ExperienceTrackingProvider>
      </body>
    </html>
  );
}
```

### 4. Use in Components

```tsx
// components/ProductCard.tsx
import { useProductTracking, useClickTracking } from '@/lib/experience-tracking/hooks';

export function ProductCard({ product }) {
  const { trackProductView, trackProductClick, trackAddToCart } = useProductTracking();
  const trackButtonClick = useClickTracking('add-to-cart-button');

  useEffect(() => {
    // Track product view when component mounts
    trackProductView(product.id, {
      name: product.name,
      category: product.category,
      price: product.price,
    });
  }, [product.id]);

  const handleProductClick = () => {
    trackProductClick(product.id, { name: product.name });
    // Navigate to product page
  };

  const handleAddToCart = () => {
    trackAddToCart(product.id, 1, product.price, {
      name: product.name,
      category: product.category,
    });
    trackButtonClick(); // Track the specific button click
    // Add to cart logic
  };

  return (
    <div onClick={handleProductClick}>
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={(e) => {
        e.stopPropagation();
        handleAddToCart();
      }}>
        Add to Cart
      </button>
    </div>
  );
}
```

## Hooks Reference

### useExperienceTracker()

Main hook for custom event tracking:

```tsx
const { track, setUserId, trackPageView, flush } = useExperienceTracker();

// Track custom event
track({
  eventType: 'engagement',
  eventName: 'video_play',
  properties: {
    videoId: 'abc123',
    duration: 120,
  },
});

// Set user ID when user logs in
setUserId('user_12345');
```

### usePageViewTracking()

Automatically tracks page views:

```tsx
// In page components
usePageViewTracking(); // Uses current URL and title
// or
usePageViewTracking('/custom-path', 'Custom Title');
```

### useClickTracking()

Track specific element clicks:

```tsx
const trackClick = useClickTracking('hero-cta-button', {
  position: 'above-fold',
  variant: 'primary',
});

<button onClick={trackClick}>
  Sign Up Now
</button>
```

### useFormTracking()

Track form interactions:

```tsx
const { trackFormStart, trackFormSubmit, trackFieldInteraction } = useFormTracking('contact-form');

<form onSubmit={async (e) => {
  e.preventDefault();
  try {
    await submitForm(formData);
    trackFormSubmit(true);
  } catch (error) {
    trackFormSubmit(false, error.message);
  }
}}>
  <input 
    onFocus={() => trackFieldInteraction('email', 'email', 'focus')}
    onChange={() => trackFieldInteraction('email', 'email', 'change')}
  />
</form>
```

### useProductTracking()

E-commerce specific tracking:

```tsx
const { 
  trackProductView, 
  trackProductClick, 
  trackAddToCart, 
  trackRemoveFromCart,
  trackPurchase 
} = useProductTracking();

// Track purchase
trackPurchase('order_123', 99.99, [
  { productId: 'prod_1', quantity: 2, price: 29.99 },
  { productId: 'prod_2', quantity: 1, price: 39.99 },
]);
```

### useJourneyTracking()

Track user journeys and conversion funnels:

```tsx
const { startStep, completeStep } = useJourneyTracking('signup');

// Start a journey step
useEffect(() => {
  startStep('email_entry', 1, { source: 'homepage' });
}, []);

// Complete the step
const handleEmailSubmit = () => {
  completeStep('email_entry');
  startStep('password_creation', 2);
};
```

### useSearchTracking()

Track search behavior:

```tsx
const { trackSearch, trackSearchResultClick, trackFilterChange } = useSearchTracking();

const handleSearch = (query: string, results: any[]) => {
  trackSearch(query, results.length);
};

const handleResultClick = (query: string, resultId: string, position: number) => {
  trackSearchResultClick(query, position, resultId, 'product');
};
```

### useErrorTracking()

Track errors and exceptions:

```tsx
const { trackError, trackApiError, trackValidationError } = useErrorTracking();

try {
  await apiCall();
} catch (error) {
  trackApiError('/api/products', error.status, error.message);
}
```

### useEngagementTracking()

Track content engagement:

```tsx
const { trackInteraction } = useEngagementTracking('article_123', 'blog-post');

// Automatically tracks view time and content engagement
// Use trackInteraction for specific interactions
const handleShare = () => {
  trackInteraction('share', { platform: 'twitter' });
};
```

## Configuration Options

```tsx
const config = {
  // Feature toggles
  enablePageViews: true,
  enableClicks: true,
  enableScrollTracking: true,
  enableFormTracking: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  
  // Sampling
  sampleRate: 1.0, // 0.0 to 1.0
  performanceSampleRate: 0.1, // Sample 10% for performance
  
  // Scroll tracking
  scrollDepthThresholds: [25, 50, 75, 90],
  timeOnPageThreshold: 5, // seconds
  
  // Performance
  scrollDebounceMs: 100,
  resizeDebounceMs: 250,
  batchSize: 50,
  flushInterval: 10000, // 10 seconds
  
  // Privacy
  respectDNT: true, // Respect "Do Not Track" header
  anonymizeIPs: true,
  
  // Debugging
  debug: process.env.NODE_ENV === 'development',
};
```

## Custom Events

Track custom events for specific business logic:

```tsx
const { track } = useExperienceTracker();

// Newsletter signup
track({
  eventType: 'conversion',
  eventName: 'newsletter_signup',
  properties: {
    source: 'footer',
    listId: 'weekly_digest',
  },
});

// Feature usage
track({
  eventType: 'feature_usage',
  eventName: 'filter_applied',
  properties: {
    filterType: 'price_range',
    minPrice: 10,
    maxPrice: 100,
  },
});

// Content interaction
track({
  eventType: 'engagement',
  eventName: 'video_milestone',
  properties: {
    videoId: 'tutorial_intro',
    milestone: '50_percent',
    totalDuration: 300,
  },
});
```

## Journey Types

Predefined journey types for common conversion funnels:

- `signup` - User registration funnel
- `onboarding` - New user onboarding
- `purchase` - E-commerce checkout flow
- `subscription` - Subscription signup
- `support` - Support ticket creation
- `content` - Content consumption journey
- `feature_adoption` - Feature discovery and adoption
- `referral` - Referral program participation
- `custom` - Custom journey types

## Data Privacy

The system includes several privacy features:

1. **Do Not Track Support**: Respects browser DNT header
2. **IP Anonymization**: Can anonymize IP addresses
3. **Sampling**: Reduce data collection with sampling rates
4. **Data Retention**: Automatic cleanup of old data
5. **Opt-out**: Users can be excluded from tracking

```tsx
// Disable tracking for specific users
<ExperienceTrackingProvider disabled={user.hasOptedOut}>
  {children}
</ExperienceTrackingProvider>
```

## Analytics Queries

Use the provided Supabase functions for analytics:

```sql
-- Get user session analytics for the last 7 days
SELECT * FROM get_session_insights('7 days'::interval);

-- Get funnel analysis for signup journey
SELECT * FROM get_funnel_conversion_rate('signup');

-- Get performance insights
SELECT * FROM get_performance_insights('24 hours'::interval);
```

## Performance Considerations

1. **Batching**: Events are batched to reduce network requests
2. **Debouncing**: Scroll and resize events are debounced
3. **Sampling**: Use sampling for high-traffic sites
4. **Local Storage**: Session/anonymous IDs are persisted locally
5. **Beacon API**: Uses sendBeacon for guaranteed delivery on page unload

## Troubleshooting

### Events not appearing in database

1. Check that the migration ran successfully
2. Verify Supabase service role key is set
3. Check browser network tab for API errors
4. Enable debug mode to see console logs

### Performance issues

1. Reduce sample rates for high-traffic sites
2. Increase debounce timeouts
3. Reduce batch size if memory usage is high
4. Disable unnecessary tracking features

### TypeScript errors

1. Ensure all types are imported from the types file
2. Check that event properties match expected interfaces
3. Update TypeScript if using older version

## Migration Guide

If you're migrating from Google Analytics or other systems:

1. Map your existing events to the new system
2. Update event names to match your naming convention  
3. Test thoroughly in development before deploying
4. Consider running both systems in parallel during transition
5. Use the data export features to migrate historical data

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API route implementations
3. Check Supabase logs for database errors
4. Ensure all environment variables are set correctly