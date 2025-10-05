"use client";
import React, { Component } from "react";

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<
	{
		children: React.ReactNode;
		fallback?: React.ComponentType<{ error: Error }>;
	},
	ErrorBoundaryState
> {
	constructor(props: {
		children: React.ReactNode;
		fallback?: React.ComponentType<{ error: Error }>;
	}) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error, errorInfo: null };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("🚨 Error Boundary Caught:", error);
		console.error("🚨 Error Info:", errorInfo);
		console.error("🚨 Component Stack:", errorInfo.componentStack);

		this.setState({
			error,
			errorInfo,
		});
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return <FallbackComponent error={this.state.error!} />;
			}

			return (
        <div className="flex justify-center items-center bg-gray-50 p-4 min-h-screen">
          <div className="bg-white shadow-xl p-8 border rounded-xl w-full max-w-md text-center">
            <div className="inline-flex justify-center items-center bg-red-100 mb-4 rounded-full w-16 h-16">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.134 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 font-bold text-gray-900 text-2xl">
              Oops! Something went wrong
            </h2>
            <p className="mb-6 text-gray-600">
              We encountered an unexpected error. Please try reloading the page
              or contact support if the problem persists.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary/90 shadow-sm px-6 py-3 rounded-lg font-medium text-white transition-colors"
                aria-label="Reload page"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700 transition-colors"
                aria-label="Go to home page"
              >
                Go to Home
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer font-semibold text-gray-700 text-sm">
                  Error Details
                </summary>
                <div className="space-y-2 mt-2">
                  <p className="bg-red-50 p-2 rounded font-mono text-red-800 text-xs break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="bg-gray-100 p-2 rounded max-h-32 overflow-auto text-xs">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
