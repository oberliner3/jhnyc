import { getProductByHandle } from "@/lib/api";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsServerProps {
  slug: string;
}

export async function ProductDetailsServer({ slug }: ProductDetailsServerProps) {
  const product = await getProductByHandle(slug);

  return <ProductDetailsClient product={product} />;
}
