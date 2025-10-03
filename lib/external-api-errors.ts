/**
 * Enhanced error handling for external API calls
 * Provides retry logic, circuit breaker pattern, and detailed error reporting
 */

export class ExternalApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public retryable: boolean = false,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ExternalApiError';
  }
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: Error) => boolean;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
}

// Circuit breaker state
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

// Global circuit breaker state
const circuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Enhanced retry logic with exponential backoff and jitter
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = (error) => {
      // Retry on network errors, timeouts, and 5xx errors
      if (error instanceof ExternalApiError) {
        return error.retryable || error.status >= 500;
      }
      return true;
    }
  } = options;

  let lastError: Error = new Error('Unknown error during retry operation');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries || !retryCondition(error as Error)) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      );
      const jitter = Math.random() * 0.1 * delay; // 10% jitter
      const totalDelay = delay + jitter;
      
      console.log(`🔄 Retry attempt ${attempt}/${maxRetries} after ${totalDelay.toFixed(0)}ms`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * Circuit breaker pattern implementation
 */
export async function withCircuitBreaker<T>(
  key: string,
  fn: () => Promise<T>,
  options: CircuitBreakerOptions = {}
): Promise<T> {
  const {
    failureThreshold = 5,
    resetTimeout = 60000, // 1 minute
    monitoringPeriod = 300000 // 5 minutes
  } = options;

  const now = Date.now();
  let state = circuitBreakers.get(key) || {
    failures: 0,
    lastFailureTime: 0,
    state: 'CLOSED' as const
  };

  // Reset failures if monitoring period has passed
  if (now - state.lastFailureTime > monitoringPeriod) {
    state.failures = 0;
  }

  // Check circuit breaker state
  if (state.state === 'OPEN') {
    if (now - state.lastFailureTime > resetTimeout) {
      state.state = 'HALF_OPEN';
      console.log(`🔓 Circuit breaker ${key} moved to HALF_OPEN`);
    } else {
      throw new ExternalApiError(
        `Circuit breaker ${key} is OPEN`,
        503,
        key,
        false
      );
    }
  }

  try {
    const result = await fn();
    
    // Success - reset circuit breaker
    if (state.state === 'HALF_OPEN') {
      state.state = 'CLOSED';
      state.failures = 0;
      console.log(`✅ Circuit breaker ${key} reset to CLOSED`);
    }
    
    return result;
  } catch (error) {
    state.failures++;
    state.lastFailureTime = now;
    
    if (state.failures >= failureThreshold) {
      state.state = 'OPEN';
      console.log(`🔒 Circuit breaker ${key} moved to OPEN (${state.failures} failures)`);
    }
    
    circuitBreakers.set(key, state);
    throw error;
  }
}

/**
 * Enhanced fetch with retry and circuit breaker
 */
export async function resilientFetch(
  url: string,
  options: RequestInit = {},
  circuitBreakerKey?: string
): Promise<Response> {
  const fetchWithRetry = () => withRetry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorBody = await response.text();
        throw new ExternalApiError(
          `HTTP ${response.status}: ${errorBody}`,
          response.status,
          url,
          response.status >= 500, // Retry on 5xx errors
        );
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ExternalApiError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ExternalApiError(
            'Request timeout',
            408,
            url,
            true,
            error
          );
        }
        
        throw new ExternalApiError(
          `Network error: ${error.message}`,
          0,
          url,
          true,
          error
        );
      }
      
      throw new ExternalApiError(
        'Unknown error',
        0,
        url,
        true,
        error as Error
      );
    }
  });

  if (circuitBreakerKey) {
    return withCircuitBreaker(circuitBreakerKey, fetchWithRetry);
  }
  
  return fetchWithRetry();
}

/**
 * Health check for external APIs
 */
export async function checkApiHealth(
  url: string,
  timeout: number = 5000
): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    return {
      healthy: response.ok,
      latency,
      error: response.ok ? undefined : `HTTP ${response.status}`
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached, waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Global rate limiter for external API calls
 */
export const externalApiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

/**
 * Enhanced external API call with all protections
 */
export async function callExternalApi<T>(
  url: string,
  options: RequestInit = {},
  circuitBreakerKey?: string
): Promise<T> {
  // Apply rate limiting
  await externalApiRateLimiter.waitIfNeeded();
  
  const response = await resilientFetch(url, options, circuitBreakerKey);
  
  const contentType = response.headers.get('Content-Type');
  
  if (contentType?.includes('application/x-msgpack')) {
    const arrayBuffer = await response.arrayBuffer();
    const { decode } = await import('msgpack-javascript');
    return decode(arrayBuffer) as T;
  }
  
  return response.json();
}