"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { formatErrorMessage, isNotFoundError } from "@/lib/error-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { withErrorBoundary } from "@/components/common/with-error-boundary";
import type { ApiProduct } from "@/lib/types";

/**
 * Example component demonstrating the useApi hook with error handling
 */
function ApiExampleComponent() {
  const [productId, setProductId] = useState<string>("1");
  
  // Using the useApi hook for fetching a product
  const {
    data: product,
    isLoading,
    error,
    fetchData,
    reset
  } = useApi<ApiProduct>();

  // Fetch product on component mount or when productId changes
  useEffect(() => {
    fetchData(`/api/products/${productId}`);
  }, [fetchData, productId]);

  // Function to fetch a random product
  const fetchRandomProduct = () => {
    const randomId = Math.floor(Math.random() * 10) + 1;
    setProductId(randomId.toString());
  };

  // Function to simulate an error
  const simulateError = () => {
    fetchData("/api/products/invalid-id");
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>API Example with Error Handling</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 my-4 p-4 border border-red-200 rounded-md">
            <h3 className="font-medium text-red-800">Error</h3>
            <p className="mt-1 text-red-700">
              {isNotFoundError(error) 
                ? `Product not found: ${productId}` 
                : formatErrorMessage(error)}
            </p>
            {error.status && (
              <p className="mt-1 text-red-600 text-sm">Status: {error.status}</p>
            )}
          </div>
        ) : product ? (
          <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-md aspect-square overflow-hidden">
              {product.images && product.images[0] && (
                <img 
                  src={product.images[0].src} 
                  alt={product.title || "Product"} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <h3 className="font-medium text-lg">{product.title}</h3>
            <p className="text-gray-500">{product.body_html}</p>
            <p className="font-bold">${product.price}</p>
          </div>
        ) : (
          <p className="py-8 text-gray-500 text-center">No product data available</p>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button onClick={fetchRandomProduct} disabled={isLoading}>
          Fetch Random Product
        </Button>
        <Button 
          onClick={simulateError} 
          variant="outline" 
          disabled={isLoading}
        >
          Simulate Error
        </Button>
      </CardFooter>
    </Card>
  );
}

// Wrap the component with error boundary for additional protection
export default withErrorBoundary(ApiExampleComponent);