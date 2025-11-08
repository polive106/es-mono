import { Hono } from 'hono';
import {
  authMiddleware,
  corsMiddleware,
  errorHandler,
  notFoundHandler,
  requestLogger,
  securityHeaders,
  requestSizeLimit,
} from './middleware';
import authRoutes from './routes/auth';

/**
 * Create and configure the main Hono application
 */
export function createApp() {
  const app = new Hono();

  // Global middleware (order matters!)

  // 1. Error handler (must be first to catch all errors)
  app.use('*', errorHandler);

  // 2. Security headers
  app.use('*', securityHeaders);

  // 3. CORS
  app.use('*', corsMiddleware);

  // 4. Request logging
  app.use('*', requestLogger);

  // 5. Request size limit (1MB default)
  app.use('*', requestSizeLimit(1024 * 1024));

  // 6. Auth middleware (optional - attaches user if session exists)
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
  app.route('/api/auth', authRoutes);

  // 404 handler (must be last)
  app.notFound(notFoundHandler);

  return app;
}

// Create app instance
export const app = createApp();
