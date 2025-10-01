import type { Metadata } from "next";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Refund Policy",
  description:
    "Read our refund policy to understand our process for returns and refunds.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <div className="px-4 py-8 container">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
          Refund Policy
        </h1>

        <div className="space-y-8 max-w-none prose prose-lg">
          <p className="text-muted-foreground">Last updated: May 29, 2025</p>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Returns</h2>
            <p className="text-muted-foreground">
              Our policy lasts 30 days. If 30 days have gone by since your
              purchase, unfortunately we can’t offer you a refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Refunds</h2>
            <p className="text-muted-foreground">
              Once your return is received and inspected, we will send you an
              email to notify you that we have received your returned item. We
              will also notify you of the approval or rejection of your refund.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-bold text-2xl">Contact Information</h2>
            <p className="text-muted-foreground">
              Questions about the Refund Policy should be sent to us at{" "}
              {APP_CONTACTS.email.support}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
