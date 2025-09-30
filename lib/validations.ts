import { z, ZodError, ZodTypeAny } from "zod";
import { LIMITS, ERROR_MESSAGES } from "@/lib/constants";
import type { IValidationError } from "@/lib/errors";

// Enhanced validation result interface
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: IValidationError[];
}

// Form state interface
export interface FormState<T> {
  data: T;
  errors: IValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Enhanced validation helper for individual fields
export const validateField = <T>(
  field: string,
  value: unknown,
  schema: ZodTypeAny
): ValidationResult<T> => {
  try {
    const fieldPath = field.split(".");
    const toValidate = fieldPath.reduce<Record<string, unknown>>(
      (acc, part, index) => {
        if (index === fieldPath.length - 1) {
          return { ...acc, [part]: value };
        }
        return { ...acc, [part]: { ...((acc[part] as object) || {}) } };
      },
      {}
    );

    const result = schema.parse(toValidate) as T;
    return {
      success: true,
      data: result,
      errors: []
    };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      return {
        success: false,
        errors
      };
    }
    return {
      success: false,
      errors: [{
        field,
        message: 'Invalid value',
        code: 'invalid_type'
      }]
    };
  }
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  POSTAL_CODE: /^[A-Z0-9\s-]{3,10}$/i,
  CREDIT_CARD: /^[0-9]{13,19}$/,
  CVV: /^[0-9]{3,4}$/,
} as const;


// Enhanced schemas with better error messages and constraints
export const contactSchema = z.object({
  firstName: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .max(LIMITS.NAME_MAX_LENGTH, `First name must be less than ${LIMITS.NAME_MAX_LENGTH} characters`)
    .trim(),
  lastName: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .max(LIMITS.NAME_MAX_LENGTH, `Last name must be less than ${LIMITS.NAME_MAX_LENGTH} characters`)
    .trim(),
  email: z.string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .max(LIMITS.EMAIL_MAX_LENGTH, `Email must be less than ${LIMITS.EMAIL_MAX_LENGTH} characters`)
    .trim()
    .toLowerCase(),
  subject: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .max(200, "Subject must be less than 200 characters")
    .trim(),
  message: z.string()
    .min(LIMITS.MESSAGE_MIN_LENGTH, `Message must be at least ${LIMITS.MESSAGE_MIN_LENGTH} characters long`)
    .max(LIMITS.MESSAGE_MAX_LENGTH, `Message must be less than ${LIMITS.MESSAGE_MAX_LENGTH} characters`)
    .trim(),
});

export const newsletterSchema = z.object({
  email: z.string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .max(LIMITS.EMAIL_MAX_LENGTH, `Email must be less than ${LIMITS.EMAIL_MAX_LENGTH} characters`)
    .trim()
    .toLowerCase(),
});

export const checkoutSchema = z.object({
  email: z.string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .max(LIMITS.EMAIL_MAX_LENGTH, `Email must be less than ${LIMITS.EMAIL_MAX_LENGTH} characters`)
    .trim()
    .toLowerCase(),
  firstName: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .max(LIMITS.NAME_MAX_LENGTH, `First name must be less than ${LIMITS.NAME_MAX_LENGTH} characters`)
    .trim(),
  lastName: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .max(LIMITS.NAME_MAX_LENGTH, `Last name must be less than ${LIMITS.NAME_MAX_LENGTH} characters`)
    .trim(),
  address: z.object({
    street: z.string()
      .min(1, ERROR_MESSAGES.REQUIRED)
      .max(LIMITS.ADDRESS_MAX_LENGTH, `Street address must be less than ${LIMITS.ADDRESS_MAX_LENGTH} characters`)
      .trim(),
    city: z.string()
      .min(1, ERROR_MESSAGES.REQUIRED)
      .max(100, "City must be less than 100 characters")
      .trim(),
    state: z.string()
      .max(100, "State must be less than 100 characters")
      .trim()
      .optional(),
    postalCode: z.string()
      .max(20, "Postal code must be less than 20 characters")
      .trim()
      .optional(),
    country: z.string()
      .min(2, "Country is required")
      .max(2, "Country code must be exactly 2 characters")
      .toUpperCase(),
  }),
  phone: z.string()
    .max(LIMITS.PHONE_MAX_LENGTH, `Phone number must be less than ${LIMITS.PHONE_MAX_LENGTH} characters`)
    .trim()
    .optional(),
});

// Draft order schemas
export const draftOrderLineItemSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  productId: z.string().optional(),
  title: z.string().optional(),
  quantity: z.number()
    .int("Quantity must be a whole number")
    .min(LIMITS.MIN_QUANTITY_PER_ITEM, `Minimum quantity is ${LIMITS.MIN_QUANTITY_PER_ITEM}`)
    .max(LIMITS.MAX_QUANTITY_PER_ITEM, `Maximum quantity is ${LIMITS.MAX_QUANTITY_PER_ITEM}`),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal number")
    .optional(),
  sku: z.string().optional(),
  grams: z.number().int().min(0).optional(),
  taxable: z.boolean().optional(),
  requiresShipping: z.boolean().optional(),
});

export const draftOrderSchema = z.object({
  lineItems: z.array(draftOrderLineItemSchema)
    .min(1, "At least one line item is required"),
  customerEmail: z.string()
    .email(ERROR_MESSAGES.INVALID_EMAIL)
    .max(LIMITS.EMAIL_MAX_LENGTH)
    .optional(),
  customerFirstName: z.string()
    .max(LIMITS.NAME_MAX_LENGTH)
    .trim()
    .optional(),
  customerLastName: z.string()
    .max(LIMITS.NAME_MAX_LENGTH)
    .trim()
    .optional(),
  customerPhone: z.string()
    .max(LIMITS.PHONE_MAX_LENGTH)
    .trim()
    .optional(),
  shippingAddress: z.object({
    first_name: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(LIMITS.NAME_MAX_LENGTH).trim(),
    last_name: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(LIMITS.NAME_MAX_LENGTH).trim(),
    company: z.string().max(100).trim().optional(),
    address1: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(LIMITS.ADDRESS_MAX_LENGTH).trim(),
    address2: z.string().max(LIMITS.ADDRESS_MAX_LENGTH).trim().optional(),
    city: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(100).trim(),
    province: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(100).trim(),
    country: z.string().min(2, "Country is required").max(2).toUpperCase(),
    zip: z.string().min(1, ERROR_MESSAGES.REQUIRED).max(20).trim(),
    phone: z.string().max(LIMITS.PHONE_MAX_LENGTH).trim().optional(),
  }).optional(),
  note: z.string().max(LIMITS.MESSAGE_MAX_LENGTH).trim().optional(),
  tags: z.string().max(500).trim().optional(),
  sendInvoice: z.boolean().optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string()
    .min(LIMITS.SEARCH_MIN_LENGTH, `Search must be at least ${LIMITS.SEARCH_MIN_LENGTH} characters`)
    .max(LIMITS.SEARCH_MAX_LENGTH, `Search must be less than ${LIMITS.SEARCH_MAX_LENGTH} characters`)
    .trim(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['relevance', 'name', 'price', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
