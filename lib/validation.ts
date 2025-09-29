export const validateField = (field: string, value: any, schema: any) => {
  try {
    const fieldPath = field.split(".");
    const toValidate = fieldPath.reduce<Record<string, any>>(
      (acc, part, index) => {
        if (index === fieldPath.length - 1) {
          return { ...acc, [part]: value };
        }
        return { ...acc, [part]: { ...(acc[part] || {}) } };
      },
      {}
    );

    schema.parse(toValidate);
    return null;
  } catch (error: any) {
    if (error?.errors?.[0]?.message) {
      return error.errors[0].message;
    }
    return "Invalid value";
  }
};
