import { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateSEO } from "@/lib/seo";
import { FEATURED_PRODUCTS } from "@/lib/data/products";
import { ProductDetails } from "./product-details";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return FEATURED_PRODUCTS.map((product) => ({
    slug: product.handle,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = FEATURED_PRODUCTS.find((p) => p.handle === params.slug);

  if (!product) {
    return generateSEO({ title: "Product Not Found" });
  }

  return generateSEO({
    title: product.name,
    description: product.body_html,
    path: `/products/${product.handle}`,
    type: "product",
    image: product.images[0].src,
  });
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = params;

  // The product data will be fetched on the client in ProductDetails
  // We can still check for the existence of the slug for a quick 404
  const productExists = FEATURED_PRODUCTS.some((p) => p.handle === slug);

  if (!productExists) {
    notFound();
  }

  return (
    <div className="px-4 py-8 container">
      <ProductDetails slug={slug} />
    </div>
  );
}
