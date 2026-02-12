import { useState, useCallback, useEffect } from 'react';

interface AppLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

const MAX_LOGS = 500;
const STORAGE_KEY = 'app_logs';

type GlobalLoggerState = typeof globalThis & {
  __APP_LOGGER__?: AppLogger;
  __APP_LOGGER_PATCHED__?: boolean;
  __APP_LOGGER_CONSOLE_ORIGINALS__?: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    debug: typeof console.debug;
  };
};

class AppLogger {
  private logs: AppLog[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    this.interceptConsole();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      // Error al cargar, continuar con array vacío
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
    } catch {
      // Error al guardar, continuar
    }
  }

  private interceptConsole() {
    const globalState = globalThis as GlobalLoggerState;
    if (globalState.__APP_LOGGER_PATCHED__) return;

    const originals = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };
    globalState.__APP_LOGGER_CONSOLE_ORIGINALS__ = originals;
    globalState.__APP_LOGGER_PATCHED__ = true;

    console.log = (...args) => {
      originals.log(...args);
      this.add('info', args.map((arg) => String(arg)).join(' '));
    };

    console.warn = (...args) => {
      originals.warn(...args);
      this.add('warn', args.map((arg) => String(arg)).join(' '));
    };

    console.error = (...args) => {
      originals.error(...args);
      this.add('error', args.map((arg) => String(arg)).join(' '));
    };

    console.debug = (...args) => {
      originals.debug(...args);
      this.add('debug', args.map((arg) => String(arg)).join(' '));
    };
  }

  add(level: 'info' | 'warn' | 'error' | 'debug', message: string) {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    this.logs.push({
      timestamp,
      level,
      message,
    });

    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS);
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  getLogs(): AppLog[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Error al limpiar, continuar
    }
    this.notifyListeners();
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      queueMicrotask(() => callback());
    });
  }
}

const globalState = globalThis as GlobalLoggerState;
const appLogger = (globalState.__APP_LOGGER__ ??= new AppLogger());

export function useAppLogs() {
  const [logs, setLogs] = useState<AppLog[]>([]);

  const refresh = useCallback(() => {
    setLogs(appLogger.getLogs());
  }, []);

  const clear = useCallback(() => {
    appLogger.clear();
    setLogs([]);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = appLogger.subscribe(refresh);
    return unsubscribe;
  }, [refresh]);

  return {
    logs,
    refresh,
    clear,
  };
}

export { appLogger };
