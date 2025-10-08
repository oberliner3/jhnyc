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

  async function handleSubmit(formData: FormData) {
    console.log('[BuyNow] Form submitted');
    
    // Call server action
    const invoiceUrl = await buyNowAction(formData);
    console.log('[BuyNow] Invoice URL received:', invoiceUrl);

    // Check if we're in an iframe
    const isInIframe = window.self !== window.top;
    console.log('[BuyNow] Running in iframe:', isInIframe);

    if (isInIframe) {
      // Send message to parent window (vohovintage.shop)
      const message = {
        type: "checkout",
        checkoutUrl: invoiceUrl,
        utm: mergedUtm,
        product: {
          product_title: formData.get("productTitle"),
          product_image: formData.get("productImage"),
        },
      };
      
      console.log('[BuyNow] Sending message to parent:', message);
      
      window.parent.postMessage(
        message,
        "https://www.vohovintage.shop"
      );
    } else {
      // Not in iframe, redirect directly
      console.log('[BuyNow] Not in iframe, redirecting to:', invoiceUrl);
      window.location.href = invoiceUrl;
    }
  }

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button
        type="submit"
        disabled={disabled || pending}
        variant={variantMap[style]}
        className={className}
        size={size}
      >
        {pending ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : <ShoppingBag className="mr-2 w-4 h-4" />}
        {pending ? "Processing..." : "Buy Now"}
      </Button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className={style === "full-width" ? "w-full" : ""}
    >
      <input type="hidden" name="productId" value={variant?.product_id || product.id} />
      <input type="hidden" name="variantId" value={variant?.id || ""} />
      <input type="hidden" name="price" value={variant?.price || product.price} />
      <input type="hidden" name="quantity" value={quantity} />
      <input type="hidden" name="productTitle" value={product.title} />
      <input type="hidden" name="productImage" value={productImageUrl} />

      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <SubmitButton />
    </form>
  );
}