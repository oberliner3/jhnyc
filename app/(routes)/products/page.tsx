// biome-ignore assist/source/organizeImports: <>
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/product-card";
import { generateSEO } from "@/lib/seo";
import { getAllProducts, mapApiToProduct } from "@/lib/api";

export const revalidate = 60; // ISR: revalidate this page every 60 seconds

export const metadata: Metadata = generateSEO({
  title: "Products",
  description:
    "Browse our complete collection of premium products. Find everything you need from electronics to fashion and lifestyle items.",
  path: "/products",
});

export default async function ProductsPage() {
  // Fetch from Cosmos API (server-side)
  const apiProducts = await getAllProducts({ limit: 24 });
  const products = apiProducts.map(mapApiToProduct);

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

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
