import { type NextRequest, NextResponse } from "next/server";
import { FEATURED_PRODUCTS } from "@/lib/data/products";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  const { handle } = await context.params;
  const product = FEATURED_PRODUCTS.find((p) => p.handle === handle);

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
