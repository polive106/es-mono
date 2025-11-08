// API layer - Hono REST API server
import { Hono } from 'hono';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = process.env.API_PORT || 3000;

console.log(`🚀 API server starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
