import { createAdminApiClient } from '@shopify/admin-api-client';
import { getServerEnv } from '@/lib/env-validation';

// SECURITY: Only use server-side environment variables - NEVER expose tokens to client
function getShopifyConfig() {
  const env = getServerEnv();
  return {
    shopDomain: env.SHOPIFY_SHOP,
    accessToken: env.SHOPIFY_ACCESS_TOKEN || env.SHOPIFY_TOKEN,
    shopName: env.SHOPIFY_SHOP_NAME,
  };
}

const { shopDomain, accessToken } = getShopifyConfig();

// Create the Shopify Admin API client
export const shopifyAdmin = createAdminApiClient({
  storeDomain: shopDomain,
  accessToken: accessToken,
  apiVersion: '2024-10', // Updated to a supported API version
});

// Helper function to get shop domain without protocol
export const getShopDomain = () => {
  return shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
};

// Helper function to get access token
export const getAccessToken = () => {
  return accessToken;
};

// Type definitions for our draft order creation
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
  province: string;
  country: string;
  zip: string;
  phone?: string;
}

export interface ShopifyDraftOrder {
  id: string;
  name: string;
  invoiceUrl?: string;
  order?: { id: string };
  customer?: { id?: string; email?: string; firstName?: string; lastName?: string };
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
  note?: string;
  tags?: string;
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

// Draft order creation function using the modern API client
export async function createDraftOrder(orderData: DraftOrderInput) {
  try {
    const query = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
            order {
              id
            }
            customer {
              id
              email
              firstName
              lastName
            }
            totalPrice
            subtotalPrice
            totalTax
            currencyCode
            note
            tags
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await shopifyAdmin.request(query, {
      variables: {
        input: orderData
      }
    });

    const { draftOrderCreate } = response.data as {
      draftOrderCreate: {
        draftOrder: ShopifyDraftOrder;
        userErrors?: Array<{ field?: string; message: string }>;
      };
    };

    if (draftOrderCreate.userErrors && draftOrderCreate.userErrors.length > 0) {
      throw new Error(`Shopify API errors: ${draftOrderCreate.userErrors.map((e) => e.message).join(', ')}`);
    }

    return draftOrderCreate.draftOrder;
  } catch (error) {
    console.error('Error creating draft order:', error);
    throw new Error(`Failed to create draft order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Send invoice function
export async function sendDraftOrderInvoice(draftOrderId: string, invoiceData?: {
  to?: string;
  from?: string;
  subject?: string;
  customMessage?: string;
}) {
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

    const response = await shopifyAdmin.request(mutation, {
      variables: {
        id: draftOrderId,
        email: invoiceData ? {
          to: invoiceData.to,
          from: invoiceData.from,
          subject: invoiceData.subject,
          customMessage: invoiceData.customMessage,
        } : undefined
      }
    });

    const { draftOrderInvoiceSend } = response.data as {
      draftOrderInvoiceSend: {
        draftOrder: ShopifyDraftOrder;
        userErrors?: Array<{ field?: string; message: string }>;
      };
    };

    if (draftOrderInvoiceSend.userErrors && draftOrderInvoiceSend.userErrors.length > 0) {
      throw new Error(`Shopify API errors: ${draftOrderInvoiceSend.userErrors.map((e) => e.message).join(', ')}`);
    }

    return draftOrderInvoiceSend.draftOrder;
  } catch (error) {
    console.error('Error sending draft order invoice:', error);
    throw new Error(`Failed to send draft order invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Legacy support: Simplified draft order creation for backward compatibility
export async function createSimpleDraftOrder({
  productTitle,
  variantId,
  productId,
  price,
  quantity,
  customerEmail,
  note,
}: {
  productTitle: string;
  variantId?: string;
  productId?: string;
  price: number;
  quantity: number;
  customerEmail?: string;
  note?: string;
}) {
  const orderData: DraftOrderInput = {
    line_items: [{
      title: productTitle,
      ...(variantId && { variant_id: variantId }),
      ...(productId && { product_id: productId }),
      quantity: quantity,
      price: price.toFixed(2),
    }],
    ...(customerEmail && { 
      customer: { email: customerEmail },
      email: customerEmail 
    }),
    ...(note && { note }),
    use_customer_default_address: true,
  };

  return await createDraftOrder(orderData);
}