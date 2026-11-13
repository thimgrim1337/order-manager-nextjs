import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { driver, truck } from '@/db/schemas';
import { withRollback } from '../db/with-rollback';

function insertTruck(trx: dbTransaction, values: { plate: string; driverId?: number }) {
  return trx
    .insert(truck)
    .values({ ...values, insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();
}

describe('trucks', () => {
  it('refuses a Plate already taken', () =>
    withRollback(async (trx) => {
      await insertTruck(trx, { plate: 'WND8093A' });

      await expect(insertTruck(trx, { plate: 'WND8093A' })).rejects.toMatchObject({
        cause: { constraint: 'trucks_plate_unique' },
      });
    }));

  it.each([
    ['in small letters', 'wnd8093a'],
    ['with a space', 'WND 8093A'],
    ['with a dash', 'WND-8093A'],
  ])('refuses a Plate written %s, as it is the same Plate in another form', (_, plate) =>
    withRollback(async (trx) => {
      await expect(insertTruck(trx, { plate })).rejects.toMatchObject({
        cause: { constraint: 'trucks_plate_canonical' },
      });
    }));

  it("loads a Truck's Regular Driver", () =>
    withRollback(async (trx) => {
      await trx.insert(driver).values({ firstName: 'Anna', lastName: 'Nowak' });
      const [jan] = await trx
        .insert(driver)
        .values({ firstName: 'Jan', lastName: 'Kowalski' })
        .returning();
      if (!jan) throw new Error('no Driver');
      const [dbTruck] = await insertTruck(trx, { plate: 'WND8093A', driverId: jan.id });
      if (!dbTruck) throw new Error('no Truck');

      const loaded = await trx.query.truck.findFirst({
        where: eq(truck.id, dbTruck.id),
        with: { driver: true },
      });

      expect(loaded?.driver).toMatchObject({ firstName: 'Jan', lastName: 'Kowalski' });
    }));
});
