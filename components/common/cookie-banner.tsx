"use client";

import { SITE_CONFIG } from "@/lib/constants";
import CookieConsent, { Cookies } from "react-cookie-consent";

declare global {
	interface Window {
		gtag: (
			command: "consent",
			action: "update",
			params: {
				ad_storage: "granted" | "denied";
				analytics_storage: "granted" | "denied";
			},
		) => void;
	}
}

// Build a structured consent payload and persist as a cookie
const buildConsent = (accepted: boolean) => ({
	necessary: true,
	performance: accepted,
	analytics: accepted,
	marketing: accepted,
	version: 1,
	ts: new Date().toISOString(),
});

export function CookieBanner() {
	return (
		<CookieConsent
			location="bottom"
			visible="byCookieValue"
			enableDeclineButton
			buttonText=""
			declineButtonText=""
			cookieName={SITE_CONFIG.cookieConfig.name}
			expires={SITE_CONFIG.cookieConfig.expires}
			containerClasses="w-full border-t bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 z-50"
			contentClasses="container px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
			buttonWrapperClasses="flex items-center gap-3 w-full md:w-auto"
			buttonClasses="hidden"
			declineButtonClasses="hidden"
			style={{
				boxShadow: "0 -1px 0 hsl(var(--border))",
				animation: "var(--animate-fade-in)",
			}}
			onAccept={() => {
				const consent = buildConsent(true);
				Cookies.set(SITE_CONFIG.cookieConfig.name, JSON.stringify(consent), {
					expires: SITE_CONFIG.cookieConfig.expires,
					sameSite: "Lax",
					secure: process.env.NODE_ENV === "production",
				});

				if (window?.gtag) {
					window.gtag("consent", "update", {
						ad_storage: "granted",
						analytics_storage: "granted",
					});
				}

				const banner = document.querySelector(".cookie-consent");
				if (banner) banner.remove();
			}}
			onDecline={() => {
				const consent = buildConsent(false);
				Cookies.set(SITE_CONFIG.cookieConfig.name, JSON.stringify(consent), {
					expires: SITE_CONFIG.cookieConfig.expires,
					sameSite: "Lax",
					secure: process.env.NODE_ENV === "production",
				});

				if (window?.gtag) {
					window.gtag("consent", "update", {
						ad_storage: "denied",
						analytics_storage: "denied",
					});
				}

				const banner = document.querySelector(".cookie-consent");
				if (banner) banner.remove();
			}}
		>
			<div className="flex-1">
				<p className="text-sm text-muted-foreground">
					We use cookies to enhance your experience and analyze our traffic. You
					can
					<span className="mx-1 text-foreground font-medium">accept all</span>
					or
					<span className="mx-1 text-foreground font-medium">
						reject non-essential
					</span>
					cookies.
				</p>
			</div>
		</CookieConsent>
	);
}
