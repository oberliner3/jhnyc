"use client";

import { z } from "zod";
import { useForm } from "@/hooks/use-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorBoundaryWrapper } from "@/components/common/with-error-boundary";

// Define the form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function FormExample() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm<ContactFormValues, typeof contactFormSchema>({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    schema: contactFormSchema,
    onSubmit: async (values) => {
      // Simulate API call
      console.log("Form submitted:", values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Form submitted successfully!");
      resetForm();
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  return (
    <ErrorBoundaryWrapper>
      <div className="bg-white shadow-md mx-auto p-6 rounded-lg max-w-md">
        <h2 className="mb-6 font-bold text-2xl">Contact Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={values.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => handleBlur("name")}
              className={errors.name && touched.name ? "border-red-500" : ""}
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={values.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => handleBlur("email")}
              className={errors.email && touched.email ? "border-red-500" : ""}
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={values.message || ""}
              onChange={(e) => handleChange("message", e.target.value)}
              onBlur={() => handleBlur("message")}
              className={`w-full p-2 border rounded-md ${
                errors.message && touched.message ? "border-red-500" : "border-gray-300"
              }`}
              rows={4}
            />
            {errors.message && touched.message && (
              <p className="mt-1 text-red-500 text-sm">{errors.message}</p>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !isValid}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </ErrorBoundaryWrapper>
  );
}