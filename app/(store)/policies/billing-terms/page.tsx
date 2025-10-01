import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing Terms and Conditions',
  description: 'Understand our billing policies, payment terms, and conditions for all transactions.',
};

export default function BillingTermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Billing Terms and Conditions</h1>
            <p className="text-muted-foreground text-lg">
              Last updated: January 1, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <h2>Payment Terms</h2>
            <p>
              All payments are due at the time of purchase unless otherwise agreed upon in writing. 
              We accept all major credit cards, PayPal, and other payment methods as displayed at checkout.
            </p>

            <h2>Billing Information</h2>
            <p>
              You agree to provide accurate, complete, and updated billing information. You are responsible 
              for maintaining the confidentiality of your payment information and for all activities that 
              occur under your account.
            </p>

            <h2>Pricing and Taxes</h2>
            <p>
              All prices are listed in USD and are subject to applicable taxes. Sales tax will be calculated 
              and added to your order based on your billing address and local tax regulations.
            </p>

            <h2>Payment Processing</h2>
            <p>
              We use secure, encrypted payment processing services to handle your transactions. Your payment 
              information is never stored on our servers and is processed by certified payment processors.
            </p>

            <h2>Failed Payments</h2>
            <p>
              If a payment fails, we will attempt to process it again. If payment continues to fail, your 
              order may be cancelled, and you will be notified via email.
            </p>

            <h2>Refunds and Disputes</h2>
            <p>
              Refunds are processed according to our Return and Refund Policy. For billing disputes, 
              please contact our customer service team within 30 days of the transaction.
            </p>

            <h2>Subscription Services</h2>
            <p>
              For recurring subscription services, you authorize us to charge your payment method on a 
              recurring basis. You may cancel subscriptions at any time through your account dashboard.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have questions about billing or need assistance with payment issues, please contact 
              our support team at{' '}
              <a href="mailto:billing@example.com" className="text-primary hover:underline">
                billing@example.com
              </a>{' '}
              or visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}