import { env } from "@/lib/env-validation";

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
sampleRate: env.NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE || 1.0,
    debug: env.NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG || false,
  respectDNT: true,
  anonymizeIPs: true,
};

/**
 * Helper type for provider configuration
 * Matches the ProviderWithProps type from compose-provider
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ProviderConfig<P = {}> = [
  React.ComponentType<P & { children: React.ReactNode }>,
  P
];