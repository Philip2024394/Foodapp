import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 bg-red-900/50 border border-red-500/50 rounded-lg">
            <h1 className="text-2xl font-bold text-red-300">Something went wrong.</h1>
            <p className="text-red-200 mt-2">
                An unexpected error occurred. Please try refreshing the page.
            </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;