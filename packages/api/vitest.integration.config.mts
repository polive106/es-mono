import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['tests/integration/setup/**'],
    passWithNoTests: true,
    sequence: {
      concurrent: false, // Run test files sequentially to avoid file conflicts
    },
  },
});
