import { useState, useCallback } from "react";
import { ApiError, ApiResponse, createApiResponse } from "@/lib/errors";

interface UseApiOptions {
  /**
   * Enable automatic error toasts
   * @default true
   */
  showErrorToasts?: boolean;
  
  /**
   * Default error message when no specific message is available
   * @default "An unexpected error occurred"
   */
  defaultErrorMessage?: string;
  
  /**
   * Callback for handling errors
   */
  onError?: (error: ApiError) => void;
}

interface ApiState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ApiError | null;
  isSuccess: boolean;
}

/**
 * Hook for making API calls with consistent error handling
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, fetchData } = useApi<Product[]>();
 * 
 * // Simple GET request
 * useEffect(() => {
 *   fetchData('/api/products');
 * }, [fetchData]);
 * 
 * // POST request with body
 * const handleSubmit = () => {
 *   fetchData('/api/products', {
 *     method: 'POST',
 *     body: JSON.stringify({ name: 'New Product' })
 *   });
 * };
 * ```
 */
export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const {
    showErrorToasts = true,
    defaultErrorMessage = "An unexpected error occurred",
    onError
  } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const handleError = useCallback((error: ApiError) => {
    if (showErrorToasts) {
      // Use toast notification system if available
      if (typeof window !== 'undefined' && window.document) {
        console.error(`API Error: ${error.message || defaultErrorMessage}`);
        // You could integrate with your toast system here
        // toast.error(error.message || defaultErrorMessage);
      }
    }
    
    if (onError) {
      onError(error);
    }
  }, [showErrorToasts, defaultErrorMessage, onError]);

  const fetchData = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, isLoading: true, error: null, isSuccess: false }));
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const contentType = response.headers.get('Content-Type') || '';
      let data: unknown;
      
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const apiError: ApiError = {
          message: (data as { message?: string })?.message || `Error ${response.status}: ${response.statusText}`,
          status: response.status,
          endpoint: url,
          timestamp: new Date().toISOString()
        };
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: apiError,
          isSuccess: false
        }));
        
        handleError(apiError);
        return createApiResponse<T>(undefined, apiError);
      }

      // Type guard for ApiResponse format
      const isApiResponse = (obj: unknown): obj is ApiResponse<T> => {
        return (
          obj !== null &&
          typeof obj === 'object' &&
          'success' in obj &&
          ('data' in obj || 'error' in obj)
        );
      };

      // Handle responses that are already in ApiResponse format
      if (isApiResponse(data)) {
        if (data.error) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: data.error ?? null,
            isSuccess: false
          }));
          
          handleError(data.error);
          return data;
        }
        
        setState(prev => ({ 
          ...prev, 
          data: data.data, 
          isLoading: false, 
          error: null,
          isSuccess: true
        }));
        
        return data;
      }
      
      // Handle regular JSON responses
      setState(prev => ({ 
        ...prev, 
        data: data as T, 
        isLoading: false, 
        error: null,
        isSuccess: true
      }));
      
      return createApiResponse<T>(data as T);
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : defaultErrorMessage,
        timestamp: new Date().toISOString(),
        endpoint: url
      };
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: apiError,
        isSuccess: false
      }));
      
      handleError(apiError);
      return createApiResponse<T>(undefined, apiError);
    }
  }, [handleError, defaultErrorMessage]);

  const reset = useCallback(() => {
    setState({
      data: undefined,
      isLoading: false,
      error: null,
      isSuccess: false
    });
  }, []);

  return {
    ...state,
    fetchData,
    reset
  };
}