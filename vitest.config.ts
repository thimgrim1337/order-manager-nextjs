import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    projects: [
      {
        extends: true,
        plugins: [react()],
        define: {
          'process.env': {},
        },
        test: {
          name: 'browser',
          setupFiles: ['./vitest.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({
              // CI uses the Chromium that `playwright install` downloads.
              launchOptions: {
                executablePath: process.env.CI ? undefined : '/usr/bin/chromium',
              },
              // Not Europe/Warsaw, so tests catch code that relies on the machine's zone instead of the company's.
              contextOptions: { timezoneId: 'America/Los_Angeles' },
            }),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1920, height: 1080 },
          },
          include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
          exclude: ['node_modules', 'dist', 'e2e', '__tests__/**/*.db.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'db',
          environment: 'node',
          // Throws on any Node deprecation, aimed at pg's warning for parallel queries on one client
          // (e.g. Promise.all over one trx). pg only warns from the 3rd queued query, so 2 slip through.
          execArgv: ['--throw-deprecation'],
          include: ['__tests__/**/*.db.test.ts'],
          globalSetup: ['./__tests__/db/global-setup.ts'],
        },
      },
    ],
  },
});
