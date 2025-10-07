import type { Metadata } from "next";
import {
  ArticleHeader,
  ArticleSection,
  ArticleWrapper,
  UnorderdList,
} from "@/components/common/static-page";
import { APP_CONTACTS } from "@/lib/constants";
import { generateSEO } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Shipping & Delivery",
  description:
    "Information about our shipping methods, costs, and delivery times.",
  path: "/shipping-delivery",
});
export const dynamic = "force-dynamic";
export default function ShippingDeliveryPage() {
  const shippingMethodCost: string[] = [
    "Standard Shipping (3-7 business days): $5.99 (Free for orders over $50)",
    "Expedited Shipping (2-3 business days): $12.99",
    "Priority Shipping (1-2 business days): $24.99",
  ];
  return (
    <ArticleWrapper>
      <ArticleHeader
        title="Shipping & Delivery"
        lastUpdate="September 21, 2024"
      />
      <ArticleSection
        title="Shipping Methods & Costs"
        first={
          "We offer several shipping options to meet your needs. Shipping costs are calculated at checkout based on your order total and selected shipping method."
        }
      >
        <UnorderdList items={shippingMethodCost} />
      </ArticleSection>
      <ArticleSection
        title={"Delivery Times"}
        first={
          "Delivery times are estimates and begin from the date of shipment, not the date of order. Orders are typically processed within 1-2 business days."
        }
      />
      <ArticleSection
        title={"International Shipping"}
        first={
          "We currently do not offer international shipping. We hope to expand our shipping options in the future."
        }
      />

      <ArticleSection
        title={"Order Tracking"}
        first={
          "Once your order has shipped, you will receive a shipping confirmation email with a tracking number. You can use this number to track your order&apos;s progress."
        }
      />

      <ArticleSection
        title={"Contact Us"}
        first={`If you have any questions about shipping or delivery, please contact us at ${APP_CONTACTS.email.shipping}.`}
      />
    </ArticleWrapper>
  );
}
