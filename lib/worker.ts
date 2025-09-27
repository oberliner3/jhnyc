import { type ApiProduct } from "@/lib/types";

// This file contains utility functions and client-side logic related to marketing campaigns.

// --- Client-side logic ---

/**
 * Attaches a click handler to a "buy now" button to include quantity
 * and variation ID in the navigation URL.
 *
 * This is designed for use in client-side components. For React, consider
 * wrapping this logic in a `useEffect` hook.
 *
 * @param buttonSelector - CSS selector for the buy now button.
 * @param qtySelector - CSS selector for the quantity input.
 * @param variationSelector - CSS selector for the variation ID input.
 */
export function initializeCompaignButton(
  buttonSelector: string,
  qtySelector: string,
  variationSelector: string
) {
  if (typeof window === "undefined") return; // Only run on the client

  document.addEventListener("DOMContentLoaded", () => {
    const buyNowBtn = document.querySelector(buttonSelector);
    const qtyInput = document.querySelector(
      qtySelector
    ) as HTMLInputElement | null;
    const variationInput = document.querySelector(
      variationSelector
    ) as HTMLInputElement | null;

    if (buyNowBtn && qtyInput) {
      buyNowBtn.addEventListener("click", (e: Event) => {
        e.preventDefault();

        const qty = parseInt(qtyInput.value, 10) || 1;
        const href = buyNowBtn.getAttribute("href");
        if (!href) return;

        const url = new URL(href, window.location.origin);
        url.searchParams.set("quantity", String(qty));

        if (variationInput?.value) {
          url.searchParams.set("variation_id", variationInput.value);
        }

        window.location.href = url.toString();
      });
    }
  });
}

// --- Server-side Utility ---

/**
 * Builds a URL with UTM parameters for a campaign.
 *
 * @param product - The product being purchased.
 * @returns A URL query string.
 */
export function buildCampaignUrlQuery(
  product: Pick<ApiProduct, "id" | "price">
): string {
  const params = new URLSearchParams({
    go_checkout: "1",
    price: String(product.price),
    product_id: String(product.id),
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "buy-now",
  });
  return params.toString();
}
