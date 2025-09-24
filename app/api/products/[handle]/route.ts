import { type NextRequest, NextResponse } from "next/server";
import { getProductByHandle, mapApiToProduct } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ handle: string }> }
) {
  const { handle } = await context.params;
  try {
    const apiProduct = await getProductByHandle(handle);
    const product = mapApiToProduct(apiProduct);
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: `Product not found${error}` },
      { status: 404 }
    );
  }
}
