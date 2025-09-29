import { ZodTypeAny, ZodError } from "zod";

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
