'use client'
import React, {Component} from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary Caught:', error);
    console.error('🚨 Error Info:', errorInfo);
    console.error('🚨 Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} />;
      }

      return (
        <div className="flex justify-center items-center bg-red-50 p-4 min-h-screen">
          <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-2xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 mr-3 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.134 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="font-bold text-red-800 text-xl">Something went wrong</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-gray-700">Error Message:</h3>
                <p className="bg-gray-100 p-3 rounded font-mono text-sm">
                  {this.state.error?.message || 'Unknown error'}
                </p>
              </div>
              
              <div>
                <h3 className="mb-2 font-semibold text-gray-700">Error Stack:</h3>
                <pre className="bg-gray-100 p-3 rounded max-h-40 overflow-auto text-xs">
                  {this.state.error?.stack}
                </pre>
              </div>
              
              {this.state.errorInfo && (
                <div>
                  <h3 className="mb-2 font-semibold text-gray-700">Component Stack:</h3>
                  <pre className="bg-gray-100 p-3 rounded max-h-40 overflow-auto text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;