"use client";

import { useFormStatus } from "react-dom";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buyNowAction } from "@/lib/buy-now-actions";
import { mergeUtmParams, UTMParams } from "@/lib/utils";
import { ApiProduct, ApiProductVariant } from "@/lib/types";

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

function SubmitButton({
  disabled,
  className,
}: {
  disabled?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} className={className}>
      {pending ? (
        <>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingBag className="mr-2 w-4 h-4" />
          Buy Now
        </>
      )}
    </Button>
  );
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

  const productImage =
    variant?.featured_image || product.images?.[0]?.src || "";

  async function handleSubmit(formData: FormData) {
    try {
      // Call server action to create draft order
      const invoiceUrl = await buyNowAction(formData);

      console.log("[BuyNow] Invoice URL received:", invoiceUrl);

      // Check if we're in an iframe
      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        console.log("[BuyNow] In iframe - redirecting parent window directly");

        // Redirect the top/parent window directly to checkout
        try {
          window.top!.location.href = invoiceUrl;
        } catch (e) {
          // Fallback if top window access is blocked
          console.warn("[BuyNow] Cannot access top window, trying postMessage");
          window.parent.postMessage(
            {
              type: "checkout",
              checkoutUrl: invoiceUrl,
            },
            "*"
          );
        }
      } else {
        console.log("[BuyNow] Not in iframe - direct redirect");

        // Direct access - redirect current window
        window.location.href = invoiceUrl;
      }
    } catch (error) {
      console.error("[BuyNow] Error:", error);

      // Show error to user
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process checkout. Please try again."
      );
    }
  }

  return (
    <form action={handleSubmit}>
      {/* Hidden fields */}
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
        value={
          productImage
            ? productImage.replace("https://cdn.shopify.com", "https://jhuangnyc.com/cdn")
            : ""
        }
      />
      <input type="hidden" name="utm_source" value={mergedUtm.utm_source} />
      <input type="hidden" name="utm_medium" value={mergedUtm.utm_medium} />
      <input type="hidden" name="utm_campaign" value={mergedUtm.utm_campaign} />

      <SubmitButton disabled={disabled} className={className} />
    </form>
  );
}
