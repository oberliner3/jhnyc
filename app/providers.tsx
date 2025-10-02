"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ExperienceTrackingProvider } from "@/lib/experience-tracking/provider";
import { env } from "@/lib/env-validation";
import { ComposeProvider } from "@/lib/compose-provider";
import { trackingConfig, type ProviderConfig } from "@/lib/provider-config";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import ErrorBoundary from "@/components/common/error-boundary";
import DevToolsBlocker from "@/components/common/dev-tools-blocker";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  // An array of providers and their props.
  // This makes it easy to add or remove providers without changing the nesting structure.
  const providers: ProviderConfig[] = [
    [ErrorBoundary, {}],
    [DevToolsBlocker, {}],
    [(props: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient} {...props} />
    ), {}],
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