import { defineConfig } from 'drizzle-kit';
import { ENV } from './env';

export default defineConfig({
  out: './db/migartions',
  schema: './db/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: ENV.DB_URL!,
  },
  verbose: true,
  strict: true,
});
