import { useState, useCallback } from "react";

import { ApiError, ApiResponse, createApiResponse } from "@/lib/errors";

interface UseApiOptions {
  showErrorToasts?: boolean;
  defaultErrorMessage?: string;
  onError?: (error: ApiError) => void;
}

interface ApiState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: ApiError | null;
  isSuccess: boolean;
}

export function useApi<T = unknown>(options: UseApiOptions = {}) {
  const {
    showErrorToasts = true,
    defaultErrorMessage = "An unexpected error occurred",
    onError,
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: undefined,
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const handleError = useCallback(
    (error: ApiError) => {
      if (showErrorToasts) {
        if (typeof window !== "undefined" && window.document) {
          console.error(`API Error: ${error.message || defaultErrorMessage}`);
        }
      }

      if (onError) {
        onError(error);
      }
    },
    [showErrorToasts, defaultErrorMessage, onError]
  );

  const fetchData = useCallback(
    async (url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
      }));

      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/x-msgpack, application/json;q=0.9",
            ...options.headers,
          },
        });

        const contentType = response.headers.get("Content-Type") || "";
        let data: unknown;

        if (!response.ok) {
          const errorBody = await response.json().catch(() => response.text());
          type ErrorBody = { message?: string };
          const apiError: ApiError = {
            message:
              (errorBody as ErrorBody)?.message ||
              `Error ${response.status}: ${response.statusText}`,
            status: response.status,
            endpoint: url,
            timestamp: new Date().toISOString(),
          };

          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: apiError,
            isSuccess: false,
          }));
          handleError(apiError);
          return createApiResponse<T>(undefined, apiError);
        }

        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        const isApiResponse = (obj: unknown): obj is ApiResponse<T> => {
          return (
            obj !== null &&
            typeof obj === "object" &&
            "success" in obj &&
            ("data" in obj || "error" in obj)
          );
        };

        if (isApiResponse(data)) {
          if (data.error) {
            setState((prev) => ({
              ...prev,
              isLoading: false,
              error: data.error ?? null,
              isSuccess: false,
            }));
            handleError(data.error);
            return data;
          }

          setState((prev) => ({
            ...prev,
            data: data.data,
            isLoading: false,
            error: null,
            isSuccess: true,
          }));
          return data;
        }

        setState((prev) => ({
          ...prev,
          data: data as T,
          isLoading: false,
          error: null,
          isSuccess: true,
        }));
        return createApiResponse<T>(data as T);
      } catch (error) {
        const apiError: ApiError = {
          message: error instanceof Error ? error.message : defaultErrorMessage,
          timestamp: new Date().toISOString(),
          endpoint: url,
        };

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: apiError,
          isSuccess: false,
        }));
        handleError(apiError);
        return createApiResponse<T>(undefined, apiError);
      }
    },
    [handleError, defaultErrorMessage]
  );

  const reset = useCallback(() => {
    setState({
      data: undefined,
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  return {
    ...state,
    fetchData,
    reset,
  };
}
