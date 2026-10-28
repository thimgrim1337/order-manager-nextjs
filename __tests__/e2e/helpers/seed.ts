import { getTableName, sql } from 'drizzle-orm';
import db from '@/db/db';
import {
  city as cities,
  country as countries,
  currency as currencies,
  customer as customers,
  driver as drivers,
  loadingPlace as loadingPlaces,
  order as orders,
  status as statuses,
  truck as trucks,
  unloadingPlace as unloadingPlaces,
} from '@/db/schemas';
import { ENV } from '@/env';
import { assertTestDatabase } from '../../db/assert-test-database';

export async function seedTestData() {
  const [country] = await db
    .insert(countries)
    .values({
      name: 'Poland',
      code: 'PL',
    })
    .returning();

  const [customer] = await db
    .insert(customers)
    .values({
      name: 'Test Firma',
      tax: 'PL1234567890',
    })
    .returning();

  const [driver] = await db
    .insert(drivers)
    .values({
      firstName: 'Jan',
      lastName: 'Kowalski',
    })
    .returning();

  const [truck] = await db
    .insert(trucks)
    .values({
      plate: 'WP0997C',
      driverId: driver.id,
      insuranceEndAt: '2027-01-01',
      serviceEndAt: '2027-01-01',
    })
    .returning();

  const dbCities = await db
    .insert(cities)
    .values([
      {
        name: 'Warszawa',
        postal: '00-001',
        countryId: country.id,
      },
      {
        name: 'Płock',
        postal: '09-400',
        countryId: country.id,
      },
    ])
    .returning();

  const [status] = await db
    .insert(statuses)
    .values([
      {
        name: 'w trakcie',
      },
      { name: 'anulowane' },
      {
        name: 'zakończone',
      },
    ])
    .returning();

  const currency = await db
    .insert(currencies)
    .values([{ code: 'PLN' }, { code: 'EUR' }])
    .returning();

  return { customer, driver, truck, dbCities, status, currency };
}

/** Warszawa → Płock, for the seeded Customer, Driver and Truck. */
export async function seedOrder(
  data: Awaited<ReturnType<typeof seedTestData>>,
  fields: { orderNr: string; startDate: string; endDate: string },
) {
  const [loadingCity, unloadingCity] = data.dbCities;
  const [dbOrder] = await db
    .insert(orders)
    .values({
      ...fields,
      customerId: data.customer.id,
      driverId: data.driver.id,
      truckId: data.truck.id,
      statusId: data.status.id,
      currencyId: data.currency[0].id,
      priceCurrency: '1000',
      pricePLN: '1000',
    })
    .returning();

  await db.insert(loadingPlaces).values({ orderId: dbOrder.id, placeId: loadingCity.id });
  await db.insert(unloadingPlaces).values({ orderId: dbOrder.id, placeId: unloadingCity.id });

  return dbOrder;
}

export async function cleanupTestData() {
  assertTestDatabase(ENV.DB_URL);
  for (const table of [cities, trucks, drivers, customers, countries, statuses, currencies]) {
    await db.execute(sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`));
  }
}
