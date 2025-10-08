"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
import { mergeUtmParams, UTMParams } from "@/lib/utils";

interface BuyNowButtonProps {
  product: ApiProduct;
  variant?: ApiProductVariant;
  quantity?: number;
  utmParams?: UTMParams;
  className?: string;
  style?: "default" | "minimal" | "full-width";
  size?: "sm" | "lg";
  disabled?: boolean;
}

/**
 * BuyNowButton:
 * - Progressive enhancement: submits form to server action if Worker iframe is not present
 * - If Worker overlay is available, opens iframe checkout seamlessly
 */
export function BuyNowButton({
  product,
  variant,
  quantity = 1,
  utmParams,
  className,
  style = "default",
  size = "lg",
  disabled = false,
}: BuyNowButtonProps) {
  const mergedUtm = mergeUtmParams(utmParams || {});

  // Normalize product image URL
  const rawImage = variant?.featured_image ?? product.images?.[0];
  const productImage =
    typeof rawImage === "string"
      ? rawImage
      : rawImage && "src" in rawImage
      ? rawImage.src
      : "";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Detect if Worker overlay exists
    const overlay = window.parent.document.getElementById("checkout-overlay");
    if (overlay) {
      e.preventDefault();

      // Build checkout URL (proxied via /p/)
      const checkoutUrl = `/p/checkout?productId=${variant?.id || product.id}&quantity=${quantity}`;

      // Send message to Worker iframe overlay
      window.parent.postMessage(
        {
          type: "checkout",
          checkoutUrl,
          utm: mergedUtm,
          product: {
            product_title: product.title,
            product_image: productImage,
          },
        },
        "*"
      );
    }
    // else: fallback to normal form submission (Next.js server action)
  };

  return (
    <form
      action="/api/buy-now" // your original Next.js server action
      method="POST"
      className={style === "full-width" ? "w-full" : ""}
    >
      <input type="hidden" name="productId" value={variant?.product_id || product.id} />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input type="hidden" name="price" value={variant?.price || product.price} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input type="hidden" name="productImage" value={productImage} />

      {/* UTM Parameters */}
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <Button
        type="submit"
        onClick={handleClick}
        disabled={disabled}
        className={className}
        data-style={style}
        size={size}
      >
        Buy Now
      </Button>
    </form>
  );
}
