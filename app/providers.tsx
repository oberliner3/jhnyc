"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import React from "react";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import DevToolsBlocker from "@/components/common/dev-tools-blocker";
import ErrorBoundary from "@/components/common/error-boundary";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ComposeProvider } from "@/lib/compose-provider";
import { env } from "@/lib/env-validation";
import { ExperienceTrackingProvider } from "@/lib/experience-tracking/provider";
import { type ProviderConfig, trackingConfig } from "@/lib/provider-config";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  // An array of providers and their props.
  // This makes it easy to add or remove providers without changing the nesting structure.
  const providers: ProviderConfig[] = [
    [ErrorBoundary, {}],
    [DevToolsBlocker, {}],
    [
      (props: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient} {...props} />
      ),
      {},
    ],
    [
      ExperienceTrackingProvider,
      {
        config: trackingConfig,
        disabled: !env.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED,
      },
    ],
    [AuthProvider, {}],
    [CartProvider, {}],
    [PWAProvider, {}],
    [AnalyticsProvider, {}],
  ];

  return (
    <ComposeProvider providers={providers}>
      {children}
      <ConsentBanner />
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </ComposeProvider>
  );
}
