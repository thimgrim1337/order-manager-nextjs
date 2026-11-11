import { loadEnvConfig } from '@next/env';

// Before reading `E2E_PORT`: importers run this module before their own `loadEnvConfig`.
loadEnvConfig(process.cwd());

/** The port Playwright serves the e2e build on. */
export const E2E_PORT = process.env.E2E_PORT ?? '3001';
/** Where the specs and their helpers reach that server. */
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
