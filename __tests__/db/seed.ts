import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { db, dbTransaction } from '@/db/db';
import {
  city,
  country,
  customer,
  driver,
  loadingPlace,
  order,
  truck,
  unloadingPlace,
} from '@/db/schemas';
import seedReference from '@/db/seeds/reference';
import type { OrderFormDto } from '@/lib/dto/order.dto';
import { NO_EXCHANGE_RATE } from '@/lib/exchange-rate';

/**
 * Seeds the rows an Order references: into a db test's transaction, or into the global db for e2e.
 * Country Polska with Warszawa, Płock and Gdańsk; Drivers Jan and Anna; Customer Test Firma;
 * Truck WP0997C with Jan as its Regular Driver; the Statuses and Currencies.
 */
export async function seedOrderReferences(database: db | dbTransaction) {
  // Each insert needs ids returned by the one before it.
  const [dbCountry] = await database
    .insert(country)
    .values({ name: 'Polska', code: 'PL' })
    .returning();
  const [warszawa, plock, gdansk] = await database
    .insert(city)
    .values([
      { name: 'Warszawa', postal: '00-001', countryId: dbCountry.id },
      { name: 'Płock', postal: '09-400', countryId: dbCountry.id },
      { name: 'Gdańsk', postal: '80-001', countryId: dbCountry.id },
    ])
    .returning();
  const [jan, anna] = await database
    .insert(driver)
    .values([
      { firstName: 'Jan', lastName: 'Kowalski' },
      { firstName: 'Anna', lastName: 'Nowak' },
    ])
    .returning();
  const [dbCustomer] = await database
    .insert(customer)
    .values({ name: 'Test Firma', tax: 'PL1234567890' })
    .returning();
  const { statuses, currencies } = await seedReference(database);
  const [dbTruck] = await database
    .insert(truck)
    .values({
      plate: 'WP0997C',
      driverId: jan.id,
      insuranceEndAt: '2027-01-01',
      serviceEndAt: '2027-01-01',
    })
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

type OrderReferences = Awaited<ReturnType<typeof seedOrderReferences>>;

/** An `order` row for the seeded references: ZL/1, PLN 100, in progress, 2026-10-27 → 2026-10-29, Jan with the seeded Customer and Truck. Several rows for one Customer need distinct `orderNr` (unique per Customer). */
export function orderRowFor(refs: OrderReferences) {
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
export function orderFormFor(refs: OrderReferences) {
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

type City = InferSelectModel<typeof city>;

/**
 * Inserts an Order built by `orderRowFor`, with its Loading and Unloading Places in the order given
 * (Warszawa → Płock by default).
 */
export async function seedOrder(
  database: db | dbTransaction,
  refs: OrderReferences,
  {
    loadingPlaces = [refs.cities.warszawa],
    unloadingPlaces = [refs.cities.plock],
    ...fields
  }: Partial<InferInsertModel<typeof order>> & {
    loadingPlaces?: City[];
    unloadingPlaces?: City[];
  } = {},
) {
  const [dbOrder] = await database.insert(order).values(orderRowFor(refs)(fields)).returning();
  const places = (cities: City[]) =>
    cities.map((city, position) => ({ orderId: dbOrder.id, placeId: city.id, position }));

  if (loadingPlaces.length) await database.insert(loadingPlace).values(places(loadingPlaces));
  if (unloadingPlaces.length) await database.insert(unloadingPlace).values(places(unloadingPlaces));

  return dbOrder;
}
