"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ExperienceTrackingProvider } from "@/lib/experience-tracking/provider";
import { publicEnv } from "@/lib/env-validation";
import { ComposeProvider } from "@/lib/compose-provider";
import { trackingConfig, type ProviderConfig } from "@/lib/provider-config";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  // An array of providers and their props.
  // This makes it easy to add or remove providers without changing the nesting structure.
  const providers: ProviderConfig[] = [
    [(props: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient} {...props} />
    ), {}],
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
