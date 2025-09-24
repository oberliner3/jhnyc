import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { APP_CONTACTS } from '@/lib/constants'

export const metadata: Metadata = generateSEO({
  title: 'Refund Policy',
  description: 'Read our refund policy to understand our process for returns and refunds.',
  path: '/refund-policy',
})

export default function RefundPolicyPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
          Refund Policy
        </h1>

        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: January 1, 2024
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4">Returns</h2>
            <p className="text-muted-foreground">
              Our policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Refunds</h2>
            <p className="text-muted-foreground">
              Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              Questions about the Refund Policy should be sent to us at {APP_CONTACTS.email.support}.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
