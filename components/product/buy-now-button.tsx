"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductImage, ApiProductVariant } from "@/lib/types";
import { buyNowAction } from "@/lib/actions";
import { mergeUtmParams, UTMParams } from "@/lib/utils";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  className?: string;
  style?: "default" | "minimal" | "full-width";
  size?: "sm" | "lg";
  utmParams?: UTMParams;
  disabled?: boolean;
}

export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  className,
  style = "default",
  size = "lg",
  utmParams,
  disabled = false,
}: BuyNowButtonProps) {
  const mergedUtm = mergeUtmParams({ ...utmParams });

  // Normalize product image to a URL string (avoid [object Object])
  const rawImage: unknown =
    variant?.featured_image ?? product.images?.[0] ?? "";
  const productImageUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage && typeof (rawImage as ApiProductImage).src === "string"
      ? (rawImage as ApiProductImage).src
      : "";

  // Use a nested submit component so Next.js can handle redirects from server actions
  function Submit() {
    const { pending } = useFormStatus();
    const isDisabled = disabled || pending;
    return (
      <Button
        type="submit"
        disabled={isDisabled}
        variant={variantMap[style]}
        className={className}
        size={size}
        data-style={style}
      >
        {pending ? (
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
        ) : (
          <ShoppingBag className="mr-2 w-4 h-4" />
        )}
        {pending ? "Processing..." : "Buy Now"}
      </Button>
    );
  }

  const variantMap = {
    default: "buy-now-default",
    minimal: "buy-now-minimal",
    "full-width": "buy-now-full",
  } as const;

  return (
    <form
      action={buyNowAction}
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
      <input type="hidden" name="productImage" value={productImageUrl} />

      {/* UTM Parameters */}
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <Submit />
    </form>
  );
}
