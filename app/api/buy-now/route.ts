import { type NextRequest, NextResponse } from "next/server";
import { createSimpleDraftOrder } from "@/lib/shopify-client";

/**
 * Buy Now API Route - Handles direct purchase flow similar to WordPress PHP implementation
 * Creates Shopify draft orders with UTM tracking and product data for Cloudflare Worker
 */
export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();

		// Extract form data (matching PHP implementation fields)
		const productId = formData.get("productId") as string;
		const variantId = formData.get("variantId") as string;
		const price = parseFloat(formData.get("price") as string);
		const quantity = parseInt(formData.get("quantity") as string, 10) || 1;
		const productTitle = formData.get("productTitle") as string;
		const productImage = formData.get("productImage") as string;
		const customerEmail = formData.get("customerEmail") as string;
		
		// UTM parameters (matching PHP defaults)
		const utmSource = (formData.get("utm_source") as string) || "google";
		const utmMedium = (formData.get("utm_medium") as string) || "cpc";
		const utmCampaign = (formData.get("utm_campaign") as string) || "buy-now";

		// Validation (enhanced to match PHP logic)
		if (!productId) {
			return NextResponse.json(
				{ success: false, error: "Product ID is required" },
				{ status: 400 },
			);
		}
		
		if (!Number.isFinite(price) || price <= 0) {
			return NextResponse.json(
				{ success: false, error: "Invalid price" },
				{ status: 400 },
			);
		}
		
		if (quantity < 1) {
			return NextResponse.json(
				{ success: false, error: "Invalid quantity" },
				{ status: 400 },
			);
		}

		// Generate invoice number like PHP: 'Invoice' + random 7-digit number
		const invoiceNumber = `Invoice${Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000}`;

		// Create draft order using the modern Shopify client
		const draftOrder = await createSimpleDraftOrder({
			productTitle: invoiceNumber, // Use invoice number as title (matching PHP)
			variantId: variantId || undefined,
			productId: productId,
			price: price,
			quantity: quantity,
			customerEmail: customerEmail || undefined,
		});

		if (!draftOrder.invoiceUrl) {
			return NextResponse.json(
				{ success: false, error: "No invoice URL returned from Shopify" },
				{ status: 500 },
			);
		}

		// Append ALL tracking parameters (matching PHP implementation exactly)
		const finalUrl = new URL(draftOrder.invoiceUrl);
		
		// UTM parameters for tracking
		finalUrl.searchParams.set("utm_source", utmSource);
		finalUrl.searchParams.set("utm_medium", utmMedium);
		finalUrl.searchParams.set("utm_campaign", utmCampaign);
		
		// Product data for Cloudflare Worker customization
		if (productTitle) {
			finalUrl.searchParams.set("product_title", productTitle);
		}
		if (productImage) {
			finalUrl.searchParams.set("product_image", productImage);
		}

		return NextResponse.json({
			success: true,
			invoiceUrl: finalUrl.toString(),
			draftOrderId: draftOrder.id,
			draftOrderName: draftOrder.name,
			invoiceNumber: invoiceNumber,
			utmParams: {
				source: utmSource,
				medium: utmMedium,
				campaign: utmCampaign
			}
		});
	} catch (error) {
		console.error("Buy now error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}

/**
 * GET handler for URL-based buy now (similar to WordPress ?go_checkout=1 flow)
 * Supports query parameters like the PHP implementation
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		
		// Check if this is a checkout request (like PHP ?go_checkout=1)
		const goCheckout = searchParams.get('go_checkout');
		if (goCheckout !== '1') {
			return NextResponse.json(
				{ success: false, error: "Invalid checkout request" },
				{ status: 400 }
			);
		}
		
		// Extract parameters (matching PHP $_GET handling)
		const productId = searchParams.get('product_id');
		const variantId = searchParams.get('variation_id');
		const price = parseFloat(searchParams.get('price') || '0');
		const quantity = parseInt(searchParams.get('quantity') || '1', 10);
		const utmSource = searchParams.get('utm_source') || 'google';
		const utmMedium = searchParams.get('utm_medium') || 'cpc';
		const utmCampaign = searchParams.get('utm_campaign') || 'buy-now';
		
		// Validation
		if (!productId || price <= 0) {
			return NextResponse.json(
				{ success: false, error: "Invalid product or price" },
				{ status: 400 }
			);
		}
		
		// Generate invoice number like PHP
		const invoiceNumber = `Invoice${Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000}`;
		
		// Create draft order
		const draftOrder = await createSimpleDraftOrder({
			productTitle: invoiceNumber,
			variantId: variantId || undefined,
			productId: productId,
			price: price,
			quantity: quantity,
		});
		
		if (!draftOrder.invoiceUrl) {
			return NextResponse.json(
				{ success: false, error: "No invoice URL returned" },
				{ status: 500 }
			);
		}
		
		// Build redirect URL with tracking
		const redirectUrl = new URL(draftOrder.invoiceUrl);
		redirectUrl.searchParams.set('utm_source', utmSource);
		redirectUrl.searchParams.set('utm_medium', utmMedium);
		redirectUrl.searchParams.set('utm_campaign', utmCampaign);
		
		// Redirect to Shopify checkout (like PHP wp_redirect)
		return NextResponse.redirect(redirectUrl.toString());
		
	} catch (error) {
		console.error('GET buy-now error:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
