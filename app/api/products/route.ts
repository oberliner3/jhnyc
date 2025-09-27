import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const vendor = searchParams.get("vendor");
  const limit = Number(searchParams.get("limit")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const fields = searchParams.get("fields"); // Comma-separated fields

  let query = supabase.from("products").select(fields || "*");

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (vendor) {
    query = query.eq("vendor", vendor);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;
  query = query.range(startIndex, endIndex);

  const { data: products, error } = await query;

  if (error) {
    console.error("[API] Failed to fetch products from Supabase:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }

  // For pagination metadata, we'd ideally get the total count without the limit/range
  // Supabase has a .count() method, but it requires a separate query or a specific header.
  // For simplicity, we'll omit totalPages/totalProducts for now or assume a max limit.
  return NextResponse.json({
    products,
    page,
    limit,
  });
}

export async function POST() {
  // Placeholder for creating a new product (admin only)
  return NextResponse.json({ message: "Product creation not implemented" }, { status: 501 });
}
