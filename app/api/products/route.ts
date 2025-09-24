import { NextResponse } from "next/server";
import { getAllProducts, getProductsByVendor, searchProducts } from "@/lib/api";
import type { ApiProduct } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const vendor = searchParams.get("vendor");
  const limit = Number(searchParams.get("limit")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const fields = searchParams.get("fields") ?? undefined;

  try {
    let products: ApiProduct[] = [];

    if (search && search.length > 0) {
      products = await searchProducts(search);
    } else if (vendor && vendor.length > 0) {
      products = await getProductsByVendor(vendor);
    } else {
      products = await getAllProducts({ limit, page, fields });
    }

    // When using search/vendor endpoints, we may not have server-side pagination.
    // Keep the response shape stable for clients.
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      data: products,
      page,
      limit,
      totalPages,
      totalProducts,
    });
  } catch (error) {
    console.error("[API] Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
