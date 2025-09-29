import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetailsSkeleton } from "@/components/skeletons/product-details-skeleton";
import { getAllProducts, getProductByHandle } from "@/lib/api";
import { ProductDetailsClient } from "./product-details-client";
import { ProductProvider } from "@/contexts/product-context";
import { SITE_CONFIG } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
import { ProductSchema } from "@/components/common/product-schema";
import notFound from "@/app/not-found";

export const revalidate = 60;

interface ProductPageProps {
  params: { handle: string };
}

export async function generateStaticParams() {
  try {
    const products = await getAllProducts({ limit: 100 });
    return products.filter((p) => p.handle).map((p) => ({ handle: p.handle }));
  } catch {
    return [] as { handle: string }[];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const product = await getProductByHandle(params.handle);

    if (!product) {
      return generateSEO({ title: "Product Not Found" });
    }

    const seoImage = product.images?.[0]?.src || SITE_CONFIG.ogImage;

    return generateSEO({
      title: product.title || "",
      description: product.body_html || "",
      path: `/products/${product.handle || params.handle}`,
      type: "product",
      image: seoImage,
    });
  } catch {
    return generateSEO({ title: "Product Not Found" });
  }
}

async function ProductPageContent({ handle }: { handle: string }) {
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductSchema product={product!} />
      <ProductProvider initialProduct={product}>
        <ProductDetailsClient product={product!} />
      </ProductProvider>
    </>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const { handle } = params;

  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductPageContent handle={handle} />
    </Suspense>
  );
}
