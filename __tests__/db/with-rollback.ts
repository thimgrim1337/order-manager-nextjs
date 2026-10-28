import db from '@/db/db';
import { ENV } from '@/env';
import { assertTestDatabase } from './assert-test-database';

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

class Rollback extends Error {}

/** Runs `body` inside a transaction that is always rolled back, so each test leaves the database as it found it. */
export async function withRollback(body: (trx: Transaction) => Promise<void>) {
  assertTestDatabase(ENV.DB_URL);

  try {
    await db.transaction(async (trx) => {
      await body(trx);
      throw new Rollback();
    });
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }
}
