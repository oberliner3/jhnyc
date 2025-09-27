import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSEO } from "@/lib/seo";
import { getAllProducts, getProductByHandle } from "@/lib/api";
import { ProductDetailsServer } from "./product-details-server";

export const revalidate = 60; // ISR: revalidate product detail pages every 60 seconds

interface ProductPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  // Prebuild a set of product pages using Cosmos API
  // Limit to a reasonable number to keep build fast
  try {
    const products = await getAllProducts({ limit: 100, fields: "handle" });
    return products.filter((p) => p.handle).map((p) => ({ slug: p.handle }));
  } catch {
    // On failure, return empty list; pages will be generated on-demand
    return [] as { slug: string }[];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProductByHandle(params.slug);
    return generateSEO({
      title: product.title,
      description: product.body_html,
      path: `/products/${product.handle}`,
      type: "product",
      image: product.images?.[0]?.src,
    });
  } catch {
    return generateSEO({ title: "Product Not Found" });
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;
  // The product data will be fetched on the client in ProductDetails
  // Optionally, we could pre-check existence here by querying the API
  // and calling notFound() if it doesn't exist, but to avoid extra
  // server roundtrip we rely on client fetch + metadata fetch above.

  // If you want strict 404 before rendering, uncomment:
  // try { await getProductByHandle(slug) } catch { notFound() }

  return (
    <div className="px-4 py-8 container">
      <ProductDetailsServer slug={slug} />
    </div>
  );
}
