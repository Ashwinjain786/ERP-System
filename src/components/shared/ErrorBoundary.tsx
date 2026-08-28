import React, { Component, ErrorInfo, ReactNode } from 'react';

import { logReactError } from '@/lib/error-bridge';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // @ts-expect-error - lifecycle method for error boundary  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logReactError(error, errorInfo);
  }

  // @ts-expect-error - render method override
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="text-center space-y-4 max-w-md p-6 bg-card border border-destructive/30 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-destructive font-display">Application Error</h2>
            <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded text-left overflow-auto max-h-40">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
