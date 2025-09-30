"use server";

import { redirect } from "next/navigation";
import type { ApiProduct } from "@/lib/types";
import { createSimpleDraftOrder } from "@/lib/shopify-client";
import { logError, ShopifyApiError } from "@/lib/errors";
import { LIMITS, ERROR_MESSAGES } from "@/lib/constants";

/**
 * Handles a campaign "buy now" request on the server.
 * It creates a Shopify draft order and then redirects the user to the checkout URL.
 * This is a Server Action with enhanced validation and error handling.
 */
export async function handleCampaignRedirect(
	product: Pick<ApiProduct, "price" | "quantity">,
	tracking: {
		utm_source?: string;
		utm_medium?: string;
		utm_campaign?: string;
		product_title?: string;
		product_image?: string;
	},
): Promise<never> {
	try {
		// Input validation
		if (!product || typeof product.price !== "number" || product.price <= 0) {
			throw new Error("Invalid product price");
		}

		const quantity = product.quantity || 1;
		if (
			quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
			quantity > LIMITS.MAX_QUANTITY_PER_ITEM
		) {
			throw new Error(
				`Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`,
			);
		}

		const invoiceNumber = `Campaign-${Date.now()}-${Math.floor(
			Math.random() * 9000000,
		)}`;

		// Create draft order using the modern Shopify client
		const draftOrder = await createSimpleDraftOrder({
			productTitle: tracking.product_title || invoiceNumber,
			price: product.price,
			quantity: quantity,
			note: `Campaign order - UTM Source: ${tracking.utm_source || "direct"}, UTM Medium: ${tracking.utm_medium || "none"}, UTM Campaign: ${tracking.utm_campaign || "none"}`,
		});

		if (!draftOrder?.invoiceUrl) {
			throw new ShopifyApiError("No invoice URL returned from Shopify");
		}

		const redirectUrl = new URL(draftOrder.invoiceUrl);

		// Append tracking parameters to the final checkout URL
		Object.entries(tracking).forEach(([key, value]) => {
			if (value && typeof value === "string" && value.trim()) {
				redirectUrl.searchParams.set(key, value.trim());
			}
		});

		redirect(redirectUrl.toString());
	} catch (error) {
		logError(error instanceof Error ? error : new Error("Unknown error"), {
			context: "handleCampaignRedirect",
			product: { price: product.price, quantity: product.quantity },
			tracking,
		});

		// Re-throw with user-friendly message
		if (error instanceof ShopifyApiError) {
			throw new Error(ERROR_MESSAGES.SHOPIFY_ERROR);
		}

		throw new Error(
			error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
		);
	}
}

/**
 * Server Action suitable for use as a <form action={buyNowAction}> handler.
 * Expects FormData fields matching the Buy Now button's hidden inputs.
 * Enhanced with comprehensive validation and error handling.
 */
export async function buyNowAction(formData: FormData): Promise<never> {
	try {
		// Extract and validate form data
		const productId = String(formData.get("productId") || "").trim();
		const variantId = String(formData.get("variantId") || "").trim();
		const price = Number(formData.get("price"));
		const quantity = Number(formData.get("quantity"));
		const productTitle = String(formData.get("productTitle") || "").trim();
		const productImage = String(formData.get("productImage") || "").trim();
		const customerEmail = String(formData.get("customerEmail") || "").trim();

		// Enhanced validation
		if (!productId) {
			throw new Error("Product ID is required");
		}
		if (!variantId) {
			throw new Error("Variant ID is required");
		}
		if (!Number.isFinite(price) || price <= 0) {
			throw new Error("Valid price is required");
		}
		if (
			!Number.isFinite(quantity) ||
			quantity < LIMITS.MIN_QUANTITY_PER_ITEM ||
			quantity > LIMITS.MAX_QUANTITY_PER_ITEM
		) {
			throw new Error(
				`Quantity must be between ${LIMITS.MIN_QUANTITY_PER_ITEM} and ${LIMITS.MAX_QUANTITY_PER_ITEM}`,
			);
		}
		if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
			throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
		}

		// Create draft order using the modern Shopify client
		const draftOrder = await createSimpleDraftOrder({
			productTitle: productTitle || `Product ${productId}`,
			variantId: variantId,
			productId: productId,
			price: price,
			quantity: quantity,
			customerEmail: customerEmail || undefined,
			note: `Product: ${productTitle || "Unknown"}, Variant: ${variantId}`,
		});

		if (!draftOrder?.invoiceUrl) {
			throw new ShopifyApiError("No invoice URL returned from Shopify");
		}

		// Append tracking parameters to the invoice URL
		const finalUrl = new URL(draftOrder.invoiceUrl);
		if (productTitle) {
			finalUrl.searchParams.set("product_title", productTitle);
		}
		if (productImage) {
			finalUrl.searchParams.set("product_image", productImage);
		}

		// Redirect to the invoice URL for payment
		redirect(finalUrl.toString());
	} catch (error) {
		logError(error instanceof Error ? error : new Error("Unknown error"), {
			context: "buyNowAction",
			formData: Object.fromEntries(formData.entries()),
		});

		// Re-throw with user-friendly message
		if (error instanceof ShopifyApiError) {
			throw new Error(ERROR_MESSAGES.SHOPIFY_ERROR);
		}

		throw new Error(
			error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
		);
	}
}
