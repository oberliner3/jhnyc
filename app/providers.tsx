"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { ExperienceTrackingProvider } from "@/lib/experience-tracking/provider";
import { getPublicEnv } from "@/lib/env-validation";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(() => new QueryClient());
	const publicEnv = getPublicEnv();

	// Experience tracking configuration
	const trackingConfig = {
		enablePageViews: true,
		enableClicks: true,
		enableScrollTracking: true,
		enableFormTracking: true,
		enablePerformanceTracking: true,
		enableErrorTracking: true,
		sampleRate: publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_SAMPLE_RATE || 1.0,
		debug: publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_DEBUG || process.env.NODE_ENV === 'development',
		// Privacy settings
		respectDNT: true,
		anonymizeIPs: true,
	};

	return (
		<QueryClientProvider client={queryClient}>
			<ExperienceTrackingProvider 
				config={trackingConfig}
				disabled={!publicEnv.NEXT_PUBLIC_EXPERIENCE_TRACKING_ENABLED}
			>
				<AuthProvider>
					<CartProvider>
						<PWAProvider>{children}</PWAProvider>
					</CartProvider>
				</AuthProvider>
			</ExperienceTrackingProvider>
		</QueryClientProvider>
	);
}
