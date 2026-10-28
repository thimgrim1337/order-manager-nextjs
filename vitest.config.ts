import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  define: {
    'process.env': {},
  },

  test: {
    setupFiles: ['./vitest.setup.ts'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({
        launchOptions: {
          executablePath: '/usr/bin/chromium',
        },
        // Not Europe/Warsaw, so tests catch code that relies on the machine's zone instead of the company's.
        contextOptions: { timezoneId: 'America/Los_Angeles' },
      }),
      instances: [{ browser: 'chromium' }],
      viewport: { width: 1920, height: 1080 },
    },
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
  },
});
