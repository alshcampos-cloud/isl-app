import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // TODO: Send to error tracking service (Sentry, etc.)
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>

            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>

              <button
                onClick={this.handleReset}
                className="w-full text-indigo-600 hover:text-indigo-700 font-medium py-2"
              >
                Try Again
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-red-600 mb-2">
                  {this.state.error.toString()}
                </p>
                <pre className="text-xs font-mono text-gray-600 overflow-auto max-h-32">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-6">
              If this keeps happening, please contact{' '}
              <a href="mailto:support@interviewanswers.ai" className="text-indigo-600 hover:underline">
                support@interviewanswers.ai
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
