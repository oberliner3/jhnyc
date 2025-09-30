import type { ApiProduct } from "@/lib/types";

// This file contains utility functions and client-side logic related to marketing campaigns and checkout processing.

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
export function initializeCampaignButton(
	buttonSelector: string,
	qtySelector: string,
	variationSelector: string,
) {
	if (typeof window === "undefined") return; // Only run on the client

	document.addEventListener("DOMContentLoaded", () => {
		const buyNowBtn = document.querySelector(buttonSelector);
		const qtyInput = document.querySelector(
			qtySelector,
		) as HTMLInputElement | null;
		const variationInput = document.querySelector(
			variationSelector,
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

/**
 * Processes checkout data and prepares it for Shopify integration
 * @param checkoutData - The checkout form data
 * @returns Processed data ready for Shopify
 */
export function processCheckoutData(checkoutData: {
	items: Array<{
		productId: string;
		variantId: string;
		quantity: number;
		price: number;
	}>;
	customer: {
		email: string;
		firstName: string;
		lastName: string;
		address: string;
		city: string;
		postalCode: string;
		country: string;
		phone?: string;
	};
	totals: {
		subtotal: number;
		shipping: number;
		tax: number;
		total: number;
	};
}) {
	// Create Shopify-compatible line items
	const lineItems = checkoutData.items.map((item) => ({
		title: `Product ${item.productId}`,
		price: item.price.toFixed(2),
		quantity: item.quantity,
		variant_id: item.variantId,
	}));

	// Create customer data
	const customer = {
		email: checkoutData.customer.email,
		first_name: checkoutData.customer.firstName,
		last_name: checkoutData.customer.lastName,
		addresses: [
			{
				first_name: checkoutData.customer.firstName,
				last_name: checkoutData.customer.lastName,
				address1: checkoutData.customer.address,
				city: checkoutData.customer.city,
				zip: checkoutData.customer.postalCode,
				country: checkoutData.customer.country,
				phone: checkoutData.customer.phone,
			},
		],
	};

	// Create shipping address
	const shippingAddress = {
		first_name: checkoutData.customer.firstName,
		last_name: checkoutData.customer.lastName,
		address1: checkoutData.customer.address,
		city: checkoutData.customer.city,
		zip: checkoutData.customer.postalCode,
		country: checkoutData.customer.country,
		phone: checkoutData.customer.phone,
	};

	return {
		draft_order: {
			line_items: lineItems,
			customer,
			shipping_address: shippingAddress,
			billing_address: shippingAddress,
			use_customer_default_address: false,
			note: `Order total: $${checkoutData.totals.total.toFixed(
				2,
			)} (Subtotal: $${checkoutData.totals.subtotal.toFixed(
				2,
			)}, Shipping: $${checkoutData.totals.shipping.toFixed(
				2,
			)}, Tax: $${checkoutData.totals.tax.toFixed(2)})`,
		},
	};
}

// --- Server-side Utility ---

/**
 * Builds a URL with UTM parameters for a campaign.
 *
 * @param product - The product being purchased.
 * @returns A URL query string.
 */
export function buildCampaignUrlQuery(
	product: Pick<ApiProduct, "id" | "price">,
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
