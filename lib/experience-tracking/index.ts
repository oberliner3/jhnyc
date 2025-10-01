/**
 * Experience Tracking Library
 * Comprehensive client-side user behavior and interaction tracking
 */

import { generateShortId } from '@/lib/utils/uuid';
import type {
  ExperienceTrackingEvent,
  TrackingConfig,
  TrackingBatch,
  TrackingResponse,
  DeviceInfo,
  AttributionData,
  ElementPosition,
  PageViewEvent,
  ClickEvent,
  ScrollEvent,
  FormInteractionEvent,
  ErrorEvent,
  JourneyType,
  UserJourney,
} from './types';

// Default configuration
const DEFAULT_CONFIG: TrackingConfig = {
  enablePageViews: true,
  enableClicks: true,
  enableScrollTracking: true,
  enableFormTracking: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  
  sampleRate: 1.0,
  performanceSampleRate: 0.1, // Sample 10% for performance tracking
  
  scrollDepthThresholds: [25, 50, 75, 90],
  timeOnPageThreshold: 5, // 5 seconds
  
  scrollDebounceMs: 100,
  resizeDebounceMs: 250,
  
  respectDNT: true,
  anonymizeIPs: true,
  
  ignoreSelectors: [
    '[data-tracking-ignore]',
    '.tracking-ignore',
    'script',
    'style',
    'noscript',
  ],
  
  batchSize: 50,
  flushInterval: 10000, // 10 seconds
  maxRetries: 3,
  
  debug: process.env.NODE_ENV === 'development',
};

class ExperienceTracker {
  private config: TrackingConfig;
  private sessionId: string;
  private userId?: string;
  private anonymousId: string;
  private eventQueue: ExperienceTrackingEvent[] = [];
  private isInitialized = false;
  private pageStartTime = Date.now();
  private maxScrollDepth = 0;
  private currentUrl = '';
  private currentTitle = '';
  private flushTimer?: NodeJS.Timeout;

  // Tracking state
  private lastScrollDepth = 0;
  private scrollDepthsSent = new Set<number>();
  private performanceObserver?: PerformanceObserver;
  
  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.getOrCreateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
    
    if (this.shouldTrack()) {
      this.init();
    }
  }

  /**
   * Initialize the tracker
   */
  private async init(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    this.currentUrl = window.location.href;
    this.currentTitle = document.title;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up performance tracking
    if (this.config.enablePerformanceTracking) {
      this.setupPerformanceTracking();
    }

    // Set up error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorTracking();
    }

    // Set up periodic flushing
    this.setupPeriodicFlush();

    // Track initial page view
    if (this.config.enablePageViews) {
      this.trackPageView();
    }

    this.isInitialized = true;

    if (this.config.debug) {
      console.log('🎯 Experience Tracker initialized', {
        sessionId: this.sessionId,
        anonymousId: this.anonymousId,
        config: this.config,
      });
    }
  }

  /**
   * Set user ID (when user logs in)
   */
  public setUserId(userId: string): void {
    this.userId = userId;
    if (this.config.debug) {
      console.log('👤 User ID set:', userId);
    }
  }

  /**
   * Track a custom event
   */
  public track(event: Partial<ExperienceTrackingEvent>): void {
    if (!this.shouldTrack() || !event.eventType || !event.eventName) {
      return;
    }

    const fullEvent = this.enrichEvent(event as ExperienceTrackingEvent);
    this.queueEvent(fullEvent);

    if (this.config.debug) {
      console.log('📊 Tracked event:', fullEvent);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(url?: string, title?: string): void {
    if (!this.config.enablePageViews) return;

    const pageUrl = url || window.location.href;
    const pageTitle = title || document.title;
    
    const event: PageViewEvent = {
      eventType: 'page_view',
      eventName: 'page_view',
      sessionId: this.sessionId,
      userId: this.userId,
      anonymousId: this.anonymousId,
      pageUrl,
      pageTitle,
      previousUrl: this.currentUrl !== pageUrl ? this.currentUrl : undefined,
      referrer: document.referrer || undefined,
    };

    this.currentUrl = pageUrl;
    this.currentTitle = pageTitle;
    this.pageStartTime = Date.now();
    this.maxScrollDepth = 0;
    this.scrollDepthsSent.clear();

    this.track(event);
  }

  /**
   * Track user journey step
   */
  public trackJourneyStep(
    journeyType: JourneyType,
    step: string,
    stepOrder: number,
    properties?: Record<string, unknown>
  ): void {
    const journey: UserJourney = {
      userId: this.userId,
      anonymousId: this.anonymousId,
      sessionId: this.sessionId,
      journeyType,
      journeyStep: step,
      stepOrder,
      pageUrl: window.location.href,
      completed: false,
      droppedOff: false,
      properties,
      createdAt: new Date(),
    };

    // Send journey data via API
    this.sendJourneyData(journey);
  }

  /**
   * Mark journey step as completed
   */
  public completeJourneyStep(
    journeyType: JourneyType,
    step: string,
    conversionValue?: number
  ): void {
    // This would update the journey in the database
    this.sendJourneyCompletion(journeyType, step, conversionValue);
  }

  /**
   * Force flush all queued events
   */
  public flush(): Promise<void> {
    return this.flushEvents();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Remove event listeners
    this.removeEventListeners();

    // Flush remaining events
    this.flushEvents();

    this.isInitialized = false;
  }

  /**
   * Check if tracking should be enabled
   */
  private shouldTrack(): boolean {
    if (typeof window === 'undefined') return false;

    // Respect Do Not Track
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      return false;
    }

    // Sample rate check
    if (Math.random() > this.config.sampleRate) {
      return false;
    }

    return true;
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (this.config.enableClicks) {
      document.addEventListener('click', this.handleClick.bind(this));
    }

    if (this.config.enableScrollTracking) {
      window.addEventListener('scroll', this.debounce(
        this.handleScroll.bind(this),
        this.config.scrollDebounceMs
      ));
    }

    if (this.config.enableFormTracking) {
      document.addEventListener('focusin', this.handleFormInteraction.bind(this));
      document.addEventListener('change', this.handleFormInteraction.bind(this));
      document.addEventListener('submit', this.handleFormInteraction.bind(this));
    }

    // Page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Before unload (track exit)
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners(): void {
    document.removeEventListener('click', this.handleClick.bind(this));
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    document.removeEventListener('focusin', this.handleFormInteraction.bind(this));
    document.removeEventListener('change', this.handleFormInteraction.bind(this));
    document.removeEventListener('submit', this.handleFormInteraction.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * Handle click events
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as Element;
    
    if (!target || this.shouldIgnoreElement(target)) {
      return;
    }

    const selector = this.getElementSelector(target);
    const text = this.getElementText(target);
    const position = this.getElementPosition(target);

    const clickEvent: ClickEvent = {
      eventType: 'click',
      eventName: 'element_click',
      sessionId: this.sessionId,
      userId: this.userId,
      anonymousId: this.anonymousId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      elementSelector: selector,
      elementText: text,
      elementPosition: position,
      clickCoordinates: { x: event.clientX, y: event.clientY },
      buttonType: event.button === 0 ? 'left' : event.button === 1 ? 'middle' : 'right',
    };

    this.track(clickEvent);
  }

  /**
   * Handle scroll events
   */
  private handleScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((scrollTop / scrollHeight) * 100);

    this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollDepth);

    // Check if we've crossed any thresholds
    for (const threshold of this.config.scrollDepthThresholds) {
      if (scrollDepth >= threshold && !this.scrollDepthsSent.has(threshold)) {
        this.scrollDepthsSent.add(threshold);

        const scrollEvent: ScrollEvent = {
          eventType: 'scroll',
          eventName: `scroll_${threshold}`,
          sessionId: this.sessionId,
          userId: this.userId,
          anonymousId: this.anonymousId,
          pageUrl: window.location.href,
          pageTitle: document.title,
          scrollDepth: threshold,
          scrollTop,
          scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
          maxScrollDepth: this.maxScrollDepth,
        };

        this.track(scrollEvent);
      }
    }

    this.lastScrollDepth = scrollDepth;
  }

  /**
   * Handle form interactions
   */
  private handleFormInteraction(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (!target || this.shouldIgnoreElement(target)) {
      return;
    }

    const form = target.closest('form');
    if (!form) return;

    const formSelector = this.getElementSelector(form);
    const fieldName = (target as HTMLInputElement).name || target.id || 'unnamed';
    const fieldType = (target as HTMLInputElement).type || target.tagName.toLowerCase();
    
    let action: FormInteractionEvent['action'] = 'change';
    if (event.type === 'focusin') action = 'focus';
    if (event.type === 'submit') action = 'submit';

    const formEvent: FormInteractionEvent = {
      eventType: 'form_interaction',
      eventName: `form_${action}`,
      sessionId: this.sessionId,
      userId: this.userId,
      anonymousId: this.anonymousId,
      pageUrl: window.location.href,
      pageTitle: document.title,
      formSelector,
      formName: form.name || form.id || 'unnamed',
      fieldName,
      fieldType,
      action,
    };

    this.track(formEvent);
  }

  /**
   * Handle visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      // Track time on page before leaving
      const timeOnPage = Math.round((Date.now() - this.pageStartTime) / 1000);
      
      this.track({
        eventType: 'page_view',
        eventName: 'page_exit',
        sessionId: this.sessionId,
        userId: this.userId,
        anonymousId: this.anonymousId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        performanceMetrics: {
          timeOnPage,
          scrollDepth: this.maxScrollDepth,
        },
      });

      // Flush events immediately
      this.flushEvents();
    }
  }

  /**
   * Handle before unload
   */
  private handleBeforeUnload(): void {
    // Send beacon if available for guaranteed delivery
    this.flushEvents(true);
  }

  /**
   * Set up performance tracking
   */
  private setupPerformanceTracking(): void {
    // Core Web Vitals tracking
    if ('PerformanceObserver' in window) {
      try {
        // LCP (Largest Contentful Paint)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          
          this.track({
            eventType: 'performance',
            eventName: 'lcp',
            sessionId: this.sessionId,
            pageUrl: window.location.href,
            performanceMetrics: {
              lcp: lastEntry.startTime,
            },
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // FID (First Input Delay)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { processingStart?: number }) => {
            if (entry.processingStart) {
              this.track({
                eventType: 'performance',
                eventName: 'fid',
                sessionId: this.sessionId,
                pageUrl: window.location.href,
                performanceMetrics: {
                  fid: entry.processingStart - entry.startTime,
                },
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // CLS (Cumulative Layout Shift)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
            if (!entry.hadRecentInput && entry.value) {
              clsValue += entry.value;
            }
          });

          this.track({
            eventType: 'performance',
            eventName: 'cls',
            sessionId: this.sessionId,
            pageUrl: window.location.href,
            performanceMetrics: {
              cls: clsValue,
            },
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

      } catch (error) {
        if (this.config.debug) {
          console.warn('Failed to set up performance tracking:', error);
        }
      }
    }
  }

  /**
   * Set up error tracking
   */
  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      const errorEvent: ErrorEvent = {
        eventType: 'error',
        eventName: 'javascript_error',
        sessionId: this.sessionId,
        userId: this.userId,
        anonymousId: this.anonymousId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        errorType: 'javascript',
        errorMessage: event.message,
        errorUrl: event.filename,
        errorLine: event.lineno,
        errorColumn: event.colno,
        errorStack: event.error?.stack,
      };

      this.track(errorEvent);
    });

    window.addEventListener('unhandledrejection', (event) => {
      const errorEvent: ErrorEvent = {
        eventType: 'error',
        eventName: 'unhandled_promise_rejection',
        sessionId: this.sessionId,
        userId: this.userId,
        anonymousId: this.anonymousId,
        pageUrl: window.location.href,
        pageTitle: document.title,
        errorType: 'javascript',
        errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
        errorStack: event.reason?.stack,
      };

      this.track(errorEvent);
    });
  }

  /**
   * Set up periodic event flushing
   */
  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  /**
   * Enrich event with common data
   */
  private enrichEvent(event: ExperienceTrackingEvent): ExperienceTrackingEvent {
    return {
      ...event,
      sessionId: this.sessionId,
      userId: this.userId,
      anonymousId: this.anonymousId,
      pageUrl: event.pageUrl || window.location.href,
      pageTitle: event.pageTitle || document.title,
      clientTimestamp: new Date(),
      deviceInfo: this.getDeviceInfo(),
      attribution: this.getAttributionData(),
      timestamp: Date.now(),
    };
  }

  /**
   * Queue event for batch sending
   */
  private queueEvent(event: ExperienceTrackingEvent): void {
    this.eventQueue.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Flush queued events to server
   */
  private async flushEvents(useBeacon = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    const batch: TrackingBatch = {
      events,
      sessionInfo: {
        sessionId: this.sessionId,
        userId: this.userId,
        anonymousId: this.anonymousId,
      },
      timestamp: Date.now(),
      batchId: generateShortId(),
    };

    try {
      if (useBeacon && 'navigator' in window && 'sendBeacon' in navigator) {
        // Use sendBeacon for guaranteed delivery during page unload
        navigator.sendBeacon('/api/experience-tracking', JSON.stringify(batch));
      } else {
        // Regular fetch request
        const response = await fetch('/api/experience-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result: TrackingResponse = await response.json();
        
        if (this.config.debug) {
          console.log('📤 Events sent successfully:', result);
        }
      }
    } catch (error) {
      // Re-queue events for retry (up to max retries)
      if (this.config.debug) {
        console.error('Failed to send tracking events:', error);
      }
      
      // TODO: Implement retry logic with exponential backoff
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Send journey data
   */
  private async sendJourneyData(journey: UserJourney): Promise<void> {
    try {
      await fetch('/api/experience-tracking/journey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(journey),
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to send journey data:', error);
      }
    }
  }

  /**
   * Send journey completion
   */
  private async sendJourneyCompletion(
    journeyType: JourneyType,
    step: string,
    conversionValue?: number
  ): Promise<void> {
    try {
      await fetch('/api/experience-tracking/journey/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          journeyType,
          step,
          conversionValue,
        }),
      });
    } catch (error) {
      if (this.config.debug) {
        console.error('Failed to send journey completion:', error);
      }
    }
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screen = window.screen;
    
    let deviceType: DeviceInfo['deviceType'] = 'unknown';
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    } else {
      deviceType = 'desktop';
    }

    // Simple browser detection
    let browserName = 'unknown';
    if (userAgent.includes('Chrome')) browserName = 'Chrome';
    else if (userAgent.includes('Firefox')) browserName = 'Firefox';
    else if (userAgent.includes('Safari')) browserName = 'Safari';
    else if (userAgent.includes('Edge')) browserName = 'Edge';

    // Simple OS detection
    let osName = 'unknown';
    if (userAgent.includes('Windows')) osName = 'Windows';
    else if (userAgent.includes('Mac')) osName = 'macOS';
    else if (userAgent.includes('Linux')) osName = 'Linux';
    else if (userAgent.includes('Android')) osName = 'Android';
    else if (userAgent.includes('iOS')) osName = 'iOS';

    return {
      userAgent,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      screenWidth: screen.width,
      screenHeight: screen.height,
      deviceType,
      browserName,
      browserVersion: 'unknown', // Would need more complex parsing
      osName,
      osVersion: 'unknown', // Would need more complex parsing
    };
  }

  /**
   * Get attribution data from URL parameters
   */
  private getAttributionData(): AttributionData {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
      utmTerm: urlParams.get('utm_term') || undefined,
      utmContent: urlParams.get('utm_content') || undefined,
      referrerUrl: document.referrer || undefined,
    };
  }

  /**
   * Check if element should be ignored
   */
  private shouldIgnoreElement(element: Element): boolean {
    return this.config.ignoreSelectors.some(selector => 
      element.matches(selector)
    );
  }

  /**
   * Get CSS selector for element
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c);
      if (classes.length > 0) {
        return `.${classes.join('.')}`;
      }
    }

    // Fallback to tag name with nth-child
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Get text content from element
   */
  private getElementText(element: Element): string {
    const text = element.textContent?.trim() || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  /**
   * Get element position information
   */
  private getElementPosition(element: Element): ElementPosition {
    const rect = element.getBoundingClientRect();
    
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      viewportX: rect.left + window.pageXOffset,
      viewportY: rect.top + window.pageYOffset,
      scrollTop: window.pageYOffset,
      scrollLeft: window.pageXOffset,
    };
  }

  /**
   * Get or create session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return generateShortId();

    let sessionId = sessionStorage.getItem('experience_session_id');
    if (!sessionId) {
      sessionId = `exp_${generateShortId()}`;
      sessionStorage.setItem('experience_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get or create anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    if (typeof window === 'undefined') return generateShortId();

    let anonymousId = localStorage.getItem('experience_anonymous_id');
    if (!anonymousId) {
      anonymousId = `exp_anon_${generateShortId()}`;
      localStorage.setItem('experience_anonymous_id', anonymousId);
    }
    return anonymousId;
  }

  /**
   * Debounce utility
   */
  private debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// Export singleton instance
export const experienceTracker = new ExperienceTracker();

// Export class for custom instances
export { ExperienceTracker };

// Re-export everything from other modules
export * from './types';
export * from './hooks';
export * from './provider';
