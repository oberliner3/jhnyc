/**
 * MessagePack utilities for Shopify data structures
 * Provides optimized serialization/deserialization for Shopify-specific data
 */

import { encode, decode } from "msgpack-javascript";
import type {
  DraftOrderInput,
  DraftOrderShippingAddress,
} from "./shopify-client";
import type { CheckoutData } from "@/app/(checkout)/checkout/actions";

/**
 * Optimized MessagePack encoder for Shopify draft order data
 * Removes undefined/null values and compresses common field names
 */
export function encodeShopifyDraftOrder(data: DraftOrderInput): Uint8Array {
  // Create a compressed version by removing undefined/null values
  const compressed = cleanObject(data) as DraftOrderInput;
  
  // Use shorter field names for common properties to reduce payload size
  const optimized = {
    li: compressed.line_items?.map(item => ({
      t: item.title,
      vi: item.variant_id,
      pi: item.product_id,
      q: item.quantity,
      p: item.price,
      s: item.sku,
      g: item.grams,
      tax: item.taxable,
      ship: item.requires_shipping,
    })),
    c: compressed.customer ? {
      id: compressed.customer.id,
      e: compressed.customer.email,
      fn: compressed.customer.first_name,
      ln: compressed.customer.last_name,
      ph: compressed.customer.phone,
      am: compressed.customer.accepts_marketing,
    } : undefined,
    sa: compressed.shipping_address ? compressAddress(compressed.shipping_address) : undefined,
    ba: compressed.billing_address ? compressAddress(compressed.billing_address) : undefined,
    tags: compressed.tags,
    email: compressed.email,
    curr: compressed.currency,
    ucda: compressed.use_customer_default_address,
    tl: compressed.tax_lines,
    sl: compressed.shipping_lines,
  };
  
  return encode(cleanObject(optimized));
}

/**
 * Decode MessagePack data back to Shopify draft order format
 */
export function decodeShopifyDraftOrder(data: Uint8Array): DraftOrderInput {
  const decoded = decode(data) as Record<string, unknown>;
  
  // Convert back to full format
  return {
    line_items: (decoded.li as Record<string, unknown>[] | undefined)?.map((item: Record<string, unknown>) => ({
      title: item.t as string | undefined,
      variant_id: item.vi as string | number | undefined,
      product_id: item.pi as string | number | undefined,
      quantity: item.q as number,
      price: item.p as string | number | undefined,
      sku: item.s as string | undefined,
      grams: item.g as number | undefined,
      taxable: item.tax as boolean | undefined,
      requires_shipping: item.ship as boolean | undefined,
    })) || [],
    customer: decoded.c ? {
      id: (decoded.c as Record<string, unknown>).id as string | number | undefined,
      email: (decoded.c as Record<string, unknown>).e as string | undefined,
      first_name: (decoded.c as Record<string, unknown>).fn as string | undefined,
      last_name: (decoded.c as Record<string, unknown>).ln as string | undefined,
      phone: (decoded.c as Record<string, unknown>).ph as string | undefined,
      accepts_marketing: (decoded.c as Record<string, unknown>).am as boolean | undefined,
    } : undefined,
    shipping_address: decoded.sa ? decompressAddress(decoded.sa as Record<string, unknown>) : undefined,
    billing_address: decoded.ba ? decompressAddress(decoded.ba as Record<string, unknown>) : undefined,
    tags: decoded.tags as string | undefined,
    note: decoded.note as string | undefined,
    email: decoded.email as string | undefined,
    currency: decoded.curr as string | undefined,
    use_customer_default_address: decoded.ucda as boolean | undefined,
    tax_lines: decoded.tl as Array<{title: string; rate: number; price: string}> | undefined,
    shipping_lines: decoded.sl as Array<{title: string; price: string; code?: string}> | undefined,
  };
}

/**
 * Encode checkout data for efficient transfer
 */
export function encodeCheckoutData(data: CheckoutData): Uint8Array {
  const compressed = {
    i: data.items.map(item => ({
      pi: item.productId,
      vi: item.variantId,
      q: item.quantity,
      p: item.price,
    })),
    c: {
      e: data.customer.email,
      fn: data.customer.firstName,
      ln: data.customer.lastName,
      a: {
        s: data.customer.address.street,
        c: data.customer.address.city,
        st: data.customer.address.state,
        pc: data.customer.address.postalCode,
        co: data.customer.address.country,
      },
      ph: data.customer.phone,
    },
    t: {
      sub: data.totals.subtotal,
      ship: data.totals.shipping,
      tax: data.totals.tax,
      tot: data.totals.total,
    },
  };
  
  return encode(cleanObject(compressed));
}

/**
 * Decode checkout data from MessagePack
 */
export function decodeCheckoutData(data: Uint8Array): CheckoutData {
  const decoded = decode(data) as Record<string, unknown>;
  
  return {
    items: (decoded.i as Record<string, unknown>[]).map((item: Record<string, unknown>) => ({
      productId: item.pi as string,
      variantId: item.vi as string,
      quantity: item.q as number,
      price: item.p as number,
    })),
    customer: {
      email: (decoded.c as Record<string, unknown>).e as string,
      firstName: (decoded.c as Record<string, unknown>).fn as string,
      lastName: (decoded.c as Record<string, unknown>).ln as string,
      address: {
        street: ((decoded.c as Record<string, unknown>).a as Record<string, unknown>).s as string,
        city: ((decoded.c as Record<string, unknown>).a as Record<string, unknown>).c as string,
        state: ((decoded.c as Record<string, unknown>).a as Record<string, unknown>).st as string | undefined,
        postalCode: ((decoded.c as Record<string, unknown>).a as Record<string, unknown>).pc as string | undefined,
        country: ((decoded.c as Record<string, unknown>).a as Record<string, unknown>).co as string,
      },
      phone: (decoded.c as Record<string, unknown>).ph as string | undefined,
    },
    totals: {
      subtotal: (decoded.t as Record<string, unknown>).sub as number,
      shipping: (decoded.t as Record<string, unknown>).ship as number,
      tax: (decoded.t as Record<string, unknown>).tax as number,
      total: (decoded.t as Record<string, unknown>).tot as number,
    },
  };
}

/**
 * Generic MessagePack encoder with Shopify optimizations
 */
export function encodeShopifyData<T>(data: T): Uint8Array {
  return encode(cleanObject(data));
}

/**
 * Generic MessagePack decoder
 */
export function decodeShopifyData<T>(data: Uint8Array): T {
  return decode(data) as T;
}

/**
 * Helper function to compress address objects
 */
function compressAddress(address: DraftOrderShippingAddress) {
  return {
    fn: address.first_name,
    ln: address.last_name,
    co: address.company,
    a1: address.address1,
    a2: address.address2,
    c: address.city,
    p: address.province,
    cn: address.country,
    z: address.zip,
    ph: address.phone,
  };
}

/**
 * Helper function to decompress address objects
 */
function decompressAddress(compressed: Record<string, unknown>): DraftOrderShippingAddress {
  return {
    first_name: compressed.fn as string | undefined,
    last_name: compressed.ln as string | undefined,
    company: compressed.co as string | undefined,
    address1: compressed.a1 as string,
    address2: compressed.a2 as string | undefined,
    city: compressed.c as string,
    province: compressed.p as string,
    country: compressed.cn as string,
    zip: compressed.z as string,
    phone: compressed.ph as string | undefined,
  };
}

/**
 * Remove undefined and null values from objects recursively
 */
function cleanObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanObject).filter(item => item !== undefined);
  }
  
  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  return obj;
}

/**
 * Calculate compression ratio for analysis
 */
export function calculateCompressionRatio(original: unknown): {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  savings: string;
} {
  const originalJson = JSON.stringify(original);
  const originalSize = new TextEncoder().encode(originalJson).length;
  
  const compressed = encodeShopifyData(original);
  const compressedSize = compressed.length;
  
  const compressionRatio = originalSize / compressedSize;
  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  
  return {
    originalSize,
    compressedSize,
    compressionRatio: Math.round(compressionRatio * 100) / 100,
    savings: `${savings}%`,
  };
}