interface ShopifyDraftOrderData {
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

export async function createShopifyDraftOrder(data: ShopifyDraftOrderData) {
  if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP || !process.env.NEXT_PUBLIC_SHOPIFY_TOKEN) {
    throw new Error("Shopify configuration missing");
  }

  const shop = process.env.NEXT_PUBLIC_SHOPIFY_SHOP;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_TOKEN;

  const response = await fetch(
    `https://${shop}/admin/api/2024-01/draft_orders.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Shopify API Error:", errorBody);
    throw new Error(
      `Failed to create Shopify draft order: ${response.statusText}`
    );
  }

  const responseData = await response.json();
  return responseData.draft_order;
}
