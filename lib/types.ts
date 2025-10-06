export interface OrderItem {
	id: string;
	name: string;
	price: number;
	quantity: number;
	image: string;
}

export interface DraftOrder {
	id: string;
	date: string;
	status: string;
	total: number;
	items: OrderItem[];
}

export interface ShoppingCartItem {
	id: string;
	cart_id: string;
	product: ApiProduct;
	variant_id: string;
	quantity: number;
	variant?: ApiProductVariant;
}
export interface CartState {
	items: ShoppingCartItem[];
	isOpen: boolean;
}
// --- State Management ---
export interface CartContextType extends ClientCartState {
	addItem: (
		product: ApiProduct,
		variant?: ApiProductVariant, // Make variant optional here
		quantity?: number,
	) => Promise<void>;
	removeItem: (productId: string, variantId: string) => Promise<void>;
	updateQuantity: (
		productId: string,
		variantId: string,
		quantity: number,
	) => Promise<void>;
	clearCart: () => Promise<void>;
	toggleCart: () => void;
	getTotalItems: () => number;
	getTotalPrice: () => number;
}

export interface ClientCartItem {
	id: string; // This is the API cart_item ID
	product: ApiProduct;
	variant: ApiProductVariant;
	quantity: number;
	name: string;
	price: number;
	image?: string;
}

export interface ClientCartState {
	items: ClientCartItem[];
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
  id?: string;
  type?: 'shipping' | 'billing';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string; // State or Province
  country: string;
  zip?: string; // Postal Code or ZIP Code
  phone?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

// Types specific to the API response structure
export interface ApiProduct {
  id: string;
  title: string;
  handle: string;
  body_html: string;
  price: number;
  compare_at_price?: number;
  images: ApiProductImage[];
  product_type: string;
  in_stock: boolean;
  rating: number;
  review_count: number;
  /**
   * Product tags - can be either a comma-separated string or an array
   * Use normalizeProductTags() utility to safely handle both formats
   */
  tags: string[] | null;
  vendor: string;
  variants: ApiProductVariant[];
  options: ApiProductOption[];
  created_at: string;
  updated_at: string;
  quantity?: number;
  raw_json?: string;
}

export interface ApiProductImage {
	id: string;
	product_id: string;
	position: number;
	alt?: string;
	src: string;
	width?: number;
	height?: number;
	created_at: string;
	updated_at: string;
	variant_ids?: string[];
}

export interface ApiProductVariant {
	id: string;
	product_id: string;
	title: string;
	option1?: string;
	option2?: string;
	option3?: string;
	sku?: string;
	requires_shipping: boolean;
	taxable: boolean;
	featured_image?: string;
	available: boolean;
	price: number;
	grams: number;
	compare_at_price?: number;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface ApiProductOption {
	id: string;
	product_id: string;
	name: string;
	position: number;
	values: string[];
}
