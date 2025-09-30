import { NextRequest, NextResponse } from "next/server";
import { createSimpleDraftOrder } from "@/lib/shopify-client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productId = formData.get("productId") as string;
    const variantId = formData.get("variantId") as string;
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const productTitle = formData.get("productTitle") as string;
    const productImage = formData.get("productImage") as string;
    const customerEmail = formData.get("customerEmail") as string; // New: optional customer email

    // Validation
    const hasValidPrice = Number.isFinite(price);
    const hasValidQuantity = Number.isFinite(quantity) && quantity >= 1;
    if (!productId || !variantId || !hasValidPrice || !hasValidQuantity) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    // Create draft order using the modern Shopify client
    const draftOrder = await createSimpleDraftOrder({
      productTitle: productTitle || `Product ${productId}`,
      variantId: variantId,
      productId: productId,
      price: price,
      quantity: quantity,
      customerEmail: customerEmail || undefined,
      note: `Product: ${productTitle}, Variant: ${variantId}`,
    });

    if (!draftOrder.invoiceUrl) {
      return NextResponse.json(
        { success: false, error: "No invoice URL returned from Shopify" },
        { status: 500 }
      );
    }

    // Append tracking parameters
    const finalUrl = new URL(draftOrder.invoiceUrl);
    finalUrl.searchParams.set("product_title", productTitle || "");
    finalUrl.searchParams.set("product_image", productImage || "");

    return NextResponse.json({
      success: true,
      invoiceUrl: finalUrl.toString(),
      draftOrderId: draftOrder.id,
      draftOrderName: draftOrder.name,
    });
  } catch (error) {
    console.error("Buy now error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}
