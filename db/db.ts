import { drizzle } from 'drizzle-orm/node-postgres';
import { ENV } from '@/env';

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: ENV.DB_URL!,
  },
  logger: true,
});

export default db;
export type db = typeof db;
