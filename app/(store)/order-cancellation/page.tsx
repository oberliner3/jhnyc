import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Cancellation Policy",
  description: "Learn about our order cancellation policies and procedures.",
};

export const dynamic = "force-dynamic";

export default function OrderCancellationPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-bold text-4xl">
              Order Cancellation Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 1, 2025
            </p>
          </div>

          {/* Content */}
          <div className="max-w-none prose prose-gray">
            <h2>When You Can Cancel</h2>
            <p>
              You may cancel your order within <strong>1 hour</strong> of
              placing it, provided the order has not yet been processed or
              shipped. After this window, cancellation may not be possible.
            </p>

            <h2>How to Cancel Your Order</h2>
            <h3>Online Cancellation</h3>
            <p>
              If you have an account, you can cancel your order through your
              account dashboard:
            </p>
            <ol>
              <li>Log into your account</li>
              <li>Go to &quot;Order History&quot;</li>
              <li>Find your recent order</li>
              <li>Click &quot;Cancel Order&quot; if available</li>
            </ol>

            <h3>Contact Customer Service</h3>
            <p>
              If online cancellation is not available, please contact our
              customer service team immediately:
            </p>
            <ul>
              <li>
                Email:{" "}
                <a
                  href="mailto:support@example.com"
                  className="text-primary hover:underline"
                >
                  support@example.com
                </a>
              </li>
              <li>Phone: (970) 710-6334</li>
              <li>Live Chat: Available on our website during business hours</li>
            </ul>

            <h2>Order Processing Status</h2>
            <h3>Order Placed</h3>
            <p>
              Your order has been received and is being reviewed. Cancellation
              is typically possible at this stage.
            </p>

            <h3>Processing</h3>
            <p>
              Your order is being prepared for shipment. Cancellation may still
              be possible but should be requested immediately.
            </p>

            <h3>Shipped</h3>
            <p>
              Once your order has shipped, it cannot be cancelled. However, you
              may return the items according to our{" "}
              <a href="/refund-policy" className="text-primary hover:underline">
                Return Policy
              </a>
              once you receive them.
            </p>

            <h2>Cancellation Fees</h2>
            <p>
              There are no fees for cancelling orders within the allowed
              timeframe. However, if custom or personalized items have already
              been produced, cancellation may not be possible or may incur a
              restocking fee.
            </p>

            <h2>Refunds for Cancelled Orders</h2>
            <p>
              If your order is successfully cancelled, we will issue a full
              refund to your original payment method within 5-7 business days.
              You will receive a confirmation email once the refund has been
              processed.
            </p>

            <h2>Special Circumstances</h2>
            <h3>Pre-order Items</h3>
            <p>
              Pre-order items can typically be cancelled until 48 hours before
              the expected ship date.
            </p>

            <h3>Custom Orders</h3>
            <p>
              Custom or personalized orders cannot be cancelled once production
              has begun. The cancellation window for custom orders is 2 hours
              after placing the order.
            </p>

            <h3>Gift Orders</h3>
            <p>
              Gift orders follow the same cancellation policy. The person who
              placed the order is responsible for any cancellation requests.
            </p>

            <h2>What Happens After Cancellation</h2>
            <p>Once your order is cancelled:</p>
            <ul>
              <li>You will receive a cancellation confirmation email</li>
              <li>Your payment will be refunded within 5-7 business days</li>
              <li>
                Any promotional codes used will be restored to your account if
                still valid
              </li>
              <li>
                Loyalty points or rewards earned from the order will be deducted
              </li>
            </ul>

            <h2>Need Help?</h2>
            <p>
              If you have questions about our cancellation policy or need
              assistance with a specific order, please don&apos;t hesitate to
              contact our customer service team. We&apos;re here to help make
              your shopping experience as smooth as possible.
            </p>

            <p>
              <a href="/contact" className="text-primary hover:underline">
                Contact Customer Service
              </a>{" "}
              |
              <a href="/faq" className="ml-2 text-primary hover:underline">
                View FAQ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
