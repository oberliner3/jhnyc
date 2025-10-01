import type { ApiProduct } from "@/lib/types";

// This file contains utility functions and client-side logic related to marketing campaigns and checkout processing.

// --- Client-side logic ---

/**
 * Attaches a click handler to a "buy now" button to include quantity
 * and variation ID in the navigation URL.
 *
 * Enhanced version that matches PHP implementation behavior.
 *
 * @param buttonSelector - CSS selector for the buy now button.
 * @param qtySelector - CSS selector for the quantity input.
 * @param variationSelector - CSS selector for the variation ID input.
 * @param utmParams - UTM parameters for tracking
 */
export function initializeCampaignButton(
	buttonSelector: string,
	qtySelector: string,
	variationSelector: string,
	utmParams?: {
		utm_source?: string;
		utm_medium?: string;
		utm_campaign?: string;
	}
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
				
				// Set quantity (matching PHP logic)
				url.searchParams.set("quantity", String(qty));

				// Set variation if available (matching PHP logic)
				if (variationInput?.value) {
					url.searchParams.set("variation_id", variationInput.value);
				}
				
				// Add UTM parameters (matching PHP defaults)
				const defaultUtmParams = {
					utm_source: 'google',
					utm_medium: 'cpc',
					utm_campaign: 'buy-now',
					...utmParams
				};
				
				Object.entries(defaultUtmParams).forEach(([key, value]) => {
					if (value) {
						url.searchParams.set(key, value);
					}
				});

				window.location.href = url.toString();
			});
		}
	});
}

/**
 * Enhanced buy now handler for React components
 * Handles form submission with proper data extraction
 */
export function handleBuyNowClick(
	productData: {
		productId: string;
		variantId?: string;
		price: number;
		productTitle: string;
		productImage?: string;
	},
	quantity: number = 1,
	utmParams?: {
		utm_source?: string;
		utm_medium?: string;
		utm_campaign?: string;
	}
): { url: string; formData: FormData } {
	// Build URL like PHP implementation
	const baseUrl = new URL('/api/buy-now', window.location.origin);
	
	// Create form data for submission
	const formData = new FormData();
	formData.append('productId', productData.productId);
	if (productData.variantId) {
		formData.append('variantId', productData.variantId);
	}
	formData.append('price', productData.price.toString());
	formData.append('quantity', quantity.toString());
	formData.append('productTitle', productData.productTitle);
	if (productData.productImage) {
		formData.append('productImage', productData.productImage);
	}
	
	// Add UTM parameters (matching PHP defaults)
	const finalUtmParams = {
		utm_source: 'google',
		utm_medium: 'cpc',
		utm_campaign: 'buy-now',
		...utmParams
	};
	
	Object.entries(finalUtmParams).forEach(([key, value]) => {
		if (value) {
			formData.append(key, value);
		}
	});
	
	return {
		url: baseUrl.toString(),
		formData
	};
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
