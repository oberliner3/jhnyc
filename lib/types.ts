export interface Product {
    [key: string]: unknown; // Add index signature
    id: string
    name: string
    slug: string
    description: string
    price: number
    compareAtPrice?: number
    images: string[]
    category: string
    inStock: boolean
    rating: number
    reviewCount: number
    tags: string[]
    vendor: string
    variants?: ProductVariant[]
  }

  export interface ProductVariant {
    id: string
    name: string
    price: number
    inStock: boolean
    image?: string
  }

  export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    quantity: number
    image: string
    variant?: ProductVariant
  }

  export interface Review {
    id: string
    name: string
    rating: number
    comment: string
    date: string
    verified: boolean
    avatar?: string
  }

  export interface Partner {
    id: string
    name: string
    logo: string
    website?: string
  }
