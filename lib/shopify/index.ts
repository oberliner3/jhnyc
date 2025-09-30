// Unified Shopify service interface
export {
	createDraftOrder,
	sendDraftOrderInvoice,
	createSimpleDraftOrder,
	getShopifyAdmin,
	getShopDomain,
	getAccessToken,
} from "../shopify-client";

export type {
	DraftOrderInput,
	DraftOrderLineItem,
	DraftOrderCustomer,
	DraftOrderShippingAddress,
	ShopifyDraftOrder,
} from "../shopify-client";

// Backward compatibility: Legacy interface for existing code
export interface LegacyShopifyDraftOrderData {
	draft_order: {
		line_items: Array<{
			title: string;
			price: string;
			quantity: number;
			variant_id: string;
		}>;
		customer: {
			email: string;
			first_name: string;
			last_name: string;
			addresses: Array<{
				first_name: string;
				last_name: string;
				address1: string;
				city: string;
				zip: string;
				country: string;
				phone?: string;
			}>;
		};
		shipping_address: {
			first_name: string;
			last_name: string;
			address1: string;
			city: string;
			zip: string;
			country: string;
			phone?: string;
		};
		billing_address: {
			first_name: string;
			last_name: string;
			address1: string;
			city: string;
			zip: string;
			country: string;
			phone?: string;
		};
		use_customer_default_address: boolean;
		note?: string;
	};
}

/**
 * Legacy compatibility function for old createShopifyDraftOrder interface
 * @deprecated Use createDraftOrder from shopify-client.ts directly
 */
export async function createShopifyDraftOrder(
	data: LegacyShopifyDraftOrderData,
) {
	const { createDraftOrder } = await import("../shopify-client");

	// Transform legacy format to modern DraftOrderInput format
	const modernData = {
		line_items: data.draft_order.line_items.map((item) => ({
			title: item.title,
			variant_id: item.variant_id,
			quantity: item.quantity,
			price: parseFloat(item.price),
		})),
		customer: {
			email: data.draft_order.customer.email,
			first_name: data.draft_order.customer.first_name,
			last_name: data.draft_order.customer.last_name,
		},
		shipping_address: {
			first_name: data.draft_order.shipping_address.first_name,
			last_name: data.draft_order.shipping_address.last_name,
			address1: data.draft_order.shipping_address.address1,
			city: data.draft_order.shipping_address.city,
			zip: data.draft_order.shipping_address.zip,
			country: data.draft_order.shipping_address.country,
			phone: data.draft_order.shipping_address.phone,
			province: "", // Default empty for legacy compatibility
		},
		billing_address: {
			first_name: data.draft_order.billing_address.first_name,
			last_name: data.draft_order.billing_address.last_name,
			address1: data.draft_order.billing_address.address1,
			city: data.draft_order.billing_address.city,
			zip: data.draft_order.billing_address.zip,
			country: data.draft_order.billing_address.country,
			phone: data.draft_order.billing_address.phone,
			province: "", // Default empty for legacy compatibility
		},
		use_customer_default_address: data.draft_order.use_customer_default_address,
		note: data.draft_order.note,
	};

	return await createDraftOrder(modernData);
}
