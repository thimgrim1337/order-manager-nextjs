import type { dbTransaction } from '@/db/db';
import { city, country, currency, customer, driver, status, truck } from '@/db/schemas';

/**
 * Seeds the rows an Order references, inside the test's transaction.
 *
 * Currencies and statuses get fixed ids: the app reads currency 1 as PLN and the Order form accepts
 * statuses 1–3, while identity sequences keep counting across `withRollback`.
 */
export async function seedOrderReferences(trx: dbTransaction) {
  // One transaction is one client, so inserts run one after another.
  const [dbCountry] = await trx.insert(country).values({ name: 'Polska', code: 'PL' }).returning();
  const [warszawa, plock, gdansk] = await trx
    .insert(city)
    .values([
      { name: 'Warszawa', postal: '00-001', countryId: dbCountry.id },
      { name: 'Płock', postal: '09-400', countryId: dbCountry.id },
      { name: 'Gdańsk', postal: '80-001', countryId: dbCountry.id },
    ])
    .returning();
  const [jan, anna] = await trx
    .insert(driver)
    .values([
      { firstName: 'Jan', lastName: 'Kowalski' },
      { firstName: 'Anna', lastName: 'Nowak' },
    ])
    .returning();
  const [dbCustomer] = await trx
    .insert(customer)
    .values({ name: 'Test Firma', tax: 'PL1234567890' })
    .returning();
  const [pln, eur] = await trx
    .insert(currency)
    .overridingSystemValue()
    .values([
      { id: 1, code: 'PLN' },
      { id: 2, code: 'EUR' },
    ])
    .returning();
  const [dbStatus] = await trx
    .insert(status)
    .overridingSystemValue()
    .values({ id: 1, name: 'w trakcie' })
    .returning();
  const [dbTruck] = await trx
    .insert(truck)
    .values({ plate: 'WP0997C', insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();

  return {
    cities: { warszawa, plock, gdansk },
    drivers: { jan, anna },
    customer: dbCustomer,
    currencies: { pln, eur },
    status: dbStatus,
    truck: dbTruck,
  };
}
