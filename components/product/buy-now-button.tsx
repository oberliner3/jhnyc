"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { toast } from "sonner";
import { buyNowAction } from "@/lib/actions";
import { mergeUtmParams } from "@/lib/utils";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string;
  style?: "default" | "minimal" | "full-width";
  size?: "sm" | "lg";
  utmParams?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
  style = "default",
  size = "lg",
  utmParams,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const mergedUtm = mergeUtmParams(utmParams);

  const handleError = (error?: unknown) => {
    setIsLoading(false);
    toast.dismiss("buy-now-processing");
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error("Failed to process order", {
      description: errorMessage,
    });
  };

  const handleSuccess = () => {
    setIsLoading(false);
    toast.dismiss("buy-now-processing");
    toast.success("Added to checkout", {
      description: `${product.title} is ready in the checkout flow`,
    });
  };

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    toast.loading("Processing your order...", {
      id: "buy-now-processing",
      description: `Adding ${product.title} to checkout`,
    });

    try {
      await buyNowAction(formData);
      handleSuccess();
    } catch (error) {
      handleError(error);
    }
  };

  const variantMap = {
    default: "buy-now-default",
    minimal: "buy-now-minimal",
    "full-width": "buy-now-full",
  } as const;

  return (
    <form
      action={handleAction}
      className={style === "full-width" ? "w-full" : ""}
    >
      <input
        type="hidden"
        name="productId"
        value={variant?.product_id || product.id}
      />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input
        type="hidden"
        name="price"
        value={variant?.price || product.price}
      />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input
        type="hidden"
        name="productImage"
        value={variant?.featured_image || product.images?.[0]?.src || ""}
      />

      {/* UTM Parameters */}
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <Button
        type="submit"
        disabled={isLoading || !product.in_stock || !variant}
        variant={variantMap[style]}
        className={className}
        size={size}
        data-style={style}
      >
        {isLoading ? (
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 w-4 h-4" />
        )}
        {isLoading ? "Processing..." : "Buy Now"}
      </Button>
    </form>
  );
}
