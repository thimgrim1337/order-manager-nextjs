import { loadEnvConfig } from '@next/env';
import { defineConfig, devices } from '@playwright/test';
import { E2E_BASE_URL, E2E_PORT } from './__tests__/e2e/helpers/e2e-server';

loadEnvConfig(process.cwd());

const resultsDir = './__tests__/e2e/test-results';

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
  outputDir: resultsDir,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Spec files share the db-test database and truncate it, so they must not run in parallel. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  /* `line` locally keeps a failure's assertion in a short terminal output; failures.txt keeps it after the run. */
  reporter: [
    [process.env.CI ? 'html' : 'line'],
    ['./__tests__/e2e/helpers/failures-reporter.ts', { outputFile: `${resultsDir}/failures.txt` }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: E2E_BASE_URL,

    /* CI traces its first retry. Locally, where nothing retries, keep a failed test's trace.
       No DOM snapshots: with the system Chromium they hang the trace's save until the test times out. */
    trace: process.env.CI ? 'on-first-retry' : { mode: 'retain-on-failure', snapshots: false },
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
    // Locally its log goes to a file, so a red run's server errors outlast the terminal output; CI keeps them in the job log.
    command: process.env.CI
      ? `pnpm start -p ${E2E_PORT}`
      : `mkdir -p ${resultsDir} && pnpm start -p ${E2E_PORT} > ${resultsDir}/server.log 2>&1`,
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    // Enables the route `cleanupTestData` expires the app's cache through.
    env: { E2E: 'true' },
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
