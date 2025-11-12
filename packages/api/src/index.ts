// API layer - Hono REST API server
// IMPORTANT: Load env FIRST before any other imports
import './env';

import { serve } from '@hono/node-server';
import { app } from './app';
import { logger } from './middleware/logger';

const port = parseInt(process.env.API_PORT || '3000', 10);

// Start server
serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info('API server started', {
      port: info.port,
      environment: process.env.NODE_ENV || 'development',
    });
    console.log(`🚀 API server running on http://localhost:${info.port}`);
  }
);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Export app for testing and RPC client type inference
export { app };
export type AppType = typeof app;

/**
 * Hono RPC Type Inference
 *
 * The AppType export enables the frontend to use:
 *   import { hc } from 'hono/client'
 *   import type { AppType } from '@es-mono/api'
 *
 *   const api = hc<AppType>(baseURL)
 *   const result = await api.auth.$post({ json: { ... } })
 *
 * This provides full type safety for:
 * - Request validation (via Zod validators)
 * - Response types (inferred from handlers)
 * - Status codes
 * - Error handling
 */
