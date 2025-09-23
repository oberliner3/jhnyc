import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo'
import { ProductCard } from '@/components/product/product-card'
import { FEATURED_PRODUCTS } from '@/lib/data/products'

export const metadata: Metadata = generateSEO({
  title: 'Products',
  description: 'Browse our complete collection of premium products. Find everything you need from electronics to fashion and lifestyle items.',
  path: '/products',
})

export default function ProductsPage() {
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-4">
          All Products
        </h1>
        <p className="text-muted-foreground">
          Discover our complete collection of premium products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FEATURED_PRODUCTS.concat(FEATURED_PRODUCTS).map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </div>
    </div>
  )
}
