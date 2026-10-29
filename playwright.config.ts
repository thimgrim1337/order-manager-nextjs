import { loadEnvConfig } from '@next/env';
import { defineConfig, devices } from '@playwright/test';

loadEnvConfig(process.cwd());

const port = process.env.E2E_PORT ?? '3001';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  outputDir: './__tests__/e2e/test-results',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Spec files share the db-test database and truncate it, so they must not run in parallel. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: `http://localhost:${port}`,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath: process.env.CI ? undefined : '/usr/bin/chromium' },
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Serves the build made by `pnpm test:e2e` (or the CI build step); a leftover server would serve a stale build.
    command: `pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    // env: {
    //   NODE_ENV: 'test',
    //   DB_URL: process.env?.DB_URL,
    //   DB_HOST: process.env?.DB_HOST,
    //   DB_USER: process.env?.DB_USER,
    //   DB_PASSWORD: process.env?.DB_PASSWORD,
    //   DB_NAME: process.env?.DB_NAME,
    //   DB_PORT: process.env?.DB_PORT,
    //   DB_SEEDING: process.env?.DB_SEEDING,
    //   DB_MIGRATING: process.env?.DB_MIGRATING,
    // },
  },
});
