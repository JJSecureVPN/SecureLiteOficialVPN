/**
 * Centralized Error Handling
 * Provides custom error class and utilities for consistent error management
 */

/**
 * Custom error class for application errors
 * Provides structured error information and context
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly isRetryable: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      context?: Record<string, unknown>;
      isRetryable?: boolean;
    } = {},
  ) {
    super(message);
    this.name = 'AppError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.statusCode = options.statusCode || 500;
    this.context = options.context;
    this.timestamp = new Date();
    this.isRetryable = options.isRetryable ?? false;

    // Proper prototype chain for instanceof
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      isRetryable: this.isRetryable,
    };
  }
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
  Critical = 'critical',
}

/**
 * Error categories for different types of failures
 */
export enum ErrorCategory {
  Validation = 'validation',
  Network = 'network',
  Authentication = 'authentication',
  Authorization = 'authorization',
  NotFound = 'notFound',
  Conflict = 'conflict',
  RateLimit = 'rateLimit',
  Timeout = 'timeout',
  Internal = 'internal',
  Unknown = 'unknown',
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  retryable: boolean;
  logToConsole: boolean;
}

/**
 * Default error configurations by category
 */
const ERROR_CONFIGS: Record<ErrorCategory, Omit<ErrorHandlerConfig, 'userMessage'>> = {
  [ErrorCategory.Validation]: {
    category: ErrorCategory.Validation,
    severity: ErrorSeverity.Warning,
    retryable: false,
    logToConsole: true,
  },
  [ErrorCategory.Network]: {
    category: ErrorCategory.Network,
    severity: ErrorSeverity.Error,
    retryable: true,
    logToConsole: true,
  },
  [ErrorCategory.Authentication]: {
    category: ErrorCategory.Authentication,
    severity: ErrorSeverity.Error,
    retryable: false,
    logToConsole: true,
  },
  [ErrorCategory.Authorization]: {
    category: ErrorCategory.Authorization,
    severity: ErrorSeverity.Warning,
    retryable: false,
    logToConsole: true,
  },
  [ErrorCategory.NotFound]: {
    category: ErrorCategory.NotFound,
    severity: ErrorSeverity.Warning,
    retryable: false,
    logToConsole: false,
  },
  [ErrorCategory.Conflict]: {
    category: ErrorCategory.Conflict,
    severity: ErrorSeverity.Warning,
    retryable: true,
    logToConsole: true,
  },
  [ErrorCategory.RateLimit]: {
    category: ErrorCategory.RateLimit,
    severity: ErrorSeverity.Warning,
    retryable: true,
    logToConsole: true,
  },
  [ErrorCategory.Timeout]: {
    category: ErrorCategory.Timeout,
    severity: ErrorSeverity.Error,
    retryable: true,
    logToConsole: true,
  },
  [ErrorCategory.Internal]: {
    category: ErrorCategory.Internal,
    severity: ErrorSeverity.Critical,
    retryable: false,
    logToConsole: true,
  },
  [ErrorCategory.Unknown]: {
    category: ErrorCategory.Unknown,
    severity: ErrorSeverity.Error,
    retryable: false,
    logToConsole: true,
  },
};

/**
 * Error handler utility
 * Provides methods for creating, classifying, and handling errors
 */
export const ErrorHandler = {
  /**
   * Create an AppError with automatic configuration
   */
  create(
    message: string,
    category: ErrorCategory = ErrorCategory.Unknown,
    context?: Record<string, unknown>,
  ): AppError {
    const config = ERROR_CONFIGS[category];
    return new AppError(message, {
      code: category,
      statusCode: 500,
      context,
      isRetryable: config.retryable,
    });
  },

  /**
   * Classify an unknown error
   */
  classify(error: unknown): ErrorCategory {
    if (error instanceof AppError) {
      return (error.code as ErrorCategory) || ErrorCategory.Unknown;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('network') || message.includes('fetch')) {
        return ErrorCategory.Network;
      }
      if (message.includes('timeout')) {
        return ErrorCategory.Timeout;
      }
      if (message.includes('unauthorized')) {
        return ErrorCategory.Authentication;
      }
      if (message.includes('forbidden')) {
        return ErrorCategory.Authorization;
      }
      if (message.includes('not found')) {
        return ErrorCategory.NotFound;
      }
    }

    return ErrorCategory.Unknown;
  },

  /**
   * Get user-friendly message for an error
   */
  getUserMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
    if (error instanceof AppError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return fallback;
  },

  /**
   * Check if an error is retryable
   */
  isRetryable(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isRetryable;
    }

    const category = this.classify(error);
    return ERROR_CONFIGS[category].retryable;
  },

  /**
   * Log error with context
   */
  log(error: unknown, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();

    if (error instanceof AppError) {
      console.error(`[${timestamp}] [${error.code}]`, error.message, {
        ...error.context,
        ...context,
      });
    } else if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR]`, error.message, context);
    } else {
      console.error(`[${timestamp}] [ERROR]`, error, context);
    }
  },
};

/**
 * Error handler state for UI components
 */
export interface ErrorState {
  error: Error | null;
  category: ErrorCategory;
  userMessage: string;
  isRetryable: boolean;
  timestamp: Date | null;
}

/**
 * Initial error state
 */
export const initialErrorState: ErrorState = {
  error: null,
  category: ErrorCategory.Unknown,
  userMessage: '',
  isRetryable: false,
  timestamp: null,
};
