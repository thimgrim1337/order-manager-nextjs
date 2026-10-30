import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, country, currency, customer, driver, status, truck } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import type { OrderFormDto } from '@/lib/dto/order.dto';
import { createOrder } from '@/lib/orders';
import { parseWeekKey, type Week } from '@/lib/week';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
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
  const [jan] = await trx
    .insert(driver)
    .values({ firstName: 'Jan', lastName: 'Kowalski' })
    .returning();
  const [dbCustomer] = await trx
    .insert(customer)
    .values({ name: 'Test Firma', tax: 'PL1234567890' })
    .returning();
  // Fixed ids: the app reads currency 1 as PLN and accepts statuses 1–3.
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

  const orderForm = (fields: Partial<OrderFormDto> = {}): OrderFormDto => ({
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    statusId: dbStatus.id,
    truckId: dbTruck.id,
    driverId: jan.id,
    customerId: dbCustomer.id,
    currencyId: pln.id,
    priceCurrency: '1000',
    loadingPlaces: [warszawa],
    unloadingPlaces: [plock, gdansk],
    currencyInfo: { rate: '', table: '', date: '' },
    ...fields,
  });

  return { orderForm, jan, eur, dbTruck };
}

const week = parseWeekKey('2026-W44') as Week;

describe('createOrder', () => {
  beforeEach(() => {
    vi.mocked(updateTag).mockClear();
  });

  it('saves the Loading and Unloading Places', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);

      const [failure, created] = await createOrder(trx, orderForm());

      expect(failure).toBeNull();
      const [saved] = await findOrdersInWeek(trx, week);
      expect(saved.id).toBe(created?.id);
      expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Warszawa']);
      expect(saved.unloadingPlaces.map((place) => place.name).sort()).toEqual(['Gdańsk', 'Płock']);
    }));

  it("assigns the Order's Driver to its Truck", () =>
    withRollback(async (trx) => {
      const { orderForm, jan, dbTruck } = await seed(trx);

      await createOrder(trx, orderForm());

      const [savedTruck] = await trx.select().from(truck).where(eq(truck.id, dbTruck.id));
      expect(savedTruck.driverId).toBe(jan.id);
    }));

  it('converts an EUR price to PLN at the submitted exchange rate', () =>
    withRollback(async (trx) => {
      const { orderForm, eur } = await seed(trx);

      const [, created] = await createOrder(
        trx,
        orderForm({
          currencyId: eur.id,
          priceCurrency: '1000',
          currencyInfo: { rate: '4.2512', table: '210/A/NBP/2026', date: '2026-10-28' },
        }),
      );

      expect(created).toMatchObject({
        priceCurrency: '1000.00',
        pricePLN: '4251.20',
        exchangeRate: '4.2512',
        exchangeDate: '2026-10-28',
      });
    }));

  it('reports an Order Number already used for the Customer, and saves nothing', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);
      await createOrder(trx, orderForm({ orderNr: 'ZL/7' }));

      const [failure] = await createOrder(trx, orderForm({ orderNr: 'ZL/7' }));

      expect(failure).toEqual({ reason: 'OrderNrTaken' });
      expect(await findOrdersInWeek(trx, week)).toHaveLength(1);
    }));

  it('invalidates cached Orders once the Order is created', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);

      await createOrder(trx, orderForm());

      expect(updateTag).toHaveBeenCalledWith('orders');
    }));

  it('invalidates nothing when the Order is not created', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);

      await createOrder(trx, orderForm({ orderNr: '' }));

      expect(updateTag).not.toHaveBeenCalled();
    }));
});
