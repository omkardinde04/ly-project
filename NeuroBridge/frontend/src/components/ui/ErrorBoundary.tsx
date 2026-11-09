import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleRecover = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile_picture && parsed.profile_picture.length > 200000) {
          delete parsed.profile_picture;
          localStorage.setItem('auth_user', JSON.stringify(parsed));
        }
      }
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-blue-100 shadow-xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center text-3xl font-black">
              ⚠️
            </div>
            <h1 className="text-2xl font-black text-[#1A202C]">Something went wrong</h1>
            <p className="text-sm text-[#64748B]">
              The page encountered an unexpected issue. You can reload to recover safely.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRecover}
                className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl transition-colors text-sm shadow-md"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/dashboard';
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#1A202C] font-bold rounded-xl transition-colors text-sm"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

