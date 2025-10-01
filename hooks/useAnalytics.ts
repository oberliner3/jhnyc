/**
 * React Hooks for Analytics Integration
 * Provides easy-to-use hooks for tracking events and user properties
 */

import { useEffect, useCallback, useRef } from 'react';
import { analytics } from '@/lib/analytics';
import type { 
  AnalyticsEvent, 
  UserProperties, 
  ConsentSettings, 
  EcommerceItem 
} from '@/lib/analytics/types';

// Hook for initializing analytics
export function useAnalyticsInit(consent?: ConsentSettings) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      analytics.init(consent).then(() => {
        initializedRef.current = true;
      });
    }
  }, [consent]);
}

// Main analytics tracking hook
export function useAnalytics() {
  const track = useCallback((event: AnalyticsEvent) => {
    analytics.track(event);
  }, []);

  const setUser = useCallback((properties: UserProperties) => {
    analytics.setUser(properties);
  }, []);

  const setConsent = useCallback((consent: ConsentSettings) => {
    analytics.setConsent(consent);
  }, []);

  const pageView = useCallback((url: string, title?: string) => {
    analytics.pageView(url, title);
  }, []);

  // E-commerce tracking methods
  const trackPurchase = useCallback((
    transactionId: string,
    value: number,
    items: EcommerceItem[],
    currency = 'USD',
    tax?: number,
    shipping?: number,
    coupon?: string
  ) => {
    analytics.trackPurchase(transactionId, value, items, currency, tax, shipping, coupon);
  }, []);

  const trackAddToCart = useCallback((items: EcommerceItem[], currency = 'USD') => {
    analytics.trackAddToCart(items, currency);
  }, []);

  const trackViewItem = useCallback((items: EcommerceItem[], currency = 'USD') => {
    analytics.trackViewItem(items, currency);
  }, []);

  const trackBeginCheckout = useCallback((items: EcommerceItem[], currency = 'USD', coupon?: string) => {
    analytics.trackBeginCheckout(items, currency, coupon);
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    analytics.trackSearch(searchTerm, resultsCount);
  }, []);

  // Custom event tracking
  const trackCustomEvent = useCallback((eventName: string, parameters?: Record<string, string | number | boolean>) => {
    analytics.track({
      event_name: eventName,
      custom_parameters: parameters,
    });
  }, []);

  // Newsletter signup tracking
  const trackNewsletterSignup = useCallback((method: string = 'unknown') => {
    analytics.track({
      event_name: 'newsletter_signup',
      method,
    });
  }, []);

  // Contact form tracking
  const trackContact = useCallback((method: string = 'form') => {
    analytics.track({
      event_name: 'contact',
      method,
    });
  }, []);

  // Social share tracking
  const trackShare = useCallback((method: string, contentType: string, itemId?: string) => {
    analytics.track({
      event_name: 'share',
      method,
      content_type: contentType,
      item_id: itemId,
    });
  }, []);

  return {
    track,
    setUser,
    setConsent,
    pageView,
    trackPurchase,
    trackAddToCart,
    trackViewItem,
    trackBeginCheckout,
    trackSearch,
    trackCustomEvent,
    trackNewsletterSignup,
    trackContact,
    trackShare,
  };
}

// Hook for automatic page view tracking
export function usePageViewTracking() {
  const { pageView } = useAnalytics();

  useEffect(() => {
    // Track initial page view
    pageView(window.location.href);

    // Track route changes for SPAs
    const handleRouteChange = () => {
      pageView(window.location.href);
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    // For Next.js router events, you might want to listen to router events instead
    // This is a basic implementation that works with browser navigation

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [pageView]);
}

// Hook for consent management
export function useConsentManagement() {
  const { setConsent } = useAnalytics();

  const grantAllConsent = useCallback(() => {
    setConsent({
      analytics_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    });
  }, [setConsent]);

  const denyAllConsent = useCallback(() => {
    setConsent({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted', // Usually always granted for basic functionality
      personalization_storage: 'denied',
      security_storage: 'granted', // Usually always granted for security
    });
  }, [setConsent]);

  const setAnalyticsOnly = useCallback(() => {
    setConsent({
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    });
  }, [setConsent]);

  const setCustomConsent = useCallback((consent: Partial<ConsentSettings>) => {
    const defaultConsent: ConsentSettings = {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      personalization_storage: 'denied',
      security_storage: 'granted',
    };

    setConsent({ ...defaultConsent, ...consent });
  }, [setConsent]);

  return {
    grantAllConsent,
    denyAllConsent,
    setAnalyticsOnly,
    setCustomConsent,
  };
}

// Hook for e-commerce tracking with Shopify integration
export function useEcommerceTracking() {
  const { trackAddToCart, trackViewItem, trackBeginCheckout, trackPurchase } = useAnalytics();

  // Convert Shopify product to EcommerceItem
  const convertShopifyProduct = useCallback((product: any, variant?: any, quantity = 1): EcommerceItem => {
    return {
      item_id: variant?.id || product.id,
      item_name: product.title,
      category: product.product_type,
      brand: product.vendor,
      variant: variant?.title,
      price: parseFloat(variant?.price || product.price),
      quantity,
      currency: 'USD', // You might want to make this dynamic
    };
  }, []);

  const trackShopifyProductView = useCallback((product: any, variant?: any) => {
    const item = convertShopifyProduct(product, variant, 1);
    trackViewItem([item]);
  }, [convertShopifyProduct, trackViewItem]);

  const trackShopifyAddToCart = useCallback((product: any, variant?: any, quantity = 1) => {
    const item = convertShopifyProduct(product, variant, quantity);
    trackAddToCart([item]);
  }, [convertShopifyProduct, trackAddToCart]);

  const trackShopifyCheckout = useCallback((items: Array<{ product: any; variant?: any; quantity: number }>, coupon?: string) => {
    const ecommerceItems = items.map(({ product, variant, quantity }) => 
      convertShopifyProduct(product, variant, quantity)
    );
    trackBeginCheckout(ecommerceItems, 'USD', coupon);
  }, [convertShopifyProduct, trackBeginCheckout]);

  const trackShopifyPurchase = useCallback((
    orderId: string,
    items: Array<{ product: any; variant?: any; quantity: number }>,
    total: number,
    tax?: number,
    shipping?: number,
    coupon?: string
  ) => {
    const ecommerceItems = items.map(({ product, variant, quantity }) => 
      convertShopifyProduct(product, variant, quantity)
    );
    trackPurchase(orderId, total, ecommerceItems, 'USD', tax, shipping, coupon);
  }, [convertShopifyProduct, trackPurchase]);

  return {
    trackShopifyProductView,
    trackShopifyAddToCart,
    trackShopifyCheckout,
    trackShopifyPurchase,
    convertShopifyProduct,
  };
}

// Hook for user authentication tracking
export function useUserTracking() {
  const { setUser, trackCustomEvent } = useAnalytics();

  const identifyUser = useCallback((userProperties: UserProperties) => {
    setUser(userProperties);
    trackCustomEvent('user_identify', { user_id: userProperties.user_id || 'unknown' });
  }, [setUser, trackCustomEvent]);

  const trackLogin = useCallback((method: string = 'email') => {
    trackCustomEvent('login', { method });
  }, [trackCustomEvent]);

  const trackSignup = useCallback((method: string = 'email') => {
    trackCustomEvent('sign_up', { method });
  }, [trackCustomEvent]);

  const trackLogout = useCallback(() => {
    trackCustomEvent('logout');
  }, [trackCustomEvent]);

  return {
    identifyUser,
    trackLogin,
    trackSignup,
    trackLogout,
  };
}

// Hook for performance tracking
export function usePerformanceTracking() {
  const { trackCustomEvent } = useAnalytics();

  useEffect(() => {
    // Track page load performance
    const trackPageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (perfData) {
          trackCustomEvent('page_load_performance', {
            page_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            dom_content_loaded_time: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
            first_contentful_paint: Math.round(perfData.domInteractive - perfData.fetchStart),
          });
        }
      }
    };

    // Track performance after page load
    if (document.readyState === 'complete') {
      setTimeout(trackPageLoad, 100);
    } else {
      window.addEventListener('load', () => {
        setTimeout(trackPageLoad, 100);
      });
    }
  }, [trackCustomEvent]);
}