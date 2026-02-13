import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LanguageContext } from '../../i18n/context';

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
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

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
    const t = this.context?.t ?? ((k: string) => k);

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <i className="fa fa-exclamation-triangle" />
            <h2>{t('errorBoundary.title')}</h2>
            <p className="muted">{this.state.error?.message || t('errorBoundary.fallback')}</p>
            <button className="btn primary" onClick={this.handleRetry}>
              {t('errorBoundary.retry')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
