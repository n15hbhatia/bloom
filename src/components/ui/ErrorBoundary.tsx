import { Component, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

/** Keeps a single broken view from blanking the whole app. Your data is never touched. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('BLOOM view error:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-medium text-deep">Something didn’t grow quite right</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">This view hit a snag. Your garden and entries are safe — they’re stored separately.</p>
        <button
          className="btn-primary mt-6"
          onClick={() => {
            this.setState({ error: null });
            window.location.hash = '#/';
          }}
        >
          Back to my garden
        </button>
      </div>
    );
  }
}
