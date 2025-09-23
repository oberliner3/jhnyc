import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'Shipping & Delivery',
  description: 'Information about our shipping methods, costs, and delivery times.',
  path: '/shipping-delivery',
})

export default function ShippingDeliveryPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
          Shipping & Delivery
        </h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <p className="text-muted-foreground">
            Last updated: January 1, 2024
          </p>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Shipping Methods & Costs</h2>
            <p className="text-muted-foreground">
              We offer several shipping options to meet your needs. Shipping costs are calculated at checkout 
              based on your order total and selected shipping method.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Standard Shipping (3-7 business days): $5.99 (Free for orders over $50)</li>
              <li>Expedited Shipping (2-3 business days): $12.99</li>
              <li>Priority Shipping (1-2 business days): $24.99</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Delivery Times</h2>
            <p className="text-muted-foreground">
              Delivery times are estimates and begin from the date of shipment, not the date of order. 
              Orders are typically processed within 1-2 business days.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">International Shipping</h2>
            <p className="text-muted-foreground">
              We currently do not offer international shipping. We hope to expand our shipping options in the future.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Order Tracking</h2>
            <p className="text-muted-foreground">
              Once your order has shipped, you will receive a shipping confirmation email with a tracking number. 
              You can use this number to track your order&apos;s progress.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about shipping or delivery, please contact us at shipping@storecraft.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
