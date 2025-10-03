import type { Metadata } from "next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Frequently Asked Questions | FAQ",
  description:
    "Find answers to common questions about orders, shipping, returns, and more.",
};

const faqs = [
  {
    category: "Orders",
    questions: [
      {
        question: "How do I place an order?",
        answer:
          "You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. Follow the prompts to enter your shipping and payment information.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "Orders can be modified or cancelled within 1 hour of placement. After that, please contact our customer service team for assistance.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can also track your order from your account dashboard.",
      },
    ],
  },
  {
    category: "Shipping",
    questions: [
      {
        question: "What are your shipping options?",
        answer:
          "We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Shipping costs vary by location and order size.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we ship within the United States. International shipping may be available for select products - please contact us for more information.",
      },
      {
        question: "When will my order ship?",
        answer:
          "Orders are typically processed and shipped within 1-2 business days. You'll receive a confirmation email once your order ships.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Some restrictions may apply.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Visit our returns page to initiate a return. You'll receive a prepaid return label and instructions for packaging your return.",
      },
      {
        question: "How long does it take to process a refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive your returned item. You'll receive an email confirmation once processed.",
      },
    ],
  },
  {
    category: "Account & Payment",
    questions: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and view order history.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, we use SSL encryption and secure payment processing to protect your information. We never store your credit card details on our servers.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Find answers to common questions about orders, shipping, returns,
            and more.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8 mx-auto max-w-4xl">
          {faqs.map((category) => (
            <Card
              key={`category-${category.category
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq) => (
                    <AccordionItem
                      key={`faq-${faq.question
                        .substring(0, 30)
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")}`}
                      value={`item-${category.category
                        .toLowerCase()
                        .replace(/\s+/g, "-")}-${faq.question
                        .substring(0, 20)
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-muted/50 mt-16 p-8 rounded-lg text-center">
          <h2 className="mb-4 font-semibold text-2xl">Still have questions?</h2>
          <p className="mb-6 text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Our customer service
            team is here to help.
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="inline-block bg-primary hover:bg-primary/90 px-6 py-2 rounded-md text-primary-foreground transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@example.com"
              className="inline-block bg-background hover:bg-accent px-6 py-2 border border-input rounded-md transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
