import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unifitz error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#180d2c] text-white font-lexend px-4 text-center">
          <span className="material-symbols-outlined text-primary-container text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
            fitness_center
          </span>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-white/60 font-jakarta mb-6 max-w-sm">
            Unexpected error. Refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-container text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase glow-pink hover:brightness-110 transition-all"
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
