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

    // Get search params from the request URL
    const searchParams = request.nextUrl.searchParams;
    const includeVariants = searchParams.get("includeVariants") === "true";
    const includeImages = searchParams.get("includeImages") !== "false";

    // Build the API endpoint with query parameters
    let endpoint = `/products/${id}`;
    const queryParams = new URLSearchParams();

    if (includeVariants) {
      queryParams.append("includeVariants", "true");
    }
    if (!includeImages) {
      queryParams.append("includeImages", "false");
    }

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    const product = await apiRequest(endpoint);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Add cache control headers
    const response = NextResponse.json(product);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );

    return response;
  } catch (error) {
    console.error(
      `[API] Failed to fetch product with id ${
        (await params).id
      } from external API:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
