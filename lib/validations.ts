import { z, ZodError, ZodTypeAny } from "zod";

// Reusable validation helper for individual fields
export const validateField = (
  field: string,
  value: unknown,
  schema: ZodTypeAny
): string | null => {
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

    schema.parse(toValidate);
    return null;
  } catch (error: unknown) {
    if (error instanceof ZodError && error.issues?.[0]?.message) {
      return error.issues[0].message;
    }
    return "Invalid value";
  }
};


export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});


export const newsletterSchema = z.object({
  email: z.email("Please enter a valid email address"),
});


export const checkoutSchema = z.object({
  email: z.email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().min(2, "Country is required"),
  }),
  phone: z.string().optional(),
});
