import { hc } from 'hono/client';
import type { AppType } from '../../../api/src/index';

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create typed Hono RPC client
export const api = hc<AppType>(API_URL, {
  // Fetch init options
  init: {
    credentials: 'include', // Include cookies for auth
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export type for use in components
export type ApiClient = typeof api;
