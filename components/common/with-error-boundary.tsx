"use client";

import React from "react";
import ErrorBoundary from "./error-boundary";

interface WithErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  id?: string;
}

/**
 * Higher-order component that wraps components with an ErrorBoundary
 * Provides a consistent way to handle errors across the application
 * 
 * @param Component - The component to wrap with an error boundary
 * @param options - Configuration options for the error boundary
 * @returns A new component wrapped with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: WithErrorBoundaryProps = {}
): React.FC<P> {
  const { fallback } = options;
  
  const displayName = Component.displayName || Component.name || "Component";
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `WithErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

/**
 * Component that provides an error boundary wrapper
 * Useful for wrapping sections of your application with error boundaries
 */
export function ErrorBoundaryWrapper({
  children,
  fallback,

}: {
  children: React.ReactNode;
} & WithErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}