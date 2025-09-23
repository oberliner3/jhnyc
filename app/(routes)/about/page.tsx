import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'

export const metadata: Metadata = generateSEO({
  title: 'About Us',
  description: 'Learn about our mission, values, and commitment to providing exceptional products and service.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <div className="container px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
          About StoreCraft
        </h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-muted-foreground mb-8">
            We&apos;re passionate about bringing you the finest products with exceptional quality and unmatched service.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To curate and deliver premium products that enhance your lifestyle while providing 
                an exceptional shopping experience built on trust, quality, and customer satisfaction.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Values</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Quality craftsmanship in every product</li>
                <li>• Sustainable and ethical sourcing</li>
                <li>• Exceptional customer service</li>
                <li>• Innovation and continuous improvement</li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <p className="text-muted-foreground mb-6">
            With over a decade of experience in e-commerce, we understand what matters most to our customers. 
            From carefully selected products to lightning-fast shipping and hassle-free returns, 
            we&apos;re committed to exceeding your expectations at every step.
          </p>
        </div>
      </div>
    </div>
  )
}

