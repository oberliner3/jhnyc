import { type NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const vendor = searchParams.get("vendor") || undefined;
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const page = Number(searchParams.get("page")) || 1;

    logger.api("GET", "/api/products", undefined, undefined);
    logger.debug("Loading products", {
      limit,
      page,
      search: search || "none",
      vendor,
    });

    // Use a generic product loader that returns JSON
    const products = await getProducts({
      limit,
      page,
      search,
      context: "ssr",
    });

    // TODO: Handle vendor filtering client-side if external API doesn't support it
    let filteredProducts = products;
    if (vendor) {
      filteredProducts = products.filter(
        (p) => p.vendor?.toLowerCase() === vendor.toLowerCase()
      );
    }

    const responseData = {
      products: filteredProducts,
      page,
      limit,
      total: filteredProducts.length,
      hasMore: products.length === limit, // Simple heuristic
    };

    // Standard JSON response with caching
    const response = NextResponse.json(responseData);
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=600"
    );

    logger.debug(`Sending products response`, {
      count: filteredProducts.length,
    });
    return response;
  } catch (error) {
    logger.error("Failed to fetch products from API", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        products: [],
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false,
      },
      { status: 500 }
    );
  }
}

export async function POST() {
	// Placeholder for creating a new product (admin only)
	return NextResponse.json(
		{ message: "Product creation not implemented" },
		{ status: 501 },
	);
}
