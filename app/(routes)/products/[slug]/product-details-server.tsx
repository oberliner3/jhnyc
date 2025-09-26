import { getProductByHandle, mapApiToProduct } from "@/lib/api";
import { ProductDetailsClient } from "./product-details-client";

interface ProductDetailsServerProps {
  slug: string;
}

export async function ProductDetailsServer({ slug }: ProductDetailsServerProps) {
  const apiProduct = await getProductByHandle(slug);
  const product = mapApiToProduct(apiProduct);

  return <ProductDetailsClient product={product} />;
}
