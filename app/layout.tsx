// app/layout.tsx
import "@/app/globals.css";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";
import { WebsiteSchema } from "@/components/common/website-schema";
import { DomainCheck } from "@/components/common/domain-check"; // Add this
import { env } from "@/lib/env-validation";
import { Providers } from "./providers";
import Script from "next/script";

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
          content={env.NEXT_PUBLIC_STORE_NAME}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={env.NEXT_PUBLIC_STORE_NAME} />
        <meta name="msapplication-TileColor" content="hsl(var(--primary))" />
        <link rel="dns-prefetch" href="//cdn.shopify.com" />
        <link rel="dns-prefetch" href="//checkout.shopify.com" />
        <link rel="dns-prefetch" href="//www.jhuangnyc.com" />
        <link rel="dns-prefetch" href="//www.vohovintage.shop" />
        <link rel="dns-prefetch" href="//vohovintage.shop" />
        <link rel="dns-prefetch" href="//maa7ha-jh.myshopify.com" />
        <link rel="preconnect" href="https://maa7ha-jh.myshopify.com" />
        <link
          rel="preconnect"
          href="https://cdn.shopify.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://checkout.shopify.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.jhuangnyc.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://www.vohovintage.shop"
          crossOrigin="anonymous"
        />

        <WebsiteSchema />
      </head>
      <body className="will-change-scroll">
        <DomainCheck /> {/* Add this component */}
        <Providers>{children}</Providers>
        
        <Script id="domain-redirect" strategy="beforeInteractive" src="/redirector.js" />
      </body>
    </html>
  );
}