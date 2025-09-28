"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = React.useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<CartProvider>
					<PWAProvider>{children}</PWAProvider>
				</CartProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
