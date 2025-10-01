/**
 * Analytics Tracking Manager
 * Main entry point for all analytics and marketing pixel tracking
 */

import { analyticsConfig, isAnalyticsEnabled } from './config';
import type { 
  AnalyticsEvent, 
  UserProperties, 
  ConsentSettings,
  EcommerceItem 
} from './types';

// Global declarations for third-party scripts
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (event: string, data?: unknown) => void;
      page: () => void;
      load: (pixelId: string) => void;
    };
    pintrk?: (...args: unknown[]) => void;
    snaptr?: (...args: unknown[]) => void;
    uetq?: unknown[];
    twq?: (...args: unknown[]) => void;
  }
}

class AnalyticsManager {
  private initialized = false;
  private consentGiven = false;
  private queuedEvents: AnalyticsEvent[] = [];

  /**
   * Initialize analytics services
   */
  public async init(consent?: ConsentSettings): Promise<void> {
    if (!isAnalyticsEnabled() || this.initialized) {
      return;
    }

    console.log('🔍 Initializing Analytics Manager...');

    // Set consent if provided
    if (consent) {
      this.setConsent(consent);
    }

    // Initialize each enabled service
    await Promise.all([
      this.initGoogleAnalytics(),
      this.initFacebookPixel(),
      this.initGoogleTagManager(),
      this.initTikTokPixel(),
      this.initPinterestPixel(),
      this.initSnapchatPixel(),
      this.initMicrosoftAdvertising(),
      this.initTwitterPixel(),
    ]);

    this.initialized = true;
    
    // Process any queued events
    this.processQueuedEvents();

    if (analyticsConfig.debugMode) {
      console.log('✅ Analytics initialized with services:', this.getEnabledServices());
    }
  }

  /**
   * Track an analytics event
   */
  public track(event: AnalyticsEvent): void {
    if (!isAnalyticsEnabled()) {
      return;
    }

    // Queue event if not initialized yet
    if (!this.initialized) {
      this.queuedEvents.push(event);
      return;
    }

    // Add common properties
    const enrichedEvent = this.enrichEvent(event);

    if (analyticsConfig.debugMode) {
      console.log('📊 Tracking event:', enrichedEvent);
    }

    // Track on each platform
    this.trackGoogleAnalytics(enrichedEvent);
    this.trackFacebookPixel(enrichedEvent);
    this.trackTikTokPixel(enrichedEvent);
    this.trackPinterestPixel(enrichedEvent);
    this.trackSnapchatPixel(enrichedEvent);
    this.trackMicrosoftAdvertising(enrichedEvent);
    this.trackTwitterPixel(enrichedEvent);
  }

  /**
   * Set user properties
   */
  public setUser(properties: UserProperties): void {
    if (!isAnalyticsEnabled() || !this.initialized) {
      return;
    }

    if (analyticsConfig.debugMode) {
      console.log('👤 Setting user properties:', properties);
    }

    // Set user properties on each platform
    this.setGoogleAnalyticsUser(properties);
    this.setFacebookPixelUser(properties);
  }

  /**
   * Set consent preferences
   */
  public setConsent(consent: ConsentSettings): void {
    this.consentGiven = consent.analytics_storage === 'granted';

    if (analyticsConfig.debugMode) {
      console.log('🔒 Setting consent:', consent);
    }

    // Update Google Analytics consent
    if (window.gtag) {
      window.gtag('consent', 'update', consent);
    }

    // Update Facebook Pixel consent
    if (window.fbq && consent.ad_storage === 'granted') {
      window.fbq('consent', 'grant');
    } else if (window.fbq) {
      window.fbq('consent', 'revoke');
    }
  }

  /**
   * Page view tracking
   */
  public pageView(url: string, title?: string): void {
    this.track({
      event_name: 'page_view',
      page_title: title || document.title,
      page_location: url,
    });
  }

  /**
   * E-commerce convenience methods
   */
  public trackPurchase(
    transactionId: string,
    value: number,
    items: EcommerceItem[],
    currency = 'USD',
    tax?: number,
    shipping?: number,
    coupon?: string
  ): void {
    this.track({
      event_name: 'purchase',
      transaction_id: transactionId,
      currency,
      value,
      items,
      tax,
      shipping,
      coupon,
    });
  }

  public trackAddToCart(items: EcommerceItem[], currency = 'USD'): void {
    const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.track({
      event_name: 'add_to_cart',
      currency,
      value,
      items,
    });
  }

  public trackViewItem(items: EcommerceItem[], currency = 'USD'): void {
    const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.track({
      event_name: 'view_item',
      currency,
      value,
      items,
    });
  }

  public trackBeginCheckout(items: EcommerceItem[], currency = 'USD', coupon?: string): void {
    const value = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.track({
      event_name: 'begin_checkout',
      currency,
      value,
      items,
      coupon,
    });
  }

  public trackSearch(searchTerm: string, resultsCount?: number): void {
    this.track({
      event_name: 'search',
      search_term: searchTerm,
      results_count: resultsCount,
    });
  }

  // Private methods for platform-specific implementations

  private async initGoogleAnalytics(): Promise<void> {
    if (!analyticsConfig.googleAnalytics?.enabled) return;

    const { measurementId } = analyticsConfig.googleAnalytics;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    if (analyticsConfig.debugMode) {
      window.gtag('config', measurementId, { debug_mode: true });
    }
  }

  private async initFacebookPixel(): Promise<void> {
    if (!analyticsConfig.facebookPixel?.enabled) return;

    const { pixelId } = analyticsConfig.facebookPixel;

    // Facebook Pixel code
    const script = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;

    // Execute Facebook Pixel script
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);

    window.fbq?.('init', pixelId);
    window.fbq?.('track', 'PageView');
  }

  private async initGoogleTagManager(): Promise<void> {
    if (!analyticsConfig.googleTagManager?.enabled) return;

    const { containerId } = analyticsConfig.googleTagManager;

    // GTM script
    const script = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
  }

  private async initTikTokPixel(): Promise<void> {
    if (!analyticsConfig.tiktokPixel?.enabled) return;

    const { pixelId } = analyticsConfig.tiktokPixel;

    const script = document.createElement('script');
    script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.ttq?.load(pixelId);
      window.ttq?.page();
    };
  }

  private async initPinterestPixel(): Promise<void> {
    if (!analyticsConfig.pinterestPixel?.enabled) return;

    const { tagId } = analyticsConfig.pinterestPixel;

    const script = `
      !function(e){if(!window.pintrk){window.pintrk = function () {
      window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
      n=window.pintrk;n.queue=[],n.version="3.0";var
      t=document.createElement("script");t.async=!0,t.src=e;var
      r=document.getElementsByTagName("script")[0];
      r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
      pintrk('load', '${tagId}');
      pintrk('page');
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
  }

  private async initSnapchatPixel(): Promise<void> {
    if (!analyticsConfig.snapchatPixel?.enabled) return;

    const { pixelId } = analyticsConfig.snapchatPixel;

    const script = `
      (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
      {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
      a.queue=[];var s='script';r=t.createElement(s);r.async=!0;
      r.src=n;var u=t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r,u);})(window,document,
      'https://sc-static.net/scevent.min.js');
      snaptr('init', '${pixelId}');
      snaptr('track', 'PAGE_VIEW');
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
  }

  private async initMicrosoftAdvertising(): Promise<void> {
    if (!analyticsConfig.microsoftAdvertising?.enabled) return;

    const { uetTagId } = analyticsConfig.microsoftAdvertising;

    const script = `
      (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${uetTagId}"};
      o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,
      n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||
      (f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],
      i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
  }

  private async initTwitterPixel(): Promise<void> {
    if (!analyticsConfig.twitterPixel?.enabled) return;

    const { pixelId } = analyticsConfig.twitterPixel;

    const script = `
      !function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
      },s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='//static.ads-twitter.com/uwt.js',
      a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
      twq('init','${pixelId}');
      twq('track','PageView');
    `;

    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.head.appendChild(scriptElement);
  }

  private enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      timestamp: event.timestamp || Date.now(),
      page_url: event.page_url || window.location.href,
      referrer: event.referrer || document.referrer,
      user_agent: event.user_agent || navigator.userAgent,
    };
  }

  private trackGoogleAnalytics(event: AnalyticsEvent): void {
    if (!analyticsConfig.googleAnalytics?.enabled || !window.gtag) return;

    // Map event to Google Analytics format
    const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;
    
    window.gtag('event', event_name, {
      ...params,
      user_id,
      custom_map: {
        dimension1: session_id,
      },
    });
  }

  private trackFacebookPixel(event: AnalyticsEvent): void {
    if (!analyticsConfig.facebookPixel?.enabled || !window.fbq) return;

    // Map common events to Facebook Pixel events
    const eventMap: Record<string, string> = {
      'page_view': 'PageView',
      'view_item': 'ViewContent',
      'add_to_cart': 'AddToCart',
      'begin_checkout': 'InitiateCheckout',
      'purchase': 'Purchase',
      'search': 'Search',
      'newsletter_signup': 'Lead',
      'contact': 'Contact',
    };

    const fbEvent = eventMap[event.event_name] || event.event_name;
    const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;

    window.fbq('track', fbEvent, params);
  }

  private trackTikTokPixel(event: AnalyticsEvent): void {
    if (!analyticsConfig.tiktokPixel?.enabled || !window.ttq) return;

    const eventMap: Record<string, string> = {
      'view_item': 'ViewContent',
      'add_to_cart': 'AddToCart',
      'begin_checkout': 'InitiateCheckout',
      'purchase': 'CompletePayment',
      'search': 'Search',
    };

    const ttEvent = eventMap[event.event_name];
    if (ttEvent) {
      const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;
      window.ttq.track(ttEvent, params);
    }
  }

  private trackPinterestPixel(event: AnalyticsEvent): void {
    if (!analyticsConfig.pinterestPixel?.enabled || !window.pintrk) return;

    const eventMap: Record<string, string> = {
      'view_item': 'pagevisit',
      'add_to_cart': 'addtocart',
      'begin_checkout': 'checkout',
      'purchase': 'checkout',
      'search': 'search',
      'newsletter_signup': 'signup',
    };

    const pinterestEvent = eventMap[event.event_name];
    if (pinterestEvent) {
      const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;
      window.pintrk('track', pinterestEvent, params);
    }
  }

  private trackSnapchatPixel(event: AnalyticsEvent): void {
    if (!analyticsConfig.snapchatPixel?.enabled || !window.snaptr) return;

    const eventMap: Record<string, string> = {
      'view_item': 'VIEW_CONTENT',
      'add_to_cart': 'ADD_CART',
      'begin_checkout': 'START_CHECKOUT',
      'purchase': 'PURCHASE',
      'search': 'SEARCH',
      'newsletter_signup': 'SIGN_UP',
    };

    const snapEvent = eventMap[event.event_name];
    if (snapEvent) {
      const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;
      window.snaptr('track', snapEvent, params);
    }
  }

  private trackMicrosoftAdvertising(event: AnalyticsEvent): void {
    if (!analyticsConfig.microsoftAdvertising?.enabled || !window.uetq) return;

    // Microsoft Advertising events are more limited
    if (event.event_name === 'purchase') {
      window.uetq.push('event', 'conversion', {
        revenue_value: (event as any).value,
        currency: (event as any).currency,
      });
    }
  }

  private trackTwitterPixel(event: AnalyticsEvent): void {
    if (!analyticsConfig.twitterPixel?.enabled || !window.twq) return;

    const eventMap: Record<string, string> = {
      'purchase': 'Purchase',
      'add_to_cart': 'AddToCart',
      'newsletter_signup': 'CompleteRegistration',
    };

    const twitterEvent = eventMap[event.event_name];
    if (twitterEvent) {
      const { event_name, timestamp, user_id, session_id, page_url, referrer, user_agent, ...params } = event;
      window.twq('track', twitterEvent, params);
    }
  }

  private setGoogleAnalyticsUser(properties: UserProperties): void {
    if (!analyticsConfig.googleAnalytics?.enabled || !window.gtag) return;

    window.gtag('config', analyticsConfig.googleAnalytics.measurementId, {
      user_id: properties.user_id,
      custom_map: {
        dimension2: properties.customer_id,
        dimension3: properties.subscription_status,
      },
    });
  }

  private setFacebookPixelUser(properties: UserProperties): void {
    if (!analyticsConfig.facebookPixel?.enabled || !window.fbq) return;

    // Set advanced matching for Facebook
    const userData: Record<string, string> = {};
    if (properties.email) userData.em = properties.email;
    if (properties.phone) userData.ph = properties.phone;
    if (properties.first_name) userData.fn = properties.first_name;
    if (properties.last_name) userData.ln = properties.last_name;
    if (properties.city) userData.ct = properties.city;
    if (properties.state) userData.st = properties.state;
    if (properties.zip) userData.zp = properties.zip;

    if (Object.keys(userData).length > 0) {
      window.fbq('init', analyticsConfig.facebookPixel.pixelId, userData);
    }
  }

  private processQueuedEvents(): void {
    while (this.queuedEvents.length > 0) {
      const event = this.queuedEvents.shift();
      if (event) {
        this.track(event);
      }
    }
  }

  private getEnabledServices(): string[] {
    const enabled: string[] = [];
    if (analyticsConfig.googleAnalytics?.enabled) enabled.push('Google Analytics');
    if (analyticsConfig.facebookPixel?.enabled) enabled.push('Facebook Pixel');
    if (analyticsConfig.googleTagManager?.enabled) enabled.push('Google Tag Manager');
    if (analyticsConfig.tiktokPixel?.enabled) enabled.push('TikTok Pixel');
    if (analyticsConfig.pinterestPixel?.enabled) enabled.push('Pinterest Pixel');
    if (analyticsConfig.snapchatPixel?.enabled) enabled.push('Snapchat Pixel');
    if (analyticsConfig.microsoftAdvertising?.enabled) enabled.push('Microsoft Advertising');
    if (analyticsConfig.twitterPixel?.enabled) enabled.push('Twitter Pixel');
    return enabled;
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();