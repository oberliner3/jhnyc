"use client";

import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkoutCartAction } from "@/lib/buy-now-actions";
import { ClientCartItem } from "@/lib/types";
import { UTMParams } from "@/lib/utils";

interface CartCheckoutButtonProps {
  cartItems: ClientCartItem[];
  utmParams?: UTMParams;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
}

export function CartCheckoutButton({
  cartItems,
  utmParams,
  disabled = false,
  onSuccess,
  className,
}: CartCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCheckout() {
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Please add items before checkout.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("[Cart] Starting checkout for", cartItems.length, "items");

      // Call server action to create draft order
      const invoiceUrl = await checkoutCartAction(cartItems, {
        source: utmParams?.utm_source || "cart",
        medium: utmParams?.utm_medium || "checkout",
        campaign: utmParams?.utm_campaign || "cart-checkout",
      });

      console.log("[Cart] Invoice URL received:", invoiceUrl);

      // Check if we're in an iframe
      const isInIframe = window.self !== window.top;

      if (isInIframe) {
        console.log("[Cart] In iframe - redirecting parent window directly");

        // Redirect the top/parent window directly to checkout
        try {
          window.top!.location.href = invoiceUrl;
        } catch (e) {
          // Fallback if top window access is blocked
          console.warn("[Cart] Cannot access top window, trying postMessage");
          window.parent.postMessage(
            {
              type: "checkout",
              checkoutUrl: invoiceUrl,
            },
            "*"
          );
        }

      } else {
        console.log("[Cart] Not in iframe - direct redirect");

        // Direct access - redirect current window
        window.location.href = invoiceUrl;
      }

      // Call success callback if provided
      onSuccess?.();

    } catch (error) {
      console.error("[Cart] Checkout error:", error);
      
      // Show user-friendly error
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process checkout. Please try again."
      );
      
      setIsLoading(false);
    }
  }

  const itemCount = cartItems.length;
  const isDisabled = disabled || isLoading || itemCount === 0;

  return (
    <Button
      onClick={handleCheckout}
      disabled={isDisabled}
      className={className}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 w-4 h-4" />
          Checkout {itemCount > 0 && `(${itemCount})`}
        </>
      )}
    </Button>
  );
}