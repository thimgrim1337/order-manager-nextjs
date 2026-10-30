import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import type { OrderFormDto } from '@/lib/dto/order.dto';
import { createOrder } from '@/lib/orders';
import { parseWeekKey, type Week } from '@/lib/week';
import { seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);
  const { jan } = refs.drivers;
  const { warszawa, plock, gdansk } = refs.cities;

  const orderForm = (fields: Partial<OrderFormDto> = {}): OrderFormDto => ({
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    statusId: refs.status.id,
    truckId: refs.truck.id,
    driverId: jan.id,
    customerId: refs.customer.id,
    currencyId: refs.currencies.pln.id,
    priceCurrency: '1000',
    loadingPlaces: [warszawa],
    unloadingPlaces: [plock, gdansk],
    currencyInfo: { rate: '', table: '', date: '' },
    ...fields,
  });

  return { orderForm, jan, eur: refs.currencies.eur, dbTruck: refs.truck };
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
