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

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    if (!process.env.SHOPIFY_SHOP) {
      toast.error("Shopify integration not configured");
      return;
    }

    setIsLoading(true);

    try {
      const selectedVariant = variant || product.variants?.[0];

      if (!selectedVariant) {
        toast.error("Please select a product variant");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("productId", product.id);
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
