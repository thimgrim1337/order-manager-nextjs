import db from '@/db/db';
import { ENV } from '@/env';
import { testDbUrl } from './test-db-url';

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

class Rollback extends Error {}

/** Runs `body` inside a transaction that is always rolled back, so each test leaves the database as it found it. */
export async function withRollback(body: (trx: Transaction) => Promise<void>) {
  if (ENV.DB_URL !== testDbUrl())
    throw new Error('withRollback must run against the db-test container.');

  try {
    await db.transaction(async (trx) => {
      await body(trx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}
