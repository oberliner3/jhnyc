import { env } from "./env-validation";

export const IS_DEV = process.env.NODE_ENV === "development";

export const siteDomain = env.NEXT_PUBLIC_SITE_URL || "localhost:3000";
export const siteUrl = siteDomain.startsWith("http")
	? siteDomain
	: isLocalhost(siteDomain)
		? `http://${siteDomain}`
		: `https://${siteDomain}`;

export function isLocalhost(host: string) {
	return host.includes("localhost") || /^(127\.0\.0\.1|0\.0\.0\.0)/.test(host);
}

export const SITE_CONFIG = {
  name: env.NEXT_PUBLIC_STORE_NAME || "OriGenZ",
  description: "Premium e-commerce storefront built with Next.js",
  domain: siteDomain,
  url: siteUrl,
  ogTitle: `${
    env.NEXT_PUBLIC_STORE_NAME || "OriGenZ"
  } - Your One-Stop Shop for Quality Products`,
  ogImage: `${siteUrl}/og.png`,
  author: env.NEXT_PUBLIC_STORE_NAME || "OriGenZ",
  lastUpdate: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
  keywords: [
    "e-commerce",
    "online store",
    "shopping",
    "retail",
    "products",
    "storefront",
    "next.js",
    "react",
    "typescript",
  ] as const,
  cookieConfig: {
    name: "jhuangnyc-cookie-consent",
    expires: 180, // days
    sameSite: "Lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // Allow client-side access for consent management
  },
} as const;

// Application limits and constraints
export const LIMITS = {
  PRODUCTS_PER_PAGE: 20,
  MAX_CART_ITEMS: 50,
  MAX_QUANTITY_PER_ITEM: 99,
  MIN_QUANTITY_PER_ITEM: 1,
  API_TIMEOUT: 30000, // 30 seconds
  SEARCH_MIN_LENGTH: 2,
  SEARCH_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 50,
  ADDRESS_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  MESSAGE_MAX_LENGTH: 2000,
  MESSAGE_MIN_LENGTH: 10,
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  PRODUCTS: 300, // 5 minutes
  COLLECTIONS: 600, // 10 minutes
  SEARCH_RESULTS: 180, // 3 minutes
  USER_SESSION: 86400, // 24 hours
  STATIC_CONTENT: 2592000, // 30 days
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  LOADING_DELAY: 200, // Delay before showing loading state
  DEBOUNCE_DELAY: 300, // For search inputs
  ANIMATION_DURATION: 200, // General animation duration
  MOBILE_BREAKPOINT: 768, // Mobile breakpoint in pixels
} as const;

// API Configuration (client-safe defaults; server modules should use getServerEnv)
export const API_CONFIG = {
  BASE_URL: "/api",
  VERSION: "v1",
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // Base retry delay in milliseconds
  TIMEOUT: LIMITS.API_TIMEOUT,
  PRODUCT_STREAM_API: env.NEXT_PUBLIC_COSMOS_API_BASE_URL,
  HEADERS: {
    "Content-Type": "application/json",
    "User-Agent": "ua-x-jhuangnyc/1.0.0",
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PHONE: "Please enter a valid phone number",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SHOPIFY_ERROR: "There was an issue processing your order. Please try again.",
  CART_EMPTY: "Your cart is empty",
  PRODUCT_OUT_OF_STOCK: "This product is currently out of stock",
  QUANTITY_EXCEEDED: `Quantity cannot exceed ${LIMITS.MAX_QUANTITY_PER_ITEM}`,
  CART_LIMIT_EXCEEDED: `Cannot add more than ${LIMITS.MAX_CART_ITEMS} items to cart`,
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ITEM_ADDED_TO_CART: "Item added to cart successfully",
  ITEM_REMOVED_FROM_CART: "Item removed from cart",
  CART_UPDATED: "Cart updated successfully",
  ORDER_CREATED: "Order created successfully",
  EMAIL_SENT: "Email sent successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  ADDRESS_SAVED: "Address saved successfully",
  SUBSCRIPTION_CONFIRMED: "Subscription confirmed",
} as const;

export const buildEmail = (handle: string) =>
  `${handle}@jhuangnyc.com`;

export const buildPhone = (ext: number, callSign: string, zone?: number) => {
  // Normalize and format to "+<ext> (AAA) BBB-CCCC" when possible (NANP)
  const digits = (callSign || "").replace(/\D/g, "");

  let local = callSign;

  if (digits.length >= 10) {
    // Use last 10 digits in case a country code was included in callSign
    const d = digits.slice(-10);
    const area = d.slice(0, 3);
    const exchange = d.slice(3, 6);
    const line = d.slice(6);
    local = `(${area}) ${exchange}-${line}`;
  } else if (digits.length === 7) {
    // Optionally apply provided zone (area code) if given
    const exchange = digits.slice(0, 3);
    const line = digits.slice(3);
    local = zone ? `(${zone}) ${exchange}-${line}` : `${exchange}-${line}`;
  } else if (digits.length > 0 && digits.length < 7) {
    // Fallback: keep as-is for short numbers
    local = digits;
  }

  return `+${ext} ${local}`.trim();
};

export const buildAddress = ({
  street,
  city,
  state,
  zipCode,
  country,
}: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}): string =>
  `${street}, ${city},<br/> ${state} ${zipCode}${
    country ? `, ${country}` : ""
  }`;

export const APP_CONTACTS = {
  email: {
    getInTouch: buildEmail("contact"),
  },
  phone: {
    main: buildPhone(1, "9707106334"),
  },
  address: {
    office: buildAddress({
      street: "1308 E 41st Pl",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90011",
      country: "USA",
    }),
  },
};

export const NAVIGATION_ITEMS = [
	{ name: "Home", href: "/" },
	{ name: "Collections", href: "/collections/all" },
	{ name: "Contact", href: "/contact" },
	{ name: "About us", href: "/about" },
];

export const FOOTER_LINKS = {
	company: [
		{ name: "About us", href: "/about" },
		{ name: "Contact", href: "/contact" },
		{ name: "Careers", href: "/careers" },
	],
	support: [
		{ name: "Help Center", href: "/help" },
		{ name: "Shipping Info", href: "/shipping-delivery" },
		{ name: "Returns", href: "/returns-exchange" },
	],
	legal: [
		{ name: "Privacy Policy", href: "/privacy-policy" },
		{ name: "Terms of Service", href: "/terms-of-service" },
		{ name: "Rewards Terms", href: "/rewards-terms" },
	],
};
