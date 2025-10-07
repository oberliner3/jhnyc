import "@/app/globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";
import { WebsiteSchema } from "@/components/common/website-schema";
import { env } from "@/lib/env-validation";
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
          content={env.NEXT_PUBLIC_STORE_NAME}
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content={env.NEXT_PUBLIC_STORE_NAME} />
        <meta name="msapplication-TileColor" content="hsl(var(--primary))" />
        <link rel="dns-prefetch" href="//cdn.shopify.com" />
        <link rel="dns-prefetch" href="//checkout.shopify.com" />
        <link rel="dns-prefetch" href="//www.vohovintage.com" />
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
          href="https://www.vohovintage.com"
          crossOrigin="anonymous"
        />

        <WebsiteSchema />
      </head>
      <body className="will-change-scroll">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
