import { eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { currency } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

/** Every Currency. */
async function findCurrencies(database: db | dbTransaction) {
  return database.select({ id: currency.id, code: currency.code }).from(currency);
}

/** The Currency `currencyId`, if there is one. */
export async function findCurrency(database: db | dbTransaction, currencyId: number) {
  const [found] = await database
    .select({ id: currency.id, code: currency.code })
    .from(currency)
    .where(eq(currency.id, currencyId));

  return found;
}

export type CurrencyReadModel = Awaited<ReturnType<typeof findCurrencies>>[number];

export async function getAllCurrencies() {
  'use cache';
  cacheLife('weeks');
  cacheTag(CACHE_TAG.Currencies);

  return findCurrencies(db);
}
