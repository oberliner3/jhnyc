import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productId = formData.get("productId") as string;
    const variantId = formData.get("variantId") as string;
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const productTitle = formData.get("productTitle") as string;
    const productImage = formData.get("productImage") as string;

    if (!productId || !variantId || !price || !quantity) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const shop = process.env.SHOPIFY_SHOP;
    const token = process.env.SHOPIFY_TOKEN;

    if (!shop || !token) {
      return NextResponse.json(
        { success: false, error: "Shopify not configured" },
        { status: 500 }
      );
    }

    // Create unique invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    // Create Shopify draft order
    const draftOrderData = {
      draft_order: {
        line_items: [
          {
            title: productTitle || invoiceNumber,
            price: price.toFixed(2),
            quantity: quantity,
          },
        ],
        note: `Product: ${productTitle}, Variant: ${variantId}`,
        use_customer_default_address: true,
      },
    };

    const response = await fetch(
      `https://${shop}/admin/api/2024-01/draft_orders.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftOrderData),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Shopify API Error:", errorBody);
      return NextResponse.json(
        { success: false, error: "Failed to create draft order" },
        { status: 500 }
      );
    }

    const responseData = await response.json();
    const invoiceUrl = responseData.draft_order?.invoice_url;

    if (!invoiceUrl) {
      return NextResponse.json(
        { success: false, error: "No invoice URL returned" },
        { status: 500 }
      );
    }

    // Append tracking parameters
    const finalUrl = new URL(invoiceUrl);
    finalUrl.searchParams.set("product_title", productTitle || "");
    finalUrl.searchParams.set("product_image", productImage || "");

    return NextResponse.json({
      success: true,
      invoiceUrl: finalUrl.toString(),
    });
  } catch (error) {
    console.error("Buy now error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
