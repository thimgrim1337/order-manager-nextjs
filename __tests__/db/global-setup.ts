import { loadEnvConfig } from '@next/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { assertTestDatabase } from './assert-test-database';

/** Brings the `db-test` schema up to date before the `db` project runs. */
export default async function setup() {
  loadEnvConfig(process.cwd());
  assertTestDatabase(process.env.DB_URL);

  const db = drizzle({ connection: { connectionString: process.env.DB_URL } });

  try {
    await migrate(db, { migrationsFolder: './db/migrations' });
  } finally {
    await db.$client.end();
  }
}
