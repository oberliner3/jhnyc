// biome-ignore assist/source/organizeImports: <explanation>
import { Inter } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SchemaMarkup } from "@/components/common/schema-markup";
import { Providers } from "./providers";
import { CookieBanner } from "@/components/common/cookie-banner";

import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#008060" },
		{ media: "(prefers-color-scheme: dark)", color: "#00a67c" },
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<SchemaMarkup />
			</head>
			<body className={inter.className}>
				<Providers>
					<div className="flex flex-col min-h-screen">
						<AnnouncementBar />
						<Header />
						<main className="flex-1">{children}</main>
						<Footer />
					</div>
					<CookieBanner />
				</Providers>
         <Analytics />
			</body>
		</html>
	);
}
