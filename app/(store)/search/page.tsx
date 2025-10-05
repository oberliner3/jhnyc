"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product/product-card";
import { searchProducts } from "@/lib/data/products";
import type { ApiProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getSearchResults(query: string): Promise<ApiProduct[]> {
  // Query Cosmos directly and map to internal Product type
  const apiProducts = await searchProducts(query, { limit: 20, page: 1 });
  return apiProducts;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");

  const {
    data: products,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => getSearchResults(query || ""),
    enabled: !!query,
  });

  if (!query) {
    return <div className="py-12 text-center">Please enter a search term.</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading search results.</div>;
  }

  return (
    <div className="px-4 py-8 container">
      <h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
        Search Results for &quot;{query}&quot;
      </h1>
      {products && products.length > 0 ? (
        <div className="gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">No products found.</div>
      )}
    </div>
  );
}
