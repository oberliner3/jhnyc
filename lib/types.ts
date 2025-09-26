export interface Product {
  [key: string]: unknown;
  id: string;
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
  id: string;
  position: number;
  product_id: string;
  src: string;
  updated_at: string;
  variant_ids?: string[];
  width?: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  image?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
}
export interface ProductOption {
  id: number;
  name: string;
  position: number;
  values: string[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id: string;
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
