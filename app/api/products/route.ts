import { NextResponse } from "next/server";
import { FEATURED_PRODUCTS } from "@/lib/data/products";
import { Product } from "@/lib/types";

type ProductKey = keyof Product;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const vendor = searchParams.get("vendor");
  const limit = Number(searchParams.get("limit")) || 10;
  const page = Number(searchParams.get("page")) || 1;
  const fields = searchParams.get("fields");

  let products: Product[] = FEATURED_PRODUCTS;

  if (search) {
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.body_html.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (vendor) {
    products = products.filter(
      (product) => product.vendor.toLowerCase() === vendor.toLowerCase()
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const totalPages = Math.ceil(products.length / limit);

  let formattedProducts: Record<string, unknown>[] = paginatedProducts;
  if (fields) {
    const selectedFields = fields
      .split(",")
      .map((field) => field.trim()) as ProductKey[];
    formattedProducts = paginatedProducts.map((product) => {
      const newProduct: Record<string, unknown> = {};
      selectedFields.forEach((field) => {
        const value = product[field as ProductKey];
        if (value !== undefined) {
          newProduct[field] = value;
        }
      });
      return newProduct;
    });
  }

  return NextResponse.json({
    data: formattedProducts as Partial<Product>[],
    page,
    limit,
    totalPages,
    totalProducts: products.length,
  });
}
