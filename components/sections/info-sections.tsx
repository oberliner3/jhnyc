import { Shield, Truck, RefreshCw, Headphones } from 'lucide-react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Secure Shopping',
    description: 'Your payment information is protected with bank-level security',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free shipping on all orders over $50 within the continental US',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns and exchanges on all items',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our customer service team is here to help you anytime',
  },
]

export function InfoSections() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
            Why Shop With Us?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the best shopping experience with premium quality products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg bg-background border transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
