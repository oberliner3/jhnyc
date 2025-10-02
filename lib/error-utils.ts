import { ApiError } from "./errors";

/**
 * Formats an API error message for display
 * @param error The API error object
 * @param fallbackMessage Default message if error doesn't have one
 */
export function formatErrorMessage(
  error: ApiError | null | undefined,
  fallbackMessage = "An unexpected error occurred"
): string {
  if (!error) return fallbackMessage;
  
  // Return the error message or fallback
  return error.message || fallbackMessage;
}

/**
 * Determines if an error is a specific HTTP status code
 * @param error The API error object
 * @param statusCode The HTTP status code to check
 */
export function isErrorStatus(
  error: ApiError | null | undefined,
  statusCode: number
): boolean {
  return error?.status === statusCode;
}

/**
 * Checks if the error is a validation error (typically 400 Bad Request)
 * @param error The API error object
 */
export function isValidationError(error: ApiError | null | undefined): boolean {
  return error?.status === 400 || error?.code === "validation_error";
}

/**
 * Checks if the error is an authentication error (401 Unauthorized)
 * @param error The API error object
 */
export function isAuthError(error: ApiError | null | undefined): boolean {
  return error?.status === 401 || error?.code === "unauthorized";
}

/**
 * Checks if the error is a permission error (403 Forbidden)
 * @param error The API error object
 */
export function isPermissionError(error: ApiError | null | undefined): boolean {
  return error?.status === 403 || error?.code === "forbidden";
}

/**
 * Checks if the error is a not found error (404 Not Found)
 * @param error The API error object
 */
export function isNotFoundError(error: ApiError | null | undefined): boolean {
  return error?.status === 404 || error?.code === "not_found";
}

/**
 * Checks if the error is a server error (500 Internal Server Error)
 * @param error The API error object
 */
export function isServerError(error: ApiError | null | undefined): boolean {
  return error?.status === 500 || (!!error?.status && error.status >= 500);
}

/**
 * Gets appropriate error message based on error type
 * @param error The API error object
 */
export function getErrorMessage(error: ApiError | null | undefined): string {
  if (!error) return "An unexpected error occurred";
  
  if (isAuthError(error)) {
    return "You need to sign in to access this resource";
  }
  
  if (isPermissionError(error)) {
    return "You don't have permission to access this resource";
  }
  
  if (isNotFoundError(error)) {
    return "The requested resource was not found";
  }
  
  if (isServerError(error)) {
    return "A server error occurred. Please try again later";
  }
  
  return error.message || "An unexpected error occurred";
}