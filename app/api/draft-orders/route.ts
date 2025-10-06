import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env-validation";
import type { Address } from "@/lib/types";

// SECURITY: Only use server-side environment variables - NEVER expose tokens to client
function getShopifyConfig() {
	if (
    !env.SHOPIFY_ACCESS_TOKEN ||
    !env.SHOPIFY_SHOP ||
    !env.SHOPIFY_SHOP_NAME
  ) {
    throw new Error(
      "Shopify configuration is missing. Provide SHOPIFY_ACCESS_TOKEN, SHOPIFY_SHOP, and SHOPIFY_SHOP_NAME."
    );
  }
	return {
    shopDomain: env.SHOPIFY_SHOP,
    shopName: env.SHOPIFY_SHOP_NAME,
    accessToken: env.SHOPIFY_ACCESS_TOKEN,
  };
}

type ShopifyUserError = {
	field?: string[];
	message: string;
};

// Transformer function to map canonical Address to Shopify's format
function toShopifyAddress(address: Address): DraftOrderShippingAddress {
	return {
		address1: address.address1,
		address2: address.address2,
		city: address.city,
		country: address.country,
		zip: address.zip,
		province: address.province || "",
		first_name: address.firstName,
		last_name: address.lastName,
		phone: address.phone,
		company: address.company,
	};
}

export interface DraftOrderLineItem {
	title?: string;
	variant_id?: string | number;
	product_id?: string | number;
	quantity: number;
	price?: string | number;
	sku?: string;
	grams?: number;
	taxable?: boolean;
	requires_shipping?: boolean;
}

export interface DraftOrderCustomer {
	id?: string | number;
	email?: string;
	first_name?: string;
	last_name?: string;
	phone?: string;
	accepts_marketing?: boolean;
}

export interface DraftOrderShippingAddress {
	first_name?: string;
	last_name?: string;
	company?: string;
	address1: string;
	address2?: string;
	city: string;
	province?: string;
	country: string;
	zip?: string;
	phone?: string;
}

export interface ShopifyDraftOrder {
	id: string;
	name: string;
	invoiceUrl?: string;
	order?: { id: string };
	customer?: {
		id?: string;
		email?: string;
		firstName?: string;
		lastName?: string;
	};
	totalPrice: string;
	subtotalPrice: string;
	totalTax: string;
	currencyCode: string;
	note?: string;
	tags?: string[];
	createdAt: string;
	updatedAt: string;
}

export interface DraftOrderInput {
	line_items: DraftOrderLineItem[];
	customer?: DraftOrderCustomer;
	shipping_address?: DraftOrderShippingAddress;
	billing_address?: DraftOrderShippingAddress;
	tags?: string;
	note?: string;
	email?: string;
	currency?: string;
	use_customer_default_address?: boolean;
	tax_lines?: Array<{
		title: string;
		rate: number;
		price: string;
	}>;
	shipping_lines?: Array<{
		title: string;
		price: string;
		code?: string;
	}>;
}

// Helpers to format Shopify GraphQL IDs
function toGid(
	type: "Product" | "ProductVariant" | "DraftOrder",
	id: string | number | undefined,
) {
	if (!id) return undefined;
	const str = String(id);
	return str.startsWith("gid://") ? str : `gid://shopify/${type}/${str}`;
}

// Map our REST-like input to Shopify GraphQL DraftOrderInput
function toGraphqlDraftOrderInput(input: DraftOrderInput) {
  const lineItems = (input.line_items || []).map((li) => {
    const variantGid = li.variant_id
      ? toGid("ProductVariant", li.variant_id)
      : undefined;

    // Log the conversion for debugging
    if (li.variant_id) {
      console.log("[toGraphqlDraftOrderInput] Converting variant ID:", {
        original: li.variant_id,
        converted: variantGid,
      });
    }

    return {
      ...(variantGid ? { variantId: variantGid } : {}),
      quantity: li.quantity,
      ...(li.title ? { title: li.title } : {}),
      ...(li.price !== undefined
        ? { originalUnitPrice: String(li.price) }
        : {}),
    };
  });

  const customer = input.customer
    ? {
        ...(input.customer.email ? { email: input.customer.email } : {}),
        ...(input.customer.first_name
          ? { firstName: input.customer.first_name }
          : {}),
        ...(input.customer.last_name
          ? { lastName: input.customer.last_name }
          : {}),
        ...(input.customer.phone ? { phone: input.customer.phone } : {}),
      }
    : undefined;

  const shippingAddress = input.shipping_address
    ? toShopifyAddress(input.shipping_address)
    : undefined;

  const billingAddress = input.billing_address
    ? toShopifyAddress(input.billing_address)
    : undefined;

  return {
    lineItems,
    ...(customer ? { customer } : {}),
    ...(shippingAddress ? { shippingAddress } : {}),
    ...(billingAddress ? { billingAddress } : {}),
    ...(input.email ? { email: input.email } : {}),
    ...(input.note ? { note: input.note } : {}),
    useCustomerDefaultAddress: Boolean(input.use_customer_default_address),
    ...(input.tags
      ? {
          tags: input.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }
      : {}),
  };
}

async function shopifyFetch(query: string, variables: Record<string, unknown>) {
  const { shopDomain, accessToken } = getShopifyConfig();
  const apiUrl = `https://${shopDomain}/admin/api/2024-01/graphql.json`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Shopify API request failed: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  return response.json();
}

// Draft order creation function using fetch
async function createDraftOrder(orderData: DraftOrderInput) {
  try {
    const query = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
            order { id }
            customer { id email firstName lastName }
            totalPrice
            subtotalPrice
            totalTax
            currencyCode
            tags
            createdAt
            updatedAt
          }
          userErrors { field message }
        }
      }
    `;

    const graphqlInput = toGraphqlDraftOrderInput(orderData);
    const variables = { input: graphqlInput };

    // Log the GraphQL input for debugging
    console.log("[createDraftOrder] Sending to Shopify:", {
      lineItems: graphqlInput.lineItems,
      hasCustomer: !!graphqlInput.customer,
      tags: graphqlInput.tags,
    });

    const response = await shopifyFetch(query, variables);

    const draftOrderCreate = response.data?.draftOrderCreate;

    if (!draftOrderCreate) {
      const errors = response.errors || response.extensions;
      console.error("[createDraftOrder] Shopify returned no data:", {
        errors,
        fullResponse: response,
      });
      throw new Error(
        `Shopify draftOrderCreate returned no data: ${JSON.stringify(errors)}`
      );
    }

    if (draftOrderCreate.userErrors && draftOrderCreate.userErrors.length > 0) {
      console.error("[createDraftOrder] Shopify user errors:", {
        userErrors: draftOrderCreate.userErrors,
        sentInput: graphqlInput,
      });
      throw new Error(
        `Shopify API errors: ${draftOrderCreate.userErrors
          .map((e: ShopifyUserError) => e.message)
          .join(", ")}`
      );
    }

    console.log("[createDraftOrder] Draft order created successfully:", {
      draftOrderId: draftOrderCreate.draftOrder?.id,
      hasInvoiceUrl: !!draftOrderCreate.draftOrder?.invoiceUrl,
    });

    return draftOrderCreate.draftOrder;
  } catch (error) {
    console.error("Error creating draft order:", error);
    throw new Error(
      `Failed to create draft order: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Send invoice function using fetch
async function sendDraftOrderInvoice(
	draftOrderId: string,
	invoiceData?: {
		to?: string;
		from?: string;
		subject?: string;
		customMessage?: string;
	},
) {
	try {
		const mutation = `
      mutation draftOrderInvoiceSend($id: ID!, $email: EmailInput) {
        draftOrderInvoiceSend(id: $id, email: $email) {
          draftOrder {
            id
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

		const variables = {
			id: toGid("DraftOrder", draftOrderId)!,
			email: invoiceData
				? {
						to: invoiceData.to,
						from: invoiceData.from,
						subject: invoiceData.subject,
						customMessage: invoiceData.customMessage,
					}
				: undefined,
		};

		const response = await shopifyFetch(mutation, variables);

		const draftOrderInvoiceSend = response.data?.draftOrderInvoiceSend;

		if (!draftOrderInvoiceSend) {
			const errors = response.errors || response.extensions;
			throw new Error(
				`Shopify draftOrderInvoiceSend returned no data: ${JSON.stringify(errors)}`,
			);
		}

		if (
			draftOrderInvoiceSend.userErrors &&
			draftOrderInvoiceSend.userErrors.length > 0
		) {
			throw new Error(
				`Shopify API errors: ${draftOrderInvoiceSend.userErrors.map((e: ShopifyUserError) => e.message).join(", ")}`,
			);
		}

		return draftOrderInvoiceSend.draftOrder;
	} catch (error) {
		console.error("Error sending draft order invoice:", error);
		throw new Error(
			`Failed to send draft order invoice: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

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
    // Validate Shopify configuration first
    try {
      getShopifyConfig();
    } catch (configError) {
      console.error("Shopify configuration error:", configError);
      return NextResponse.json(
        {
          success: false,
          error:
            configError instanceof Error
              ? configError.message
              : "Shopify configuration is missing or invalid",
        },
        { status: 500 }
      );
    }

    const body: DraftOrderRequestBody = await request.json();

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
        { status: 400 }
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
          { status: 400 }
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
        })
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

    // Removed MessagePack encoding for outgoing responses as per new architecture
    // If MessagePack is still desired for generic API communication, it should be handled by a generic utility.
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
