import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Could send to error tracking service here
    // e.g., Sentry.captureException(error)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
              >
                Go Home
              </button>
            </div>
          </div>
          
          <style>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 400px;
              padding: 2rem;
            }
            
            .error-boundary-content {
              text-align: center;
              max-width: 500px;
            }
            
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            
            .error-boundary h2 {
              margin: 0 0 0.5rem;
              color: #1a1a1a;
              font-size: 1.5rem;
            }
            
            .error-boundary p {
              color: #666;
              margin-bottom: 1.5rem;
            }
            
            .error-details {
              text-align: left;
              background: #f5f5f5;
              border-radius: 8px;
              padding: 1rem;
              margin-bottom: 1.5rem;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            
            .error-details pre {
              font-size: 0.75rem;
              overflow-x: auto;
              margin: 0.5rem 0;
              white-space: pre-wrap;
              word-break: break-word;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
            }
            
            .error-actions .btn {
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .error-actions .btn-primary {
              background: #6366f1;
              color: white;
              border: none;
            }
            
            .error-actions .btn-primary:hover {
              background: #4f46e5;
            }
            
            .error-actions .btn-secondary {
              background: white;
              color: #1a1a1a;
              border: 1px solid #ddd;
            }
            
            .error-actions .btn-secondary:hover {
              background: #f5f5f5;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
