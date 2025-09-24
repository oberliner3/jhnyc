'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/types'

async function getSearchResults(query: string): Promise<Product[]> {
  const res = await fetch(`/api/products?search=${query}`)
  if (!res.ok) {
    throw new Error('Failed to fetch search results')
  }
  return res.json()
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['search', query],
    queryFn: () => getSearchResults(query || ''),
    enabled: !!query,
  })

  if (!query) {
    return <div className="text-center py-12">Please enter a search term.</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading search results.</div>
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-bold tracking-tight lg:text-4xl mb-8">
        Search Results for &quot;{query}&quot;
      </h1>
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">No products found.</div>
      )}
    </div>
  )
}
