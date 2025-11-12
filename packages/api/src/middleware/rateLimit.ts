import { createMiddleware } from 'hono/factory';
import { RATE_LIMIT_MAX_READS, RATE_LIMIT_MAX_WRITES } from '@es-mono/shared';

/**
 * Simple in-memory rate limiter
 * In production, use Redis or similar for distributed rate limiting
 */
class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.requests.entries()) {
        if (value.resetAt < now) {
          this.requests.delete(key);
        }
      }
    }, 60000);
  }

  /**
   * Check if request is allowed
   * @param key - Unique identifier (IP address or user ID)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and retry info
   */
  check(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || entry.resetAt < now) {
      // No entry or expired - create new
      this.requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    this.requests.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Clean up and stop interval
   */
  destroy() {
    // eslint-disable-next-line no-undef
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Get client identifier (IP address or user ID)
 */
function getClientId(c: {
  get: (key: string) => { id?: string } | null | undefined;
  req: { header: (name: string) => string | undefined };
}): string {
  // Prefer user ID if authenticated
  const user = c.get('user');
  if (user?.id) {
    return `user:${user.id}`;
  }

  // Fall back to IP address
  const forwarded = c.req.header('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : c.req.header('x-real-ip') || 'unknown';
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware for read operations
 * Default: 100 requests per 15 minutes
 */
export const rateLimitRead = createMiddleware(async (c, next) => {
  const clientId = getClientId(c);
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const result = rateLimiter.check(clientId, RATE_LIMIT_MAX_READS, windowMs);

  // Set rate limit headers
  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX_READS.toString());
  c.header('X-RateLimit-Remaining', result.remaining.toString());
  c.header('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

  if (!result.allowed) {
    c.header('Retry-After', result.retryAfter!.toString());
    return c.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
      },
      429
    );
  }

  return next();
});

/**
 * Rate limiting middleware for write operations (stricter limits)
 * Default: 20 requests per 15 minutes
 */
export const rateLimitWrite = createMiddleware(async (c, next) => {
  const clientId = getClientId(c);
  const windowMs = 15 * 60 * 1000; // 15 minutes

  const result = rateLimiter.check(clientId, RATE_LIMIT_MAX_WRITES, windowMs);

  // Set rate limit headers
  c.header('X-RateLimit-Limit', RATE_LIMIT_MAX_WRITES.toString());
  c.header('X-RateLimit-Remaining', result.remaining.toString());
  c.header('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

  if (!result.allowed) {
    c.header('Retry-After', result.retryAfter!.toString());
    return c.json(
      {
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
      },
      429
    );
  }

  return next();
});

/**
 * Custom rate limiting middleware with configurable limits
 */
export function createRateLimit(options: { maxRequests: number; windowMs: number }) {
  return createMiddleware(async (c, next) => {
    const clientId = getClientId(c);

    const result = rateLimiter.check(clientId, options.maxRequests, options.windowMs);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', options.maxRequests.toString());
    c.header('X-RateLimit-Remaining', result.remaining.toString());
    c.header('X-RateLimit-Reset', new Date(result.resetAt).toISOString());

    if (!result.allowed) {
      c.header('Retry-After', result.retryAfter!.toString());
      return c.json(
        {
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: result.retryAfter,
        },
        429
      );
    }

    return next();
  });
}

// Export rate limiter for testing/cleanup
export { rateLimiter };
