import { type NextRequest, NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/constants";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SITE_CONFIG.api}${endpoint}`;
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API request failed with status ${response.status}: ${errorBody}`
    );
  }
  return response.json();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await apiRequest(`/products/${id}`);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(`[API] Failed to fetch product with id ${(await params).id} from external API:`, error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
