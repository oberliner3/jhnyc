/**
 * Analytics Event Types and Interfaces
 * Standardized event structures for cross-platform tracking
 */

// Base event interface
export interface BaseEvent {
  event_name: string;
  timestamp?: number;
  user_id?: string;
  session_id?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
}

// E-commerce item interface (Google Analytics Enhanced E-commerce format)
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  category?: string;
  category2?: string;
  category3?: string;
  category4?: string;
  category5?: string;
  brand?: string;
  variant?: string;
  price: number;
  quantity: number;
  currency?: string;
  discount?: number;
}

// Page view event
export interface PageViewEvent extends BaseEvent {
  event_name: 'page_view';
  page_title: string;
  page_location: string;
  content_group?: string;
}

// Product view event
export interface ViewItemEvent extends BaseEvent {
  event_name: 'view_item';
  currency: string;
  value: number;
  items: EcommerceItem[];
}

// Add to cart event
export interface AddToCartEvent extends BaseEvent {
  event_name: 'add_to_cart';
  currency: string;
  value: number;
  items: EcommerceItem[];
}

// Remove from cart event
export interface RemoveFromCartEvent extends BaseEvent {
  event_name: 'remove_from_cart';
  currency: string;
  value: number;
  items: EcommerceItem[];
}

// View cart event
export interface ViewCartEvent extends BaseEvent {
  event_name: 'view_cart';
  currency: string;
  value: number;
  items: EcommerceItem[];
}

// Begin checkout event
export interface BeginCheckoutEvent extends BaseEvent {
  event_name: 'begin_checkout';
  currency: string;
  value: number;
  items: EcommerceItem[];
  coupon?: string;
}

// Add payment info event
export interface AddPaymentInfoEvent extends BaseEvent {
  event_name: 'add_payment_info';
  currency: string;
  value: number;
  payment_type: string;
  items: EcommerceItem[];
}

// Purchase event
export interface PurchaseEvent extends BaseEvent {
  event_name: 'purchase';
  transaction_id: string;
  currency: string;
  value: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: EcommerceItem[];
  affiliation?: string;
}

// Search event
export interface SearchEvent extends BaseEvent {
  event_name: 'search';
  search_term: string;
  results_count?: number;
}

// Newsletter signup event
export interface NewsletterSignupEvent extends BaseEvent {
  event_name: 'newsletter_signup';
  method: string; // 'email', 'popup', 'footer', etc.
}

// Contact form submission
export interface ContactEvent extends BaseEvent {
  event_name: 'contact';
  method: string; // 'form', 'email', 'phone'
}

// Social share event
export interface ShareEvent extends BaseEvent {
  event_name: 'share';
  method: string; // 'facebook', 'twitter', 'instagram', etc.
  content_type: string;
  item_id?: string;
}

// Custom event for flexible tracking
export interface CustomEvent extends BaseEvent {
  event_name: string;
  custom_parameters?: Record<string, string | number | boolean>;
}

// Union type for all events
export type AnalyticsEvent = 
  | PageViewEvent
  | ViewItemEvent
  | AddToCartEvent
  | RemoveFromCartEvent
  | ViewCartEvent
  | BeginCheckoutEvent
  | AddPaymentInfoEvent
  | PurchaseEvent
  | SearchEvent
  | NewsletterSignupEvent
  | ContactEvent
  | ShareEvent
  | CustomEvent;

// User properties interface
export interface UserProperties {
  user_id?: string;
  customer_id?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  age?: number;
  birthday?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  subscription_status?: string;
  customer_lifetime_value?: number;
  first_purchase_date?: string;
  total_purchases?: number;
}

// Consent interface for GDPR/CCPA compliance
export interface ConsentSettings {
  analytics_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  personalization_storage: 'granted' | 'denied';
  security_storage: 'granted' | 'denied';
}

// Enhanced conversion data for Google Ads
export interface EnhancedConversionData {
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  street?: string;
  city?: string;
  region?: string;
  postal_code?: string;
  country?: string;
}

// Facebook Conversions API event data
export interface FacebookEventData {
  event_name: string;
  event_time: number;
  user_data?: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    fn?: string; // hashed first name
    ln?: string; // hashed last name
    ct?: string; // hashed city
    st?: string; // hashed state
    zp?: string; // hashed zip
    country?: string;
    external_id?: string;
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    contents?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    num_items?: number;
    order_id?: string;
    search_string?: string;
  };
  event_source_url?: string;
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

// Platform-specific event mappings
export interface PlatformEventMapping {
  googleAnalytics?: string;
  facebookPixel?: string;
  tiktokPixel?: string;
  pinterestPixel?: string;
  snapchatPixel?: string;
  microsoftAdvertising?: string;
  twitterPixel?: string;
}