import Image from 'next/image'
import { PARTNERS } from '@/lib/data/partners'

export function Partners() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
            Trusted by Leading Brands
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We partner with the world&apos;s most innovative companies to bring you the best products.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 hover:opacity-80 transition-opacity">
          {PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={60}
                className="h-12 w-auto"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
