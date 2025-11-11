import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/integration/**'],
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.ts'],
    sequence: {
      concurrent: false, // Run test files sequentially to avoid database conflicts
    },
    env: {
      DATABASE_URL: 'file:test-db?mode=memory&cache=shared',
    },
  },
});
