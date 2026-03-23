type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  includeStackTrace: boolean;
  sanitizeData: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const config: LoggerConfig = {
  enabled: isDevelopment,
  minLevel: isDevelopment ? 'debug' : 'error',
  includeStackTrace: isDevelopment,
  sanitizeData: isProduction,
};

function sanitizeError(error: unknown): string {
  if (isProduction) {
    return 'An error occurred';
  }

  if (error instanceof Error) {
    return isDevelopment ? error.message : 'An error occurred';
  }

  return 'An error occurred';
}

function sanitizeData(data: unknown): unknown {
  if (!config.sanitizeData) {
    return data;
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      if (
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('key') ||
        lowerKey.includes('auth')
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey.includes('email')) {
        sanitized[key] = typeof value === 'string' ? value.replace(/(.{2}).*(@.*)/, '$1***$2') : value;
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return data;
}

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled) {
    return false;
  }

  return LOG_LEVELS[level] <= LOG_LEVELS[config.minLevel];
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const sanitized = data ? sanitizeData(data) : undefined;

  if (isDevelopment) {
    return sanitized
      ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(sanitized)}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  return message;
}

export const logger = {
  error(message: string, error?: unknown, data?: unknown): void {
    if (!shouldLog('error')) {
      return;
    }

    const sanitizedError = error ? sanitizeError(error) : undefined;
    const errorMessage = sanitizedError ? `${message}: ${sanitizedError}` : message;

    if (isDevelopment) {
      console.error(formatMessage('error', errorMessage, data));

      if (error instanceof Error && config.includeStackTrace) {
        console.error(error.stack);
      }
    } else {
      console.error(formatMessage('error', errorMessage));
    }
  },

  warn(message: string, data?: unknown): void {
    if (!shouldLog('warn')) {
      return;
    }

    if (isDevelopment) {
      console.warn(formatMessage('warn', message, data));
    }
  },

  info(message: string, data?: unknown): void {
    if (!shouldLog('info')) {
      return;
    }

    if (isDevelopment) {
      console.info(formatMessage('info', message, data));
    }
  },

  debug(message: string, data?: unknown): void {
    if (!shouldLog('debug')) {
      return;
    }

    if (isDevelopment) {
      console.debug(formatMessage('debug', message, data));
    }
  },

  setConfig(newConfig: Partial<LoggerConfig>): void {
    Object.assign(config, newConfig);
  },

  getConfig(): Readonly<LoggerConfig> {
    return { ...config };
  },
};

export function createErrorBoundaryLogger() {
  return {
    logError(error: Error, errorInfo: { componentStack: string }): void {
      if (isDevelopment) {
        logger.error('React Error Boundary caught an error', error, {
          componentStack: errorInfo.componentStack,
        });
      } else {
        logger.error('Application error occurred');
      }
    },
  };
}

export function sanitizeURLForLogging(url: string): string {
  try {
    const urlObj = new URL(url);

    urlObj.searchParams.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('token') ||
        lowerKey.includes('key') ||
        lowerKey.includes('secret') ||
        lowerKey.includes('password')
      ) {
        urlObj.searchParams.set(key, '[REDACTED]');
      }
    });

    return urlObj.toString();
  } catch {
    return '[INVALID URL]';
  }
}
