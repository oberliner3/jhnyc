'use client'

import { useState, useMemo } from 'react'
import { Product } from '@/lib/types'

export function useSearch(products: Product[]) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    inStock: false,
  })

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesQuery = query === '' || 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))

      const matchesCategory = filters.category === '' || product.category === filters.category
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
      const matchesStock = !filters.inStock || product.inStock

      return matchesQuery && matchesCategory && matchesPrice && matchesStock
    })
  }, [products, query, filters])

  return {
    query,
    setQuery,
    filters,
    setFilters,
    filteredProducts,
  }
}
