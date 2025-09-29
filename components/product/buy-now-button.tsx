"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { toast } from "sonner";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string;
}

function createDefaultVariant(product: ApiProduct): ApiProductVariant {
  const firstVariant = product.variants?.[0];
  return {
    id: firstVariant?.id || product.id,
    product_id: product.id,
    title: firstVariant?.title || "Default Title",
    price: product.price,
    sku: firstVariant?.sku || "",
    grams: firstVariant?.grams || 0,
    featured_image: product.images?.[0]?.src,
    available: product.in_stock,
    requires_shipping: firstVariant?.requires_shipping ?? true,
    taxable: firstVariant?.taxable ?? true,
    compare_at_price: product.compare_at_price,
    position: 1,
    created_at: product.created_at,
    updated_at: product.updated_at,
  };
}

function hasMultipleRealVariants(product: ApiProduct): boolean {
  const variants = product.variants || [];
  // Treat multiple variants with non-default titles as "real" variants
  const nonDefault = variants.filter(
    (v) => (v.title || "").toLowerCase() !== "default title"
  );
  return nonDefault.length > 1;
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP) {
      toast.error("Shopify integration not configured");
      return;
    }

    // UX guard: require explicit selection only when the product has multiple real variants
    if (hasMultipleRealVariants(product) && !variant) {
      toast.error("Please select a product variant");
      return;
    }

    setIsLoading(true);

    try {
      const selectedVariant = variant || product.variants?.[0] || createDefaultVariant(product);

      const formData = new FormData();
      formData.append("productId", selectedVariant.product_id);
      formData.append("variantId", selectedVariant.id);
      formData.append("price", selectedVariant.price.toString());
      formData.append("quantity", quantity.toString());
      formData.append("productTitle", product.title);
      formData.append("productImage", product.images?.[0]?.src || "");

      const response = await fetch("/api/buy-now", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.invoiceUrl) {
        window.location.href = data.invoiceUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout");
      }
    } catch (error) {
      console.error("Buy now error:", error);
      toast.error("Failed to initiate checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading || !product.in_stock}
      className={className}
      size="lg"
    >
      <ShoppingBag className="mr-2 w-4 h-4" />
      {isLoading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
