import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <h1 className="text-lg font-bold text-destructive mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <a href="/" className="text-primary underline">
            Restart app
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
