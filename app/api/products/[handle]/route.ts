import { type NextRequest, NextResponse } from "next/server";
import { getProductByHandle } from "@/lib/api";

export async function GET(
  request: NextRequest,
  context: { params: { handle: string } }
) {
  try {
    const { handle } = context.params;
    const product = await getProductByHandle(handle);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(
      `[API] Failed to fetch product with handle ${context.params.handle}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
