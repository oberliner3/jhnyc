/**
 * Experience Tracking Types and Interfaces
 * Comprehensive types for user behavior and interaction tracking
 */

// Base tracking event interface
export interface BaseTrackingEvent {
  sessionId: string;
  userId?: string;
  anonymousId?: string;
  timestamp?: number;
}

// Event types supported by the system
export type EventType = 
  | 'page_view'
  | 'click'
  | 'scroll'
  | 'form_interaction'
  | 'product_view'
  | 'add_to_cart'
  | 'search'
  | 'filter'
  | 'sort'
  | 'hover'
  | 'video_interaction'
  | 'image_interaction'
  | 'checkout_step'
  | 'error'
  | 'performance'
  | 'engagement'
  | 'product'
  | 'ecommerce'
  | 'api';

// Element position information
export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportX: number;
  viewportY: number;
  scrollTop: number;
  scrollLeft: number;
}

// Device and browser information
export interface DeviceInfo {
  userAgent: string;
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
}

// Performance metrics
export interface PerformanceMetrics {
  pageLoadTime?: number;
  timeOnPage?: number;
  scrollDepth?: number;
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

// Marketing attribution data
export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrerUrl?: string;
}

// Geographic information
export interface GeoData {
  ipAddress?: string;
  countryCode?: string;
  city?: string;
  timezone?: string;
}

// Main experience tracking event
export interface ExperienceTrackingEvent extends BaseTrackingEvent {
  eventType: EventType;
  eventName: string;
  
  // Page context
  pageUrl: string;
  pageTitle?: string;
  previousUrl?: string;
  referrer?: string;
  
  // Element context (for clicks, hovers, etc.)
  elementSelector?: string;
  elementText?: string;
  elementPosition?: ElementPosition;
  clickCoordinates?: { x: number; y: number };
  buttonType?: 'left' | 'right' | 'middle';
  scrollDepth?: number;
  scrollTop?: number;
  scrollLeft?: number;
    maxScrollDepth?: number;
    formName?: string;
    formSelector?: string;
  fieldName?: string;
  fieldType?: string;
  action?: 'focus' | 'blur' | 'change' | 'submit' | 'error';
  errorType?: 'javascript' | 'network' | 'validation' | '404' | '500' | 'other' | 'api';
  errorMessage?: string;
  errorUrl?: string;
  errorLine?: number;
  errorColumn?: number;
  errorStack?: string;
  productId?: string;
  contentId?: string;
  contentType?: string;
  searchQuery?: string;
  orderId?: string;
  properties?: Record<string, unknown>;
  
    // Event-specific data  interactionData?: Record<string, unknown>;
  customProperties?: Record<string, unknown>;
  
  // Device and performance info
  deviceInfo?: DeviceInfo;
  performanceMetrics?: PerformanceMetrics;
  
  // Attribution and geo
  attribution?: AttributionData;
  geoData?: GeoData;
  
  // Client timestamp
  clientTimestamp?: Date;
  serverTimestamp?: Date;
  ipAddress?: string;
}

// Page view specific event
export interface PageViewEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'page_view';
  previousUrl?: string;
  loadTime?: number;
  referrer?: string;
}

// Click event specific
export interface ClickEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'click';
  elementSelector: string;
  elementText?: string;
  elementPosition: ElementPosition;
  clickCoordinates?: { x: number; y: number };
  buttonType?: 'left' | 'right' | 'middle';
}

// Scroll event specific
export interface ScrollEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'scroll';
  scrollDepth: number; // percentage
  scrollTop: number;
  scrollLeft: number;
  maxScrollDepth?: number;
}

// Form interaction event
export interface FormInteractionEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'form_interaction';
  formSelector: string;
  formName?: string;
  fieldName: string;
  fieldType: string;
  action: 'focus' | 'blur' | 'change' | 'submit' | 'error';
  value?: string;
  validationErrors?: string[];
}

// Product view event
export interface ProductViewEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'product_view';
  productId: string;
  productName: string;
  productCategory?: string;
  productPrice?: number;
  productBrand?: string;
  variantId?: string;
  viewDuration?: number;
}

// Add to cart event
export interface AddToCartEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'add_to_cart';
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variantId?: string;
  cartValue?: number;
}

// Search event
export interface SearchEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'search';
  searchQuery: string;
  searchType?: 'site_search' | 'product_search';
  resultsCount?: number;
  filters?: Record<string, unknown>;
  sortBy?: string;
}

// Error event
export interface ErrorEvent extends Omit<ExperienceTrackingEvent, 'eventType'> {
  eventType: 'error';
  errorType: 'javascript' | 'network' | 'validation' | '404' | '500' | 'other' | 'api';
  errorMessage: string;
  errorStack?: string;
  errorUrl?: string;
  errorLine?: number;
  errorColumn?: number;
}

// User session data
export interface UserSession {
  id?: string;
  sessionId: string;
  userId?: string;
  anonymousId?: string;
  
  // Session timing
  startedAt: Date;
  endedAt?: Date;
  lastActivityAt?: Date;
  duration?: number; // in seconds
  
  // Page and interaction stats
  pageViews: number;
  interactions: number;
  
  // Entry and exit
  entryUrl: string;
  entryPageTitle?: string;
  exitUrl?: string;
  exitPageTitle?: string;
  
  // Device and attribution
  deviceInfo?: DeviceInfo;
  attribution?: AttributionData;
    geoData?: GeoData;
  ipAddress?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  
    bounce: boolean;
  converted: boolean;
  conversionValue?: number;
}

// User journey tracking
export type JourneyType = 
  | 'product_discovery'
  | 'purchase_funnel'
  | 'onboarding'
  | 'support'
  | 'content_engagement'
  | 'custom';

export interface UserJourney {
  id?: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  
  // Journey details
  journeyType: JourneyType;
  journeyStep: string;
  stepOrder: number;
  
  // Step information
  pageUrl?: string;
  actionTaken?: string;
  timeSpent?: number; // seconds on this step
  
  // Success metrics
  completed: boolean;
  droppedOff: boolean;
  conversionValue?: number;
  
  // Additional context
  properties?: Record<string, unknown>;
  
  createdAt: Date;
}

// Performance metrics (Core Web Vitals)
export interface WebVitalsMetrics {
  id?: string;
  sessionId: string;
  pageUrl: string;
  
  // Core Web Vitals
  lcp?: number;  // Largest Contentful Paint (ms)
  fid?: number;  // First Input Delay (ms)
  cls?: number;  // Cumulative Layout Shift
  fcp?: number;  // First Contentful Paint (ms)
  ttfb?: number; // Time to First Byte (ms)
  
  // Navigation timing
  dnsLookupTime?: number;
  tcpConnectTime?: number;
  tlsSetupTime?: number;
  requestTime?: number;
  responseTime?: number;
  domProcessingTime?: number;
  loadEventTime?: number;
  
  // Custom metrics
  customMetrics?: Record<string, number>;
  
  createdAt: Date;
}

// Tracking configuration
export interface TrackingConfig {
  enablePageViews: boolean;
  enableClicks: boolean;
  enableScrollTracking: boolean;
  enableFormTracking: boolean;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  
  // Sampling rates (0-1)
  sampleRate: number;
  performanceSampleRate: number;
  
  // Thresholds
  scrollDepthThresholds: number[]; // e.g., [25, 50, 75, 90]
  timeOnPageThreshold: number; // minimum seconds before tracking
  
  // Debouncing
  scrollDebounceMs: number;
  resizeDebounceMs: number;
  
  // Privacy
  respectDNT: boolean; // Respect Do Not Track header
  anonymizeIPs: boolean;
  
  // Custom filters
  ignoreSelectors: string[]; // CSS selectors to ignore
  includeSelectors?: string[]; // Only track these selectors
  
  // API configuration
  batchSize: number;
  flushInterval: number; // ms
  maxRetries: number;
  
  // Debug mode
  debug: boolean;
}

// Batch tracking payload
export interface TrackingBatch {
  events: ExperienceTrackingEvent[];
  sessionInfo: Partial<UserSession>;
  timestamp: number;
  batchId: string;
}

// API response types
export interface TrackingResponse {
  success: boolean;
  batchId: string;
  processedEvents: number;
  errors?: Array<{
    eventIndex: number;
    error: string;
  }>;
}

// Analytics insights
export interface BehaviorInsight {
  metricName: string;
  metricValue: number;
  metricUnit: string;
  comparisonPeriodValue: number;
  changePercentage: number;
}

export interface FunnelStep {
  step: string;
  stepOrder: number;
  users: number;
  conversionRate: number;
}

// Export union types
export type TrackingEvent = 
  | PageViewEvent
  | ClickEvent
  | ScrollEvent
  | FormInteractionEvent
  | ProductViewEvent
  | AddToCartEvent
  | SearchEvent
  | ErrorEvent
  | ExperienceTrackingEvent;