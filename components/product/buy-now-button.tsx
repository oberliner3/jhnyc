"use client";

import React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductVariant } from "@/lib/types";
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
  utmParams,
  className,
  style = "default",
  size = "lg",
  disabled = false,
}: BuyNowButtonProps) {
  const mergedUtm = mergeUtmParams({ ...utmParams });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Construct URL for the buy now action via /p/ proxy
    const formData = new FormData();
    formData.set("productId", variant?.product_id || product.id);
    formData.set("variantId", variant?.id || "");
    formData.set("quantity", String(quantity));

    formData.set("price", String(variant?.price ?? product.price));

    formData.set("productTitle", product.title);
    formData.set(
      "productImage",
      (variant?.featured_image ?? product.images?.[0]?.src) || ""
    );

    // UTM tracking
    formData.set("utm_source", mergedUtm.utm_source || "");
    formData.set("utm_medium", mergedUtm.utm_medium || "");
    formData.set("utm_campaign", mergedUtm.utm_campaign || "");

    // Build query string to call the Worker `/p/checkout` which proxies buyNowAction
    const params = new URLSearchParams();
    formData.forEach((value, key) => params.append(key, String(value)));

    // Use top-level window to trigger overlay/iframe if Worker supports it
    if (window.parent) {
      window.parent.postMessage(
        {
          type: "checkout",
          checkoutUrl: `/p/checkout?${params.toString()}`,
          utm: mergedUtm,
          product: {
            product_title: product.title,
            product_image:
              (variant?.featured_image ?? product.images?.[0]?.src) || "",
          },
        },
        "*"
      );
    }
  };

  const variantMap = {
    default: "buy-now-default",
    minimal: "buy-now-minimal",
    "full-width": "buy-now-full",
  } as const;

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant={variantMap[style]}
      className={className}
      size={size}
      data-style={style}
    >
      <ShoppingBag className="mr-2 w-4 h-4" />
      Buy Now
    </Button>
  );
}
