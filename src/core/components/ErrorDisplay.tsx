/**
 * ErrorDisplay Component
 * Reusable error display component for showing error messages
 */

import React from 'react';
import { ErrorState, ErrorSeverity } from '@/core/utils/ErrorHandler';

export interface ErrorDisplayProps extends ErrorState {
  onDismiss?: () => void;
  onRetry?: () => void;
  severity?: ErrorSeverity;
}

/**
 * Error display component
 * Shows error message with optional retry button
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  userMessage,
  isRetryable,
  timestamp,
  onDismiss,
  onRetry,
  severity = ErrorSeverity.Error,
}) => {
  if (!error) return null;

  const severityClass = {
    [ErrorSeverity.Info]: 'bg-blue-50 border-blue-200 text-blue-800',
    [ErrorSeverity.Warning]: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    [ErrorSeverity.Error]: 'bg-red-50 border-red-200 text-red-800',
    [ErrorSeverity.Critical]: 'bg-red-100 border-red-400 text-red-900',
  }[severity];

  return (
    <div className={`border rounded-md p-4 mb-4 ${severityClass}`} role="alert" aria-live="polite">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Error</h3>
          <p className="text-sm mb-2">{userMessage || error.message}</p>
          {timestamp && <p className="text-xs opacity-75">{timestamp.toLocaleTimeString()}</p>}
        </div>

        <button
          onClick={onDismiss}
          className="ml-2 text-current opacity-70 hover:opacity-100"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>

      {isRetryable && onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1 bg-opacity-20 bg-current rounded text-sm font-medium hover:bg-opacity-30 transition"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};
