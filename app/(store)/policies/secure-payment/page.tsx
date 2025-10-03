import { Metadata } from 'next';
import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Secure Payment Information',
  description: 'Learn about our secure payment processing, accepted payment methods, and security measures.',
};

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic';

const securityFeatures = [
  {
    icon: Lock,
    title: 'SSL Encryption',
    description: 'All payment data is encrypted using industry-standard SSL technology.',
  },
  {
    icon: Shield,
    title: 'PCI Compliant',
    description: 'Our payment processing meets the highest PCI DSS security standards.',
  },
  {
    icon: CheckCircle,
    title: 'Fraud Protection',
    description: 'Advanced fraud detection systems protect against unauthorized transactions.',
  },
  {
    icon: CreditCard,
    title: 'Secure Storage',
    description: 'We never store your payment information on our servers.',
  },
];

const paymentMethods = [
  {
    name: 'Credit Cards',
    details: 'Visa, MasterCard, American Express, Discover',
    description: 'All major credit cards are accepted with secure processing.',
  },
  {
    name: 'PayPal',
    details: 'PayPal and PayPal Credit',
    description: 'Pay securely with your PayPal account or PayPal Credit.',
  },
  {
    name: 'Apple Pay',
    details: 'Touch ID and Face ID supported',
    description: 'Quick and secure checkout with Apple Pay on supported devices.',
  },
  {
    name: 'Google Pay',
    details: 'Android devices and web browsers',
    description: 'Fast, secure payments with Google Pay.',
  },
];

export default function SecurePaymentPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Secure Payment</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your payment security is our top priority. Learn about our secure payment processing 
              and the measures we take to protect your information.
            </p>
          </div>

          {/* Security Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Security Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {securityFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm text-center">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Accepted Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{method.name}</CardTitle>
                    <p className="text-muted-foreground">{method.details}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Detailed Security Information */}
          <div className="prose prose-gray max-w-none">
            <h2>How We Protect Your Payment Information</h2>
            
            <h3>Industry-Standard Encryption</h3>
            <p>
              All payment transactions are processed using 256-bit SSL (Secure Socket Layer) encryption. 
              This means your payment information is scrambled and protected as it travels between your 
              browser and our secure servers.
            </p>

            <h3>PCI DSS Compliance</h3>
            <p>
              We maintain PCI DSS (Payment Card Industry Data Security Standard) compliance, which is 
              the highest level of security certification available in the payments industry. This ensures 
              that your payment data is handled according to the strictest security standards.
            </p>

            <h3>No Storage Policy</h3>
            <p>
              We never store your complete payment information on our servers. Credit card details are 
              processed securely through our payment processors and are not retained in our systems 
              after the transaction is complete.
            </p>

            <h3>Fraud Detection</h3>
            <p>
              Our advanced fraud detection systems monitor all transactions for suspicious activity. 
              If unusual activity is detected, we may contact you to verify the transaction before 
              processing your order.
            </p>

            <h2>Payment Process</h2>
            <p>Here&apos;s what happens when you make a payment:</p>
            <ol>
              <li>Your payment information is encrypted in your browser</li>
              <li>The encrypted data is sent securely to our payment processor</li>
              <li>Your payment is verified and processed</li>
              <li>We receive confirmation without storing your payment details</li>
              <li>You receive an email confirmation of your purchase</li>
            </ol>

            <h2>Additional Security Tips</h2>
            <ul>
              <li>Always ensure you&apos;re on our secure website (look for the padlock icon in your browser)</li>
              <li>Keep your browser and device updated with the latest security patches</li>
              <li>Use strong, unique passwords for your account</li>
              <li>Never share your login credentials with others</li>
              <li>Contact us immediately if you notice any unauthorized activity</li>
            </ul>

            <h2>Billing and Transaction Issues</h2>
            <p>
              If you experience any issues with payment processing or notice discrepancies in your 
              billing, please contact our customer service team immediately:
            </p>
            <ul>
              <li>Email: <a href="mailto:billing@example.com" className="text-primary hover:underline">billing@example.com</a></li>
              <li>Phone: (970) 710-6334</li>
              <li>Live Chat: Available during business hours</li>
            </ul>

            <h2>Refunds and Chargebacks</h2>
            <p>
              We process refunds according to our <a href="/refund-policy" className="text-primary hover:underline">Return and Refund Policy</a>. 
              If you need to dispute a charge, please contact us first to resolve the issue. We&apos;re
              committed to working with you to address any billing concerns.
            </p>

            <h2>Questions About Security?</h2>
            <p>
              If you have questions about our payment security measures or need assistance with a 
              transaction, please don&apos;t hesitate to contact our support team. Your security and
              peace of mind are important to us.
            </p>

            <p className="text-center mt-8">
              <a href="/contact" className="text-primary hover:underline font-medium">
                Contact Customer Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}