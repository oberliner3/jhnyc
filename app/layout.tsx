import "@/app/globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";
import DevToolsBlocker from "@/components/common/dev-tools-blocker";
import ErrorBoundary from "@/components/common/error-boundary";
import { WebsiteSchema } from "@/components/common/website-schema";
import { Toaster } from "@/components/ui/sonner";
import { publicEnv } from "@/lib/constants";
import { Providers } from "./providers";

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "hsl(var(--primary))" },
		{ media: "(prefers-color-scheme: dark)", color: "hsl(var(--primary))" },
	],
	viewportFit: "cover",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html
			lang="en"
			className={`${GeistSans.variable} ${GeistMono.variable}`}
			suppressHydrationWarning
		>
			<head>
				<meta
					name="apple-mobile-web-app-title"
					content={publicEnv.NEXT_PUBLIC_STORE_NAME}
				/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta
					name="application-name"
					content={publicEnv.NEXT_PUBLIC_STORE_NAME}
				/>
				<meta name="msapplication-TileColor" content="hsl(var(--primary))" />

				<WebsiteSchema />
			</head>
			<body className="will-change-scroll">
				<ErrorBoundary>
					<DevToolsBlocker />
					<Providers>
						<div className="flex flex-col bg-background min-h-screen">
							{children}
						</div>
						<Toaster />
					</Providers>
				</ErrorBoundary>
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	);
}
