/**
 * Centralized Logger
 * Provides consistent logging across the application with environment-aware behavior
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Format log message with context
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Send error to monitoring service (placeholder for future implementation)
 */
function sendToMonitoring(level: LogLevel, message: string, context?: LogContext) {
  // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
  // For now, just log to console in production
  if (isProduction) {
    console.error(formatMessage(level, message, context));
  }
}

/**
 * Centralized logger with environment-aware behavior
 */
export const logger = {
  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.debug(formatMessage("debug", message, context));
    }
  },

  /**
   * Info logs - only in development
   */
  info(message: string, context?: LogContext) {
    if (isDevelopment) {
      console.info(formatMessage("info", message, context));
    }
  },

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext) {
    console.warn(formatMessage("warn", message, context));
    if (isProduction) {
      sendToMonitoring("warn", message, context);
    }
  },

  /**
   * Error logs - always logged and sent to monitoring
   */
  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    console.error(formatMessage("error", message, errorContext));
    sendToMonitoring("error", message, errorContext);
  },

  /**
   * API request logging - only in development
   */
  api(method: string, url: string, status?: number, duration?: number) {
    if (isDevelopment) {
      const message = `${method} ${url}`;
      const context = { status, duration: duration ? `${duration}ms` : undefined };
      console.log(formatMessage("info", message, context));
    }
  },

  /**
   * Performance logging - only in development
   */
  perf(label: string, duration: number) {
    if (isDevelopment) {
      console.log(formatMessage("debug", `⚡ ${label}`, { duration: `${duration}ms` }));
    }
  },
};

/**
 * Performance measurement utility
 */
export function measurePerformance<T>(
  label: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const duration = performance.now() - start;
      logger.perf(label, duration);
    }) as T;
  }

  const duration = performance.now() - start;
  logger.perf(label, duration);
  return result;
}

