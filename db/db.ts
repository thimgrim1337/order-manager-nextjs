import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle, type NodePgTransaction } from 'drizzle-orm/node-postgres';
import { ENV } from '@/env';
import * as schema from './schemas/index';

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: ENV.DB_URL,
  },
  schema,
  logger: ENV.NODE_ENV !== 'test',
});

export type db = typeof db;
export type dbTransaction = NodePgTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;
export default db;
