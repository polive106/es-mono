// TODO: Fix Hono RPC type inference
// The AppType export from @es-mono/api is not properly typed due to
// TypeScript's limitation with complex type expansion during .d.ts generation
// For now, using direct fetch calls in components

// import { hc } from 'hono/client';
// import type { AppType } from '@es-mono/api';
//
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
//
// export const api = hc<AppType>(API_URL, {
//   init: {
//     credentials: 'include',
//   },
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
