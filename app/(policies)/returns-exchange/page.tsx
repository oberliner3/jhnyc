import type { Metadata } from "next";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Returns & Exchange",
  description: "Information about our return and exchange policy.",
  path: "/returns-exchange",
});
export const dynamic = "force-dynamic";

export default function ReturnsExchangePage() {
  return (
    <div className="px-4 py-8 container">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
          Returns & Exchange Policy
        </h1>

        <div className="space-y-8 max-w-none prose prose-lg">
          <p className="text-muted-foreground">Last updated: May 29, 2025</p>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Our Return Policy</h2>
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you
              are not satisfied for any reason, you may return eligible items
              within 30 days of delivery for a full refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Eligibility for Returns</h2>
            <ul className="space-y-2 pl-6 text-muted-foreground list-disc">
              <li>
                Items must be unused, in their original condition, and with all
                tags attached.
              </li>
              <li>Original packaging must be intact.</li>
              <li>Proof of purchase is required.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">
              How to Initiate a Return or Exchange
            </h2>
            <p className="text-muted-foreground">
              To initiate a return or exchange, please contact our customer
              service team at {APP_CONTACTS.email.getInTouch}
              with your order number and reason for return. We will provide you
              with instructions and a return shipping label.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Refunds</h2>
            <p className="text-muted-foreground">
              Once your return is received and inspected, we will send you an
              email to notify you that we have received your returned item. We
              will also notify you of the approval or rejection of your refund.
              If approved, your refund will be processed, and a credit will
              automatically be applied to your original method of payment,
              within a certain amount of days.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Exchanges</h2>
            <p className="text-muted-foreground">
              If you need to exchange an item for a different size or color,
              please contact us. We will guide you through the exchange process.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our Returns & Exchange Policy,
              please contact us at {APP_CONTACTS.email.getInTouch}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
