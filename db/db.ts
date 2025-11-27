import { drizzle } from 'drizzle-orm/node-postgres';
import { ENV } from '@/env';
import * as schema from './schemas/index';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js/driver';

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: ENV.DB_URL!,
  },
  schema,
  logger: true,
});

export type db = typeof db;
export default db;
export type dbTransaction = PostgresJsDatabase<typeof schema>;
