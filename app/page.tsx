import { generateSEO } from '@/lib/seo'
import { Hero } from '@/components/sections/hero'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { InfoSections } from '@/components/sections/info-sections'
import { Partners } from '@/components/sections/partners'
import { Reviews } from '@/components/sections/reviews'
import { Newsletter } from '@/components/sections/newsletter'

export const revalidate = 60; // ISR: revalidate this page every 60 seconds

export const metadata = generateSEO({
  title: 'Premium E-Commerce Store',
  description: 'Discover premium products with exceptional quality and service. Shop our curated collection of the latest trends and timeless classics.',
})

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <InfoSections />
      <Partners />
      <Reviews />
      <Newsletter />
    </>
  )
}

