import { publicEnv } from "@/lib/env-validation";

/**
 * Centralized configuration for experience tracking
 * Extracted for better DX and maintainability
 */
export const trackingConfig = {
  enablePageViews: true,
  enableClicks: true,
  enableScrollTracking: true,
  enableFormTracking: true,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  sampleRate: publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE || 1.0,
  debug:
    publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG ||
    process.env.NODE_ENV === "development",
  respectDNT: true,
  anonymizeIPs: true,
};

/**
 * Helper type for provider configuration
 */
export type ProviderConfig = [React.ComponentType<any>, Record<string, any>];