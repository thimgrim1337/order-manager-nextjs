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

/**
 * `yyyy-MM-dd` for `day` of the current (Warsaw) month: the month the date picker opens on,
 * so a current-month default filter on `/orders` would include it.
 */
export function dayOfThisMonth(day: number) {
  return `${getToday().slice(0, 8)}${String(day).padStart(2, '0')}`;
}

export async function cleanupTestData() {
  assertTestDatabase(ENV.DB_URL);
  for (const table of [cities, trucks, drivers, customers, countries, statuses, currencies]) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`));
  }
}
