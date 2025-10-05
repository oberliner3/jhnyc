"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type { ApiProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Fetch products from API route
 */
async function fetchProducts(
  page: number,
  limit: number = 24
): Promise<ApiProduct[]> {
  const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await response.json();
  return data.products || [];
}

function ProductsList() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchProducts(1, 24)
      .then((initialProducts) => {
        setProducts(initialProducts);
        if (initialProducts.length < 24) {
          setHasMore(false);
        }
      })
      .catch((error) => {
        console.error("Error loading products:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newProducts = await fetchProducts(nextPage, 24);
      if (newProducts.length > 0) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
        setPage(nextPage);
        if (newProducts.length < 24) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-8 text-center">
          <Button onClick={loadMore}>Load More</Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="px-4 py-8 container">
      <div className="mb-8">
        <h1 className="mb-4 font-bold text-3xl lg:text-4xl tracking-tight">
          All Products
        </h1>
        <p className="text-muted-foreground">
          Discover our complete collection of premium products
        </p>
      </div>

      <ProductsList />
    </div>
  );
}
