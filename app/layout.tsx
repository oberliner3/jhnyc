import "@/app/globals.css";

import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Viewport } from "next";
import { WebsiteSchema } from "@/components/common/website-schema";
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
        /> <link
          rel="preconnect"
          href="https://www.vohovintage.shop"
          crossOrigin="anonymous"
        />

        <WebsiteSchema />
      </head>
      <body className="will-change-scroll">
        <Providers>{children}</Providers>
         <Script id="checkout-iframe-handler" strategy="afterInteractive">
        {`
          // This script runs after the page is interactive.
          // It intercepts checkout clicks to communicate with the
parent iframe wrapper.
          (function() {
            // Helper function to find the checkout URL from a
button/link element
            function getCheckoutUrl(element) {
              // Priority 1: Check for an href attribute
              if (element.href) {
                return element.href;
              }
              // Priority 2: Check for an onclick attribute (common in
older themes)
              const onclickAttr = element.getAttribute('onclick');
              if (onclickAttr && onclickAttr.includes('window.location')) {
                const match =
onclickAttr.match(/window\\.location\\s*=\\s*['"](.*?)['"]/);
                if (match && match[1]) {
                  return match[1];
                }
              }
              // Priority 3: Check for a data attribute
              const dataUrl = element.getAttribute('data-checkout-url');
              if (dataUrl) {
                return dataUrl;
              }
              return null;
            }

            // Main function to attach event listeners
            function attachCheckoutListeners() {
              // A comprehensive selector to find various types of
checkout buttons/links
              const checkoutSelectors = [
                'a[href*="checkout"]',
                'button[onclick*="checkout"]',
                '.checkout-button',
                '#checkout-button',
                '[data-checkout-url]'
              ].join(', ');

              document.querySelectorAll(checkoutSelectors).forEach(button => {
                // Avoid adding the listener multiple times
                if (button.dataset.iframeListenerAttached) return;

                button.addEventListener('click', function(event) {
                  const checkoutUrl = getCheckoutUrl(button);
                  if (!checkoutUrl) return; // No URL found, do nothing

                  // Check if the site is running inside an iframe
                  if (window.parent !== window) {
                    event.preventDefault(); // Stop the default navigation

                    // Send the checkout URL to the parent window
                    window.parent.postMessage({
                      type: 'checkout',
                      checkoutUrl: checkoutUrl
                    }, 'https://www.jhuangnyc.com'); // IMPORTANT:
Specify the target origin for security
                  }
                  // If NOT in an iframe, do nothing and let the
button work normally.
                });

                // Mark the button as processed
                button.dataset.iframeListenerAttached = 'true';
              });
            }

            // Run the script when the DOM is fully loaded
            document.addEventListener('DOMContentLoaded',
attachCheckoutListeners);

            // Also run after a short delay to catch buttons loaded by
other scripts
            setTimeout(attachCheckoutListeners, 1000);
          })();
        `}
      </Script>
      </body>
    </html>
  );
}
