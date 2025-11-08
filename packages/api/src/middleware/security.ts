import { createMiddleware } from 'hono/factory';
import { cors } from 'hono/cors';

/**
 * CORS middleware configuration
 */
export const corsMiddleware = cors({
  origin: (origin) => {
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return origin;
    }

    // In production, only allow specific origins
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      // Add other allowed origins here
    ];

    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  maxAge: 86400, // 24 hours
});

/**
 * Security headers middleware
 * Sets important security headers for all responses
 */
export const securityHeaders = createMiddleware(async (c, next) => {
  await next();

  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (legacy browsers)
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  c.header(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Adjust as needed
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Permissions Policy (formerly Feature-Policy)
  c.header(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disable FLoC
      'payment=()',
      'usb=()',
    ].join(', ')
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
});

/**
 * Request size limit middleware
 * Prevents large payload attacks
 */
export const requestSizeLimit = (maxSizeBytes: number = 1024 * 1024) =>
  createMiddleware(async (c, next) => {
    const contentLength = c.req.header('content-length');

    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > maxSizeBytes) {
        return c.json(
          {
            error: 'Request payload too large',
            code: 'PAYLOAD_TOO_LARGE',
            maxSize: maxSizeBytes,
          },
          413        );
      }
    }

    return next();
  });

/**
 * Method whitelist middleware
 * Only allow specific HTTP methods
 */
export const methodWhitelist = (allowedMethods: string[]) =>
  createMiddleware(async (c, next) => {
    const method = c.req.method;

    if (!allowedMethods.includes(method)) {
      return c.json(
        {
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
          allowedMethods,
        },
        405      );
    }

    return next();
  });
