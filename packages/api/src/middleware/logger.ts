import { createMiddleware } from 'hono/factory';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Simple logger utility
 */
export class Logger {
  constructor(private context: string = 'API') {}

  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta && { meta }),
    };

    // In production, this would send to a logging service (e.g., Winston, Pino)
    const logString = JSON.stringify(logEntry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.DEBUG:
        if (process.env.NODE_ENV !== 'production') {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message: string, meta?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, meta);
  }
}

// Global logger instance
export const logger = new Logger();

/**
 * Request logging middleware
 * Logs all incoming requests and their responses
 */
export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  const { method, path } = c.req;

  // Get user info if available
  const user = c.get('user');
  const userId = user?.id;

  // Get client IP
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : c.req.header('x-real-ip') || 'unknown';

  logger.info('Incoming request', {
    method,
    path,
    userId,
    ip,
    userAgent: c.req.header('user-agent'),
  });

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Log response
  const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;

  logger.log(level, 'Request completed', {
    method,
    path,
    status,
    duration,
    userId,
    ip,
  });
});

/**
 * Performance monitoring middleware
 * Logs slow requests
 */
export const performanceLogger = (thresholdMs: number = 1000) =>
  createMiddleware(async (c, next) => {
    const start = Date.now();

    await next();

    const duration = Date.now() - start;

    if (duration > thresholdMs) {
      logger.warn('Slow request detected', {
        method: c.req.method,
        path: c.req.path,
        duration,
        threshold: thresholdMs,
      });
    }
  });
