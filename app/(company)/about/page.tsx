import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";
import { H1, H2, Lead, List, P } from "@/components/ui/typography";

export const metadata: Metadata = generateSEO({
  title: "About Us",
  description:
    "Learn about our mission, values, and commitment to providing exceptional products and service.",
  path: "/about",
});

export const dynamic = "force-dynamic";

export default function AboutPage() {
  return (
    <div className="px-4 py-8 container">
      <div className="mx-auto max-w-4xl">
        <H1 className="mb-8 font-bold text-3xl lg:text-4xl tracking-tight">
          About {SITE_CONFIG.name}
        </H1>

        <div className="max-w-none prose prose-lg">
          <Lead className="mb-8 text-muted-foreground text-xl">
            We&apos;re passionate about bringing you the finest products with
            exceptional quality and unmatched service.
          </Lead>

          <div className="gap-8 grid md:grid-cols-2 mb-12">
            <div>
              <H2 className="mb-4 font-bold text-2xl">Our Mission</H2>
              <P className="text-muted-foreground">
                To curate and deliver premium products that enhance your
                lifestyle while providing an exceptional shopping experience
                built on trust, quality, and customer satisfaction.
              </P>
            </div>
            <div>
              <H2 className="mb-4 font-bold text-2xl">Our Values</H2>
              <List className="space-y-2 text-muted-foreground">
                <li>• Quality craftsmanship in every product</li>
                <li>• Sustainable and ethical sourcing</li>
                <li>• Exceptional customer service</li>
                <li>• Innovation and continuous improvement</li>
              </List>
            </div>
          </div>

          <h2 className="mb-4 font-bold text-2xl">Why Choose Us?</h2>
          <P className="mb-6 text-muted-foreground">
            With over a decade of experience in e-commerce, we understand what
            matters most to our customers. From carefully selected products to
            lightning-fast shipping and hassle-free returns, we&apos;re
            committed to exceeding your expectations at every step.
          </P>
        </div>
      </div>
    </div>
  );
}
