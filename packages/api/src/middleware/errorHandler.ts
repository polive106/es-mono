import { createMiddleware } from 'hono/factory';
import { ZodError } from 'zod';
import { AuthError } from '../auth/service';

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
  details?: any;
  timestamp: string;
}

/**
 * Custom API error class
 */
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = createMiddleware(async (c, next) => {
  try {
    return await next();
  } catch (error) {
    console.error('Error caught by error handler:', error);

    // Zod validation errors
    if (error instanceof ZodError) {
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

    // Auth errors
    if (error instanceof AuthError) {
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

    // Custom API errors
    if (error instanceof APIError) {
      // APIError can have any valid HTTP error status, so we need to cast it
      // This is safe because APIError.status is controlled by our application code
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

    // Generic errors
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    return c.json<ErrorResponse>(
      {
        error: isDevelopment ? message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: isDevelopment ? { stack: error instanceof Error ? error.stack : undefined } : undefined,
        timestamp: new Date().toISOString(),
      },
      500    );
  }
});

/**
 * Not found handler (404)
 */
export const notFoundHandler = (c: {
  json: <T>(data: T, status: number) => Response;
  req: { path: string; method: string };
}) => {
  return c.json(
    {
      error: 'Not found',
      code: 'NOT_FOUND',
      details: {
        path: c.req.path,
        method: c.req.method,
      },
      timestamp: new Date().toISOString(),
    },
    404
  );
};
