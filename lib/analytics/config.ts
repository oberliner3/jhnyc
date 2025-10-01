/**
 * Analytics and Marketing Pixel Configuration
 * Centralized configuration for all tracking services
 */

export interface AnalyticsConfig {
  // Google Analytics 4
  googleAnalytics?: {
    measurementId: string;
    enabled: boolean;
  };
  
  // Facebook Pixel
  facebookPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  
  // Google Tag Manager
  googleTagManager?: {
    containerId: string;
    enabled: boolean;
  };
  
  // TikTok Pixel
  tiktokPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  
  // Pinterest Pixel
  pinterestPixel?: {
    tagId: string;
    enabled: boolean;
  };
  
  // Snapchat Pixel
  snapchatPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  
  // Microsoft Advertising (Bing)
  microsoftAdvertising?: {
    uetTagId: string;
    enabled: boolean;
  };
  
  // Twitter/X Pixel
  twitterPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  
  // General settings
  enableInDevelopment?: boolean;
  debugMode?: boolean;
  consentRequired?: boolean;
}

// Default configuration from environment variables
export const analyticsConfig: AnalyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
  
  facebookPixel: {
    pixelId: process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID,
  },
  
  googleTagManager: {
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_GTM_CONTAINER_ID,
  },
  
  tiktokPixel: {
    pixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  },
  
  pinterestPixel: {
    tagId: process.env.NEXT_PUBLIC_PINTEREST_TAG_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_PINTEREST_TAG_ID,
  },
  
  snapchatPixel: {
    pixelId: process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_SNAPCHAT_PIXEL_ID,
  },
  
  microsoftAdvertising: {
    uetTagId: process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_MICROSOFT_UET_TAG_ID,
  },
  
  twitterPixel: {
    pixelId: process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID || '',
    enabled: !!process.env.NEXT_PUBLIC_TWITTER_PIXEL_ID,
  },
  
  enableInDevelopment: process.env.NEXT_PUBLIC_ANALYTICS_DEV === 'true',
  debugMode: process.env.NODE_ENV === 'development',
  consentRequired: process.env.NEXT_PUBLIC_CONSENT_REQUIRED === 'true',
};

// Check if analytics should be enabled
export const isAnalyticsEnabled = (): boolean => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const enableInDev = analyticsConfig.enableInDevelopment;
  
  return !isDevelopment || enableInDev === true;
};

// Utility to get enabled services
export const getEnabledServices = (): string[] => {
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
};