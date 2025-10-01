import { Metadata } from 'next';
import { MessageCircle, Mail, Phone, Search, FileText, CreditCard, Truck, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Help Center | Customer Support',
  description: 'Find help and support resources for your orders, account, and shopping experience.',
};

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    details: 'Available Mon-Fri 9AM-6PM PST',
    action: 'Start Chat',
    actionType: 'primary',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us a detailed message',
    details: 'We respond within 24 hours',
    action: 'Send Email',
    actionType: 'outline',
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak directly with our team',
    details: '(970) 710-6334',
    action: 'Call Now',
    actionType: 'outline',
  },
];

const quickHelp = [
  {
    icon: Truck,
    title: 'Track Your Order',
    description: 'Check the status and location of your shipment',
    link: '/track-order',
  },
  {
    icon: RotateCcw,
    title: 'Returns & Exchanges',
    description: 'Start a return or exchange process',
    link: '/returns-exchange',
  },
  {
    icon: CreditCard,
    title: 'Billing & Payments',
    description: 'Manage your payment methods and billing',
    link: '/account/billing',
  },
  {
    icon: FileText,
    title: 'Order History',
    description: 'View your past orders and receipts',
    link: '/account/orders',
  },
];

const popularTopics = [
  {
    title: 'How do I track my order?',
    description: 'Learn how to find tracking information for your shipment',
    link: '/faq#tracking',
  },
  {
    title: 'What is your return policy?',
    description: 'Understand our 30-day return policy and process',
    link: '/refund-policy',
  },
  {
    title: 'How can I change my order?',
    description: 'Modify or cancel your order before it ships',
    link: '/policies/order-cancellation',
  },
  {
    title: 'Payment methods accepted',
    description: 'View all accepted payment options and security info',
    link: '/policies/secure-payment',
  },
  {
    title: 'Shipping information',
    description: 'Delivery times, costs, and shipping options',
    link: '/shipping-delivery',
  },
  {
    title: 'Account management',
    description: 'Manage your profile, addresses, and preferences',
    link: '/account',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find answers to your questions and get the support you need for a great shopping experience.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search help articles..."
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Help */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickHelp.map((item, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
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
          <h2 className="text-2xl font-bold text-center mb-8">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{method.title}</CardTitle>
                  <p className="text-muted-foreground">{method.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">{method.details}</p>
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
          <h2 className="text-2xl font-bold text-center mb-8">Popular Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {popularTopics.map((topic, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">
                    <a href={topic.link} className="text-primary hover:underline">
                      {topic.title}
                    </a>
                  </h3>
                  <p className="text-muted-foreground text-sm">{topic.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Link */}
        <div className="text-center bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            Browse our comprehensive FAQ section or contact our support team directly.
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
          <h3 className="text-lg font-semibold mb-2">Support Hours</h3>
          <p className="text-muted-foreground">
            Monday - Friday: 9:00 AM - 6:00 PM PST<br />
            Saturday - Sunday: 10:00 AM - 4:00 PM PST
          </p>
        </div>
      </div>
    </div>
  );
}