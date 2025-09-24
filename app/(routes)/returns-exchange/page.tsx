import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { APP_CONTACTS } from '@/lib/constants'

export const metadata: Metadata = generateSEO({
  title: 'Returns & Exchange',
  description: 'Information about our return and exchange policy.',
  path: '/returns-exchange',
})

export default function ReturnsExchangePage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
          Returns & Exchange Policy
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-muted-foreground">Last updated: January 1, 2024</p>

          <section>
            <h2 className="text-2xl font-bold mb-4">Our Return Policy</h2>
            <p className="text-muted-foreground">
              We want you to be completely satisfied with your purchase. If you
              are not satisfied for any reason, you may return eligible items
              within 30 days of delivery for a full refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Eligibility for Returns</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Items must be unused, in their original condition, and with all
                tags attached.
              </li>
              <li>Original packaging must be intact.</li>
              <li>Proof of purchase is required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              How to Initiate a Return or Exchange
            </h2>
            <p className="text-muted-foreground">
              To initiate a return or exchange, please contact our customer
              service team at {APP_CONTACTS.email.support}
              with your order number and reason for return. We will provide you
              with instructions and a return shipping label.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Refunds</h2>
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
            <h2 className="text-2xl font-bold mb-4">Exchanges</h2>
            <p className="text-muted-foreground">
              If you need to exchange an item for a different size or color,
              please contact us. We will guide you through the exchange process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our Returns & Exchange Policy,
              please contact us at {APP_CONTACTS.email.support}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
