/**
 * Validation Utility Functions
 * Shared utilities for form validation and error handling
 */

import { z, ZodError } from "zod";

/**
 * Transform Zod errors into a flat object
 * Returns: { fieldName: "error message" }
 */
export function transformZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });
  return errors;
}

/**
 * Transform Zod errors into an array format
 * Returns: [{ field, message, code }]
 */
export function transformZodErrorsToArray(error: ZodError) {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Validate a single field against a schema
 * Returns null if valid, error message if invalid
 */
export function validateField<T>(
  schema: z.ZodType<T>,
  value: unknown
): string | null {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof ZodError) {
      return error.issues[0]?.message || "Invalid value";
    }
    return "Invalid value";
  }
}

/**
 * Safe validation that returns a result object
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  value: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const data = schema.parse(value);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: transformZodErrors(error),
      };
    }
    return {
      success: false,
      errors: { _general: "Validation failed" },
    };
  }
}

