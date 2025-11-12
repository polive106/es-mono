import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,

  /* Global setup/teardown for database initialization */
  globalSetup: './global-setup.ts',
  globalTeardown: './global-teardown.ts',

  /* Run tests sequentially to avoid database conflicts */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  /* Single worker to avoid database conflicts */
  workers: 1,

  /* Reporter to use */
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],

  /* Shared settings for all the projects below */
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test on more browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: 'cd ../../packages/api && pnpm dev',
      url: 'http://localhost:3000/health',
      timeout: 120 * 1000,
      reuseExistingServer: false, // Always start fresh for e2e tests to ensure correct database
      env: {
        NODE_ENV: 'test',
        DATABASE_URL: './test-e2e.db',
        API_PORT: '3000',
      },
    },
    {
      command: 'cd ../../packages/frontend && pnpm dev',
      url: 'http://localhost:5173',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: 'test',
        VITE_API_URL: 'http://localhost:3000',
      },
    },
  ],
});
