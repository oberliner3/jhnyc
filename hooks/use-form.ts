"use client";

import { useState, useCallback, useEffect } from "react";
import { z } from "zod";

export interface FormState<T> {
  values: Partial<T>;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface UseFormOptions<T, S extends z.ZodType<T>> {
  initialValues?: Partial<T>;
  schema: S;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnMount?: boolean;
}

/**
 * A comprehensive form handling hook with validation support
 * 
 * @param options - Configuration options for the form
 * @returns Form state and handlers
 */
export function useForm<T extends Record<string, unknown>, S extends z.ZodType<T>>({
  initialValues = {} as Partial<T>,
  schema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
}: UseFormOptions<T, S>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  // Validate the entire form
  const validateForm = useCallback(() => {
    try {
      schema.parse(formState.values);
      setFormState(prev => ({
        ...prev,
        errors: {},
        isValid: true,
      }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.');
          errors[path] = issue.message;
        });
        
        setFormState(prev => ({
          ...prev,
          errors,
          isValid: false,
        }));
      }
      return false;
    }
  }, [schema, formState.values]);

  // Validate a single field
  const validateField = useCallback((name: string, value: unknown) => {
    try {
      // Get the nested value from formState for context
      const pathParts = name.split('.');
      
      // For nested validation, we need the full object context
      if (pathParts.length > 1) {
        const testValues = { ...formState.values } as Record<string, unknown>;
        let current: Record<string, unknown> = testValues;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]] as Record<string, unknown>;
        }
        current[pathParts[pathParts.length - 1]] = value;
        
        // Validate the entire form with this updated value
        schema.parse(testValues);
      } else {
        // For top-level fields, validate with updated value
        schema.parse({ ...formState.values, [name]: value });
      }
      
      setFormState(prev => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: undefined
        }
      }));
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find the error for this specific field
        const fieldError = error.issues.find(issue => 
          issue.path.join('.') === name
        );
        
        if (fieldError) {
          setFormState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [name]: fieldError.message
            }
          }));
        }
      }
      return false;
    }
  }, [schema, formState.values]);

  // Handle field change
  const handleChange = useCallback((name: string, value: unknown) => {
    setFormState(prev => {
      const newValues = { ...prev.values } as Record<string, unknown>;
      
      // Handle nested fields (e.g., "address.street")
      if (name.includes('.')) {
        const pathParts = name.split('.');
        let current: Record<string, unknown> = newValues;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          } else {
            current[pathParts[i]] = { ...current[pathParts[i]] as Record<string, unknown> };
          }
          current = current[pathParts[i]] as Record<string, unknown>;
        }
        current[pathParts[pathParts.length - 1]] = value;
      } else {
        // Handle regular fields
        newValues[name] = value;
      }
      
      return {
        ...prev,
        values: newValues as Partial<T>,
        touched: {
          ...prev.touched,
          [name]: true
        },
        isDirty: true
      };
    });

    if (validateOnChange) {
      // Use setTimeout to ensure state is updated before validation
      setTimeout(() => validateField(name, value), 0);
    }
  }, [validateOnChange, validateField]);

  // Handle field blur
  const handleBlur = useCallback((name: string) => {
    setFormState(prev => ({
      ...prev,
      touched: {
        ...prev.touched,
        [name]: true
      }
    }));

    if (validateOnBlur) {
      const pathParts = name.split('.');
      let fieldValue: unknown = formState.values;
      
      for (const part of pathParts) {
        fieldValue = (fieldValue as Record<string, unknown>)?.[part];
      }
      
      validateField(name, fieldValue);
    }
  }, [validateOnBlur, validateField, formState.values]);

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    setFormState(prev => {
      const allTouched: Record<string, boolean> = {};
      const markTouched = (obj: Record<string, unknown>, prefix = '') => {
        Object.keys(obj).forEach(key => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            markTouched(obj[key] as Record<string, unknown>, path);
          } else {
            allTouched[path] = true;
          }
        });
      };
      markTouched(prev.values as Record<string, unknown>);
      
      return {
        ...prev,
        touched: allTouched,
        isSubmitting: true
      };
    });

    const isValid = validateForm();

    if (isValid && onSubmit) {
      try {
        await onSubmit(formState.values as T);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: false
    }));
  }, [validateForm, onSubmit, formState.values]);

  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false,
    });
  }, [initialValues]);

  // Set a specific field value
  const setFieldValue = useCallback((name: string, value: unknown) => {
    handleChange(name, value);
  }, [handleChange]);

  // Set multiple field values at once
  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: {
        ...prev.values,
        ...values
      },
      isDirty: true
    }));
  }, []);

  // Set a specific error message
  const setFieldError = useCallback((name: string, error?: string) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [name]: error
      }
    }));
  }, []);

  // Validate on mount if needed
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  return {
    // Form state
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
    setFieldError,
    validateForm,
    validateField,
  };
}