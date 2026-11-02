import type { db, dbTransaction } from '@/db/db';
import { CURRENCY, ORDER_STATUS } from '@/lib/consts';
import { currency, status } from '../schemas';

/**
 * Seeds the Statuses and Currencies the app reads by id (`ORDER_STATUS`, `CURRENCY`), with those ids.
 * The app seed and the db and e2e test seeds all go through here.
 */
export default async function seed(database: db | dbTransaction) {
  const statuses = await database
    .insert(status)
    .overridingSystemValue()
    .values([
      { id: ORDER_STATUS.InProgress, name: 'w trakcie' },
      { id: ORDER_STATUS.Cancelled, name: 'anulowane' },
      { id: ORDER_STATUS.Delivered, name: 'zakończone' },
    ])
    .returning();
  const currencies = await database
    .insert(currency)
    .overridingSystemValue()
    .values([
      { id: CURRENCY.PLN, code: 'PLN' },
      { id: CURRENCY.EUR, code: 'EUR' },
    ])
    .returning();

  return {
    statuses: {
      inProgress: rowWithId(statuses, ORDER_STATUS.InProgress),
      cancelled: rowWithId(statuses, ORDER_STATUS.Cancelled),
      delivered: rowWithId(statuses, ORDER_STATUS.Delivered),
    },
    currencies: {
      pln: rowWithId(currencies, CURRENCY.PLN),
      eur: rowWithId(currencies, CURRENCY.EUR),
    },
  };
}

function rowWithId<T extends { id: number }>(rows: T[], id: number) {
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error(`Seeded row ${id} is missing`);
  return row;
}
