'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-8 text-center space-y-6">
            <div className="bg-destructive/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Something went wrong</h2>
              <p className="text-sm text-muted-foreground font-medium">
                An unexpected error occurred. Your data is safe — try refreshing the page.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                className="rounded-full font-black uppercase text-xs px-6"
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => { this.setState({ hasError: false, error: null }); }}
                className="rounded-full font-black uppercase text-xs px-6"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
