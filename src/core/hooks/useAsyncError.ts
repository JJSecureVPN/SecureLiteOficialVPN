/**
 * useAsyncError Hook
 * Manages error state for async operations
 */

import { useState, useCallback, useRef } from 'react';
import { ErrorHandler, ErrorCategory, ErrorState, initialErrorState } from '../utils/ErrorHandler';

export interface UseAsyncErrorReturn extends ErrorState {
  setError: (error: unknown, category?: ErrorCategory) => void;
  clearError: () => void;
  handleAsyncError: <T>(fn: () => Promise<T>, category?: ErrorCategory) => Promise<T | null>;
}

/**
 * Hook for managing error state in async operations
 * Provides error handling, classification, and state management
 */
export function useAsyncError(): UseAsyncErrorReturn {
  const [errorState, setErrorState] = useState<ErrorState>(initialErrorState);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setError = useCallback((error: unknown, category?: ErrorCategory) => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    const actualError = error instanceof Error ? error : new Error(String(error));
    const errorCategory = category || ErrorHandler.classify(error);
    const userMessage = ErrorHandler.getUserMessage(error);
    const isRetryable = ErrorHandler.isRetryable(error);

    // Log the error
    ErrorHandler.log(error, { category: errorCategory });

    setErrorState({
      error: actualError,
      category: errorCategory,
      userMessage,
      isRetryable,
      timestamp: new Date(),
    });
  }, []);

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setErrorState(initialErrorState);
  }, []);

  const handleAsyncError = useCallback(
    async <T>(fn: () => Promise<T>, category?: ErrorCategory): Promise<T | null> => {
      try {
        clearError();
        return await fn();
      } catch (error) {
        setError(error, category);
        return null;
      }
    },
    [setError, clearError],
  );

  return {
    ...errorState,
    setError,
    clearError,
    handleAsyncError,
  };
}

/**
 * Hook for managing error state with retry logic
 */
export function useAsyncErrorWithRetry(
  onRetry?: () => void,
  maxRetries = 3,
): UseAsyncErrorReturn & {
  retry: () => Promise<void>;
  canRetry: () => boolean;
  retryCount: number;
} {
  const [retryCount, setRetryCount] = useState(0);
  const baseError = useAsyncError();

  const canRetry = useCallback((): boolean => {
    return baseError.isRetryable && retryCount < maxRetries;
  }, [baseError.isRetryable, retryCount, maxRetries]);

  const retry = useCallback(async () => {
    if (!canRetry()) return;

    setRetryCount((prev) => prev + 1);
    baseError.clearError();

    // Exponential backoff: 1s, 2s, 4s
    const delayMs = Math.pow(2, retryCount - 1) * 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    onRetry?.();
  }, [canRetry, retryCount, baseError, onRetry]);

  return {
    ...baseError,
    retry,
    canRetry: canRetry,
    retryCount,
  };
}
