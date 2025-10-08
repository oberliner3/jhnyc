"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ApiProduct, ApiProductImage, ApiProductVariant } from "@/lib/types";
import { buyNowAction } from "@/lib/buy-now-actions";
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

  // Normalize product image to a URL string
  const rawImage: unknown = variant?.featured_image ?? product.images?.[0] ?? "";
  const productImageUrl =
    typeof rawImage === "string"
      ? rawImage
      : rawImage && typeof (rawImage as ApiProductImage).src === "string"
      ? (rawImage as ApiProductImage).src
      : "";

  const variantMap = {
    default: "buy-now-default",
    minimal: "buy-now-minimal",
    "full-width": "buy-now-full",
  } as const;

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build message for Worker iframe
    const message = {
      type: "checkout",
      checkoutUrl: "/p/checkout",
      utm: {
        utm_source: formData.get("utm_source"),
        utm_medium: formData.get("utm_medium"),
        utm_campaign: formData.get("utm_campaign"),
      },
      product: {
        product_title: formData.get("productTitle"),
        product_image: formData.get("productImage"),
      },
      formData: Object.fromEntries(formData.entries()),
    };

    // Post message to parent iframe
    if (window.parent) {
      window.parent.postMessage(message, "*");
    }
    // DO NOT prevent default — allow Next.js Server Action to handle it as well
  }

  function SubmitButton() {
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
        {pending ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <ShoppingBag className="mr-2 w-4 h-4" />}
        {pending ? "Processing..." : "Buy Now"}
      </Button>
    );
  }

  return (
    <form
      action={buyNowAction}
      className={style === "full-width" ? "w-full" : ""}
      onSubmit={handleFormSubmit} // <-- intercept for Worker
    >
      <input type="hidden" name="productId" value={variant?.product_id || product.id} />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input type="hidden" name="price" value={variant?.price || product.price} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input type="hidden" name="productImage" value={productImageUrl} />

      {/* UTM Parameters */}
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <SubmitButton />
    </form>
  );
}
