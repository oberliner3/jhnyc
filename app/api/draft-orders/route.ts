import { type NextRequest, NextResponse } from "next/server";
import { createDraftOrder, sendDraftOrderInvoice } from "@/lib/shopify-client";
import type { DraftOrderInput, DraftOrderLineItem, DraftOrderShippingAddress } from "@/lib/shopify-client";
import { 
	decodeShopifyDraftOrder, 
	encodeShopifyData,
	calculateCompressionRatio 
} from "@/lib/msgpack-shopify";

interface RequestLineItem {
  title?: string;
  variantId?: string;
  productId?: string;
  quantity: number;
  price?: string;
  sku?: string;
  grams?: number;
  taxable?: boolean;
  requiresShipping?: boolean;
}

interface DraftOrderRequestBody {
  lineItems: RequestLineItem[];
  customerEmail?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  shippingAddress?: DraftOrderShippingAddress;
  billingAddress?: DraftOrderShippingAddress;
  note?: string;
  tags?: string;
  sendInvoice?: boolean;
  invoiceData?: {
    subject?: string;
    customMessage?: string;
    from?: string;
  };
}

export async function POST(request: NextRequest) {
	try {
		// Check if request is MessagePack or JSON
		const contentType = request.headers.get("Content-Type");
		let body: DraftOrderRequestBody;
		
		if (contentType?.includes("application/x-msgpack")) {
			const arrayBuffer = await request.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			// Decode MessagePack data - note this returns DraftOrderInput format
			const decodedData = decodeShopifyDraftOrder(uint8Array);
			// Transform to DraftOrderRequestBody format
			body = {
				lineItems: decodedData.line_items || [],
				customerEmail: decodedData.customer?.email,
				customerFirstName: decodedData.customer?.first_name,
				customerLastName: decodedData.customer?.last_name,
				customerPhone: decodedData.customer?.phone,
				shippingAddress: decodedData.shipping_address,
				billingAddress: decodedData.billing_address,
				note: decodedData.note,
				tags: decodedData.tags,
				// Add default values for missing properties
				sendInvoice: false,
				invoiceData: undefined,
			} as DraftOrderRequestBody;
			console.log("📦 Received MessagePack draft order request");
		} else {
			body = await request.json();
		}

		const {
			lineItems,
			customerEmail,
			customerFirstName,
			customerLastName,
			customerPhone,
			shippingAddress,
			billingAddress,
			note,
			tags,
			sendInvoice = false,
			invoiceData,
		} = body;

		// Validation
		if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Line items are required" },
				{ status: 400 },
			);
		}

		// Validate line items
		for (const item of lineItems) {
			if (!item.quantity || item.quantity < 1) {
				return NextResponse.json(
					{
						success: false,
						error: "Each line item must have a valid quantity",
					},
					{ status: 400 },
				);
			}
		}

		// Build draft order data
		const draftOrderData: DraftOrderInput = {
			line_items: lineItems.map(
				(item): DraftOrderLineItem => ({
					title: item.title,
					variant_id: item.variantId,
					product_id: item.productId,
					quantity: item.quantity,
					price: item.price ? parseFloat(item.price) : undefined,
					sku: item.sku,
					grams: item.grams,
					taxable: item.taxable,
					requires_shipping: item.requiresShipping,
				}),
			),
			...(customerEmail && {
				customer: {
					email: customerEmail,
					first_name: customerFirstName,
					last_name: customerLastName,
					phone: customerPhone,
				},
				email: customerEmail,
			}),
			...(shippingAddress && { shipping_address: shippingAddress }),
			...(billingAddress && { billing_address: billingAddress }),
			...(note && { note }),
			...(tags && { tags }),
			use_customer_default_address: !shippingAddress,
		};

		// Create the draft order
		const draftOrder = await createDraftOrder(draftOrderData);

		let invoiceSent = false;
		let invoiceError = null;

		// Send invoice if requested
		if (sendInvoice && draftOrder.id && customerEmail) {
			try {
				await sendDraftOrderInvoice(draftOrder.id, {
					to: customerEmail,
					subject:
						invoiceData?.subject ||
						`Invoice #${draftOrder.name || draftOrder.id}`,
					customMessage: invoiceData?.customMessage,
					from: invoiceData?.from,
				});
				invoiceSent = true;
			} catch (error) {
				console.error("Failed to send invoice:", error);
				invoiceError =
					error instanceof Error ? error.message : "Failed to send invoice";
			}
		}

		const responseData = {
			success: true,
			draftOrder: {
				id: draftOrder.id,
				name: draftOrder.name,
				invoiceUrl: draftOrder.invoiceUrl,
				totalPrice: draftOrder.totalPrice,
				subtotalPrice: draftOrder.subtotalPrice,
				totalTax: draftOrder.totalTax,
				currencyCode: draftOrder.currencyCode,
				customer: draftOrder.customer,
				note: draftOrder.note,
				tags: draftOrder.tags,
				createdAt: draftOrder.createdAt,
				updatedAt: draftOrder.updatedAt,
			},
			invoiceSent,
			...(invoiceError && { invoiceError }),
		};

		// Check if client accepts MessagePack response
		const acceptHeader = request.headers.get("Accept");
		if (acceptHeader?.includes("application/x-msgpack")) {
			const encodedResponse = encodeShopifyData(responseData);
			const compressionStats = calculateCompressionRatio(responseData);
			
			console.log(`📦 Sending MessagePack response - Compression: ${compressionStats.savings} (${compressionStats.originalSize}B → ${compressionStats.compressedSize}B)`);
			
			const response = new NextResponse(Buffer.from(encodedResponse), {
				headers: { 
					"Content-Type": "application/x-msgpack",
					"X-Compression-Ratio": compressionStats.compressionRatio.toString(),
					"X-Compression-Savings": compressionStats.savings,
				},
			});
			return response;
		}

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Draft order creation error:", error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : "Internal server error",
			},
			{ status: 500 },
		);
	}
}

export async function GET() {
	return NextResponse.json(
		{
			success: false,
			error:
				"This endpoint only accepts POST requests. Use POST to create draft orders.",
		},
		{ status: 405 },
	);
}
