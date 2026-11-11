import { getTableName, sql } from 'drizzle-orm';
import db from '@/db/db';
import {
  city as cities,
  country as countries,
  currency as currencies,
  customer as customers,
  driver as drivers,
  status as statuses,
  truck as trucks,
} from '@/db/schemas';
import { ENV } from '@/env';
import { getToday } from '@/lib/dates';
import { assertTestDatabase } from '../../db/assert-test-database';
import { E2E_BASE_URL } from './e2e-server';

/**
 * `yyyy-MM-dd` for `day` of the current (Warsaw) month: the month the date picker opens on,
 * so a current-month default filter on `/orders` would include it.
 */
export function dayOfThisMonth(day: number) {
  return `${getToday().slice(0, 8)}${String(day).padStart(2, '0')}`;
}

/**
 * Empties the db-test database and expires the app server's cache, so the next page reads what the
 * test seeds after it rather than what an earlier test cached.
 */
export async function cleanupTestData() {
  assertTestDatabase(ENV.DB_URL);
  for (const table of [cities, trucks, drivers, customers, countries, statuses, currencies]) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`));
  }
  await expireAppCache();
}

async function expireAppCache() {
  const res = await fetch(`${E2E_BASE_URL}/api/e2e/expire-cache`, { method: 'POST' });
  if (!res.ok) throw new Error(`Expiring the app's cache failed: ${res.status}`);
}
