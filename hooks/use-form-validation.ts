"use client";

import * as React from "react";
import { z } from "zod";
import { countries } from "@/lib/countries";

// Define validation schemas
const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, "Country is required"),
});

const checkoutSchema = z.object({
  email: z.email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: addressSchema,
  phone: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface ValidationState {
  [key: string]: {
    error: string | null;
    dirty: boolean;
  };
}

interface UseFormValidationProps {
  initialData: Partial<CheckoutFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

export function useFormValidation({
  initialData,
  onValidationChange,
}: UseFormValidationProps) {
  const [formData, setFormData] =
    React.useState<Partial<CheckoutFormData>>(initialData);
  const [validationState, setValidationState] = React.useState<ValidationState>(
    {}
  );

  const validateField = React.useCallback((field: string, value: unknown) => {
    try {
      const fieldPath = field.split(".");
      
      // Build the complete object structure for validation
      const toValidate: Record<string, unknown> = {};
      
      if (fieldPath.length > 1) {
        // For nested fields like "address.street"
        toValidate[fieldPath[0]] = {};
        let current = toValidate[fieldPath[0]] as Record<string, unknown>;
        
        for (let i = 1; i < fieldPath.length - 1; i++) {
          current[fieldPath[i]] = {};
          current = current[fieldPath[i]] as Record<string, unknown>;
        }
        
        current[fieldPath[fieldPath.length - 1]] = value;
        
        // Get the nested schema for validation
        const schema = checkoutSchema.shape[fieldPath[0] as keyof typeof checkoutSchema.shape];
        
        if (schema && 'shape' in schema) {
          // Validate just the specific field within the nested schema
          const nestedSchema = (schema as z.ZodObject<Record<string, z.ZodTypeAny>>).shape[fieldPath[1]];
          if (nestedSchema) {
            nestedSchema.parse(value);
          }
        }
      } else {
        // For top-level fields
        toValidate[field] = value;
        const fieldSchema = checkoutSchema.shape[field as keyof typeof checkoutSchema.shape];
        if (fieldSchema) {
          fieldSchema.parse(value);
        }
      }
      
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0].message;
      }
      return "Invalid value";
    }
  }, []);

  const setFieldValue = React.useCallback(
    (field: string, value: unknown) => {
      setFormData((prev) => {
        const newData = { ...prev };
        const fieldPath = field.split(".");
        
        if (fieldPath.length > 1) {
          // Handle nested fields
          let current: Record<string, unknown> = newData;
          
          // Navigate to the parent of the field to update
          for (let i = 0; i < fieldPath.length - 1; i++) {
            const key = fieldPath[i];
            if (!current[key] || typeof current[key] !== 'object') {
              current[key] = {};
            } else {
              // Clone the object to maintain immutability
              current[key] = { ...(current[key] as Record<string, unknown>) };
            }
            current = current[key] as Record<string, unknown>;
          }
          
          // Set the final value
          current[fieldPath[fieldPath.length - 1]] = value;
        } else {
          // Handle top-level fields
          (newData as Record<string, unknown>)[field] = value;
        }
        
        return newData;
      });

      // Validate the field
      const error = validateField(field, value);
      
      setValidationState((prev) => ({
        ...prev,
        [field]: {
          error,
          dirty: true,
        },
      }));
    },
    [validateField]
  );

  const isValid = React.useMemo(() => {
    try {
      checkoutSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  }, [formData]);

  React.useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  return {
    formData,
    setFieldValue,
    validationState,
    isValid,
  };
}

export const formatPhoneNumberForCountry = (
  phoneNumber: string,
  countryCode: string
) => {
  const country = countries.find((c) => c.code === countryCode);
  if (!country || !phoneNumber) return phoneNumber;

  let formatted = phoneNumber;
  const digits = phoneNumber.replace(/\D/g, "");
  const format = country.format;

  let i = 0;
  formatted = format.replace(/#/g, () => digits[i++] || "");

  return formatted;
};
