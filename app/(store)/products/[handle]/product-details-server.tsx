import { getProductByHandle } from "@/lib/data/products";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsServerProps {
  slug: string;
}

export async function ProductDetailsServer({
  slug,
}: ProductDetailsServerProps) {
  const product = await getProductByHandle(slug, {
    context: "ssr",
  });

  if (!product) {
    // Handle case where product is not found
    return <div>Product not found.</div>; // Or render a more sophisticated error component
  }

  return <ProductDetailsClient product={product} />;
}
