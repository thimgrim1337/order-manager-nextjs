import type { InferInsertModel } from 'drizzle-orm';
import type { dbTransaction } from '@/db/db';
import { city, country, customer, driver, type order, truck } from '@/db/schemas';
import seedReference from '@/db/seeds/reference';
import type { OrderFormDto } from '@/lib/dto/order.dto';
import { NO_EXCHANGE_RATE } from '@/lib/exchange-rate';

/**
 * Seeds the rows an Order references, inside the test's transaction.
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
  const { statuses, currencies } = await seedReference(trx);
  const [dbTruck] = await trx
    .insert(truck)
    .values({ plate: 'WP0997C', insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();

  return {
    cities: { warszawa, plock, gdansk },
    drivers: { jan, anna },
    customer: dbCustomer,
    currencies,
    statuses,
    truck: dbTruck,
  };
}

/** An `order` row for the seeded references: ZL/1, PLN 100, in progress, 2026-10-27 → 2026-10-29, Jan with the seeded Customer and Truck. Several rows for one Customer need distinct `orderNr` (unique per Customer). */
export function orderRowFor(refs: Awaited<ReturnType<typeof seedOrderReferences>>) {
  return (
    fields: Partial<InferInsertModel<typeof order>> = {},
  ): InferInsertModel<typeof order> => ({
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    driverId: refs.drivers.jan.id,
    truckId: refs.truck.id,
    customerId: refs.customer.id,
    currencyId: refs.currencies.pln.id,
    statusId: refs.statuses.inProgress.id,
    priceCurrency: '100',
    pricePLN: '100',
    ...fields,
  });
}

/** A valid PLN Order form for the seeded references: Warszawa → Płock, Gdańsk, driven by Jan. */
export function orderFormFor(refs: Awaited<ReturnType<typeof seedOrderReferences>>) {
  const { warszawa, plock, gdansk } = refs.cities;

  return (fields: Partial<OrderFormDto> = {}): OrderFormDto => ({
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    statusId: refs.statuses.inProgress.id,
    truckId: refs.truck.id,
    driverId: refs.drivers.jan.id,
    customerId: refs.customer.id,
    currencyId: refs.currencies.pln.id,
    priceCurrency: '1000',
    loadingPlaces: [warszawa],
    unloadingPlaces: [plock, gdansk],
    currencyInfo: NO_EXCHANGE_RATE,
    ...fields,
  });
}
