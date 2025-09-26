export interface Product {
  [key: string]: unknown;
  id: number;
  title: string;
  handle: string;
  body_html: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  vendor: string;
  variants: ProductVariant[];
  options: ProductOption[];
}
export interface ProductImage {
  alt?: string;
  created_at: string;
  height?: number;
  id: number;
  position: number;
  product_id: number;
  src: string;
  updated_at: string;
  variant_ids?: number[];
  width?: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  inStock: boolean;
  image?: string;
}
export interface ProductOption {
  id: number;
  name: string;
  position: number;
  values: string[];
}

export interface CartItem {
  id: string; // e.g., `${productId}-${variantId}`
  name: string;
  price: number;
  image: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  avatar?: string;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  website?: string;
}

export interface Address {
  id: string;
  type: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}
