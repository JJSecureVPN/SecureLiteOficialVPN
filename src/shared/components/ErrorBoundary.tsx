import { Component, type ErrorInfo, type ReactNode } from 'react';
import { UI_MESSAGES } from '../../constants';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary para capturar errores en componentes hijos
 * Previene que toda la app crashee por un error en un componente
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error capturado por ErrorBoundary:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <i className="fa fa-exclamation-triangle" />
            <h2>{UI_MESSAGES.errorBoundary.title}</h2>
            <p className="muted">
              {this.state.error?.message || UI_MESSAGES.errorBoundary.fallback}
            </p>
            <button className="btn primary" onClick={this.handleRetry}>
              {UI_MESSAGES.errorBoundary.retry}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
