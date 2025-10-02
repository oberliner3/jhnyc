"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ExperienceTrackingProvider } from "@/lib/experience-tracking/provider";
import { publicEnv } from "@/lib/env-validation";
import { ComposeProvider } from "@/lib/compose-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  const trackingConfig = {
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

  // An array of providers and their props.
  // This makes it easy to add or remove providers without changing the nesting structure.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers: [React.ComponentType<any>, Record<string, any>][] = [
    [QueryClientProvider, { client: queryClient }],
    [
      ExperienceTrackingProvider,
      {
        config: trackingConfig,
        disabled: !publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED,
      },
    ],
    [AuthProvider, {}],
    [CartProvider, {}],
    [PWAProvider, {}],
  ];

  return <ComposeProvider providers={providers}>{children}</ComposeProvider>;
}
