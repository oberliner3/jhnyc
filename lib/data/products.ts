import type { ApiProduct } from "@/lib/types";
import { getAllProducts, mapApiToProduct } from "@/lib/api";

// Fetch first 5 products from the API
export async function getFeaturedProducts(): Promise<ApiProduct[]> {
  try {
    const apiProducts = await getAllProducts({ limit: 5 });
    return apiProducts.map(mapApiToProduct);
  } catch (error) {
    console.error("Failed to fetch featured products:", error);
    return [];
  }
}

// For backward compatibility, keep the constant but make it a Promise
// This will be used in server components with await
// In client components, use the useQuery hook with getFeaturedProducts
export const FEATURED_PRODUCTS = getFeaturedProducts();
