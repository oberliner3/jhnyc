// Enhanced error handling types and utilities

export interface ApiError {
	message: string;
	status?: number;
	code?: string;
	endpoint?: string;
	timestamp?: string;
}

export interface IValidationError {
	field: string;
	message: string;
	code: string;
}

export interface ApiResponse<T> {
	data?: T;
	error?: ApiError;
	success: boolean;
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: ApiError;
	success: boolean;
}

export class ApiClientError extends Error {
	public status?: number;
	public code?: string;
	public endpoint: string;
	public timestamp: string;

	constructor(
		message: string,
		status?: number,
		code?: string,
		endpoint: string = "",
	) {
		super(message);
		this.name = "ApiClientError";
		this.status = status;
		this.code = code;
		this.endpoint = endpoint;
		this.timestamp = new Date().toISOString();
	}

	toJSON(): ApiError {
		return {
			message: this.message,
			status: this.status,
			code: this.code,
			endpoint: this.endpoint,
			timestamp: this.timestamp,
		};
	}
}

export class ValidationError extends Error {
	public errors: IValidationError[];

	constructor(errors: IValidationError[]) {
		const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
		super(message);
		this.name = "ValidationError";
		this.errors = errors;
	}
}

export class ShopifyApiError extends Error {
	public status?: number;
	public details?: Record<string, unknown>;

	constructor(
		message: string,
		status?: number,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = "ShopifyApiError";
		this.status = status;
		this.details = details;
	}
}

// Error logging utility
export function logError(
	error: Error,
	context?: Record<string, unknown>,
): void {
	const timestamp = new Date().toISOString();
	const errorInfo = {
		timestamp,
		name: error.name,
		message: error.message,
		stack: error.stack,
		...context,
	};

	if (process.env.NODE_ENV === "development") {
		console.error("🚨 Error:", errorInfo);
	} else {
		// In production, you might want to send to a logging service
		console.error(JSON.stringify(errorInfo));
	}
}

// Utility to create standardized API responses
export function createApiResponse<T>(
	data?: T,
	error?: ApiError,
): ApiResponse<T> {
	return {
		data,
		error,
		success: !error,
	};
}

export function createPaginatedResponse<T>(
	data: T[],
	pagination: PaginatedResponse<T>["pagination"],
	error?: ApiError,
): PaginatedResponse<T> {
	return {
		data,
		pagination,
		error,
		success: !error,
	};
}

// HTTP status codes
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	CONFLICT: 409,
	UNPROCESSABLE_ENTITY: 422,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
} as const;
