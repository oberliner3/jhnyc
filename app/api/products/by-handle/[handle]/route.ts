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
  context: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await context.params;

    // Parse query params from the request
    const searchParams = request.nextUrl.searchParams;
    const includeVariants = searchParams.get("includeVariants") === "true";
    const includeImages = searchParams.get("includeImages") !== "false";

    // Build upstream endpoint with optional query params
    let endpoint = `/products/${handle}`;
    const queryParams = new URLSearchParams();
    if (includeVariants) queryParams.append("includeVariants", "true");
    if (!includeImages) queryParams.append("includeImages", "false");
    const qs = queryParams.toString();
    if (qs) endpoint += `?${qs}`;

    const product = await apiRequest(endpoint);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add cache-control headers for better performance
    const response = NextResponse.json(product);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    return response;
  } catch (error) {
    console.error(
      `[API] Failed to fetch product with handle ${
        (await context.params).handle
      } from external API:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
