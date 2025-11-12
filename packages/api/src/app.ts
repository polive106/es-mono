import { Hono } from 'hono';
import { ZodError } from 'zod';
import {
  authMiddleware,
  corsMiddleware,
  notFoundHandler,
  requestLogger,
  securityHeaders,
  requestSizeLimit,
  type ErrorResponse,
} from './middleware';
import { AuthError } from './auth/service';
import { APIError } from './middleware/errorHandler';
import authRoutes from './routes/auth';

/**
 * Create and configure the main Hono application
 */
export function createApp() {
  const app = new Hono();

  // Global middleware (order matters!)

  // 1. Security headers
  app.use('*', securityHeaders);

  // 2. CORS
  app.use('*', corsMiddleware);

  // 3. Request logging
  app.use('*', requestLogger);

  // 4. Request size limit (1MB default)
  app.use('*', requestSizeLimit(1024 * 1024));

  // 5. Auth middleware (optional - attaches user if session exists)
  app.use('*', authMiddleware);

  // Health check endpoint (no auth required)
  app.get('/health', (c) => {
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    });
  });

  // API routes
  app.route('/auth', authRoutes);

  // Error handler - must use onError, not middleware
  app.onError((error, c) => {
    const isTest = process.env.NODE_ENV === 'test';

    // Zod validation errors - expected, log concisely
    if (error instanceof ZodError) {
      if (!isTest) {
        console.error(
          `[API] Validation error: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        );
      }
      return c.json<ErrorResponse>(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
          timestamp: new Date().toISOString(),
        },
        400
      );
    }

    // Auth errors - expected, log concisely
    if (error instanceof AuthError) {
      if (!isTest) {
        console.error(`[API] Auth error: ${error.message} (${error.code})`);
      }
      const statusMap: Record<string, number> = {
        INVALID_EMAIL: 400,
        EMAIL_EXISTS: 409,
        INVALID_INVITE_CODE: 400,
        WEAK_PASSWORD: 400,
        BREACHED_PASSWORD: 400,
        INVALID_CREDENTIALS: 401,
        ACCOUNT_DELETED: 403,
        USER_NOT_FOUND: 404,
        INVALID_PASSWORD: 400,
      };

      const status = statusMap[error.code] || 400;
      return c.json<ErrorResponse>(
        {
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString(),
        },
        status as 400 | 401 | 403 | 404 | 409
      );
    }

    // Custom API errors - may be expected or unexpected, log based on status
    if (error instanceof APIError) {
      if (!isTest) {
        if (error.status >= 500) {
          console.error('[API] Internal API error:', error);
        } else {
          console.error(`[API] Client error: ${error.message} (${error.code})`);
        }
      }
      return c.json<ErrorResponse>(
        {
          error: error.message,
          code: error.code,
          details: error.details,
          timestamp: new Date().toISOString(),
        },
        error.status as never
      );
    }

    // Generic errors - unexpected, log with full stack trace (even in tests for debugging)
    if (!isTest) {
      console.error('[API] Unexpected error:', error);
    }
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return c.json<ErrorResponse>(
      {
        error: isDevelopment ? message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: isDevelopment
          ? { stack: error instanceof Error ? error.stack : undefined }
          : undefined,
        timestamp: new Date().toISOString(),
      },
      500
    );
  });

  // 404 handler (must be last)
  app.notFound(notFoundHandler);

  return app;
}

// Create app instance
export const app = createApp();
