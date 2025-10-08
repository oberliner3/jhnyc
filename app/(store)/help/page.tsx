import {
  CreditCard,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  RotateCcw,
  Search,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Help Center | Customer Support",
  description:
    "Find help and support resources for your orders, account, and shopping experience.",
};
export const dynamic = "force-dynamic";
const contactMethods = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support team",
    details: "Available Mon-Fri 9AM-6PM PST",
    action: "Start Chat",
    actionType: "primary",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message",
    details: "We respond within 24 hours",
    action: "Send Email",
    actionType: "outline",
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our team",
    details: "(970) 710-6334",
    action: "Call Now",
    actionType: "outline",
  },
];

const quickHelp = [
  {
    icon: Truck,
    title: "Track Your Order",
    description: "Check the status and location of your shipment",
    link: "/track-order",
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    description: "Start a return or exchange process",
    link: "/returns-exchange",
  },
  {
    icon: CreditCard,
    title: "Billing & Payments",
    description: "Manage your payment methods and billing",
    link: "/account/billing",
  },
  {
    icon: FileText,
    title: "Order History",
    description: "View your past orders and receipts",
    link: "/account/orders",
  },
];

const popularTopics = [
  {
    title: "How do I track my order?",
    description: "Learn how to find tracking information for your shipment",
    link: "/faq#tracking",
  },
  {
    title: "What is your return policy?",
    description: "Understand our 30-day return policy and process",
    link: "/refund-policy",
  },
  {
    title: "How can I change my order?",
    description: "Modify or cancel your order before it ships",
    link: "/policies/order-cancellation",
  },
  {
    title: "Payment methods accepted",
    description: "View all accepted payment options and security info",
    link: "/policies/secure-payment",
  },
  {
    title: "Shipping information",
    description: "Delivery times, costs, and shipping options",
    link: "/shipping-delivery",
  },
  {
    title: "Account management",
    description: "Manage your profile, addresses, and preferences",
    link: "/account",
  },
];

export default function HelpPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto px-4 py-8 container">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-bold text-4xl">Help Center</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Find answers to your questions and get the support you need for a
            great shopping experience.
          </p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-12 max-w-2xl">
          <div className="relative">
            <Search className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
            <Input
              type="text"
              placeholder="Search help articles..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Help */}
        <div className="mb-16">
          <h2 className="mb-8 font-bold text-2xl text-center">Quick Help</h2>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {quickHelp.map((item) => (
              <Card
                key={`quick-help-${item.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="text-center">
                  <div className="bg-primary/10 mx-auto mb-4 p-3 rounded-full w-fit">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4 text-muted-foreground text-sm">
                    {item.description}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href={item.link}>Get Started</a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Methods */}
        <div className="mb-16">
          <h2 className="mb-8 font-bold text-2xl text-center">
            Contact Support
          </h2>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-3 mx-auto max-w-4xl">
            {contactMethods.map((method) => (
              <Card
                key={`contact-${method.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                <CardHeader className="text-center">
                  <div className="bg-primary/10 mx-auto mb-4 p-3 rounded-full w-fit">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <p className="text-muted-foreground">{method.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4 text-muted-foreground text-sm">
                    {method.details}
                  </p>
                  <Button
                    variant={method.actionType as "default" | "outline"}
                    className="w-full"
                  >
                    {method.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-16">
          <h2 className="mb-8 font-bold text-2xl text-center">
            Popular Help Topics
          </h2>
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2 mx-auto max-w-4xl">
            {popularTopics.map((topic) => (
              <Card
                key={`topic-${topic.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">
                    <a
                      href={topic.link}
                      className="text-primary hover:underline"
                    >
                      {topic.title}
                    </a>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {topic.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Link */}
        <div className="bg-muted/50 p-8 rounded-lg text-center">
          <h2 className="mb-4 font-bold text-2xl">Still Need Help?</h2>
          <p className="mb-6 text-muted-foreground">
            Browse our comprehensive FAQ section or contact our support team
            directly.
          </p>
          <div className="space-x-4">
            <Button asChild>
              <a href="/faq">Browse FAQ</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </div>

        {/* Business Hours */}
        <div className="mt-12 text-center">
          <h3 className="mb-2 font-semibold text-lg">Support Hours</h3>
          <p className="text-muted-foreground">
            Monday - Friday: 9:00 AM - 6:00 PM PST
            <br />
            Saturday - Sunday: 10:00 AM - 4:00 PM PST
          </p>
        </div>
      </div>
    </div>
  );
}
