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
      const schema: z.ZodTypeAny =
        fieldPath.length > 1 && fieldPath[0] in checkoutSchema.shape
          ? (checkoutSchema.shape[
              fieldPath[0] as keyof typeof checkoutSchema.shape
            ] as z.ZodTypeAny)
          : checkoutSchema;

      const toValidate =
        fieldPath.length > 1 ? { [fieldPath[1]]: value } : { [field]: value };

      schema.parse(toValidate);
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
        const fieldPath = field.split(".");
        if (fieldPath.length > 1) {
          return {
            ...prev,
            [fieldPath[0]]: {
              ...((prev[fieldPath[0] as keyof typeof prev] as object) || {}),
              [fieldPath[1]]: value,
            },
          };
        }
        return { ...prev, [field]: value };
      });

      setValidationState((prev) => ({
        ...prev,
        [field]: {
          error: validateField(field, value),
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
