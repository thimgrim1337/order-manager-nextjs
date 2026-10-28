import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { testDbUrl } from './test-db-url';

/** Brings the `db-test` schema up to date before the `db` project runs. */
export default async function setup() {
  const db = drizzle({ connection: { connectionString: testDbUrl() } });

  try {
    await migrate(db, { migrationsFolder: './db/migrations' });
  } finally {
    await db.$client.end();
  }
}
