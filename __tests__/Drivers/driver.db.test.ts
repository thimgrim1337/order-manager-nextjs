import { describe, expect, it } from 'vitest';
import { driver } from '@/db/schemas';
import { withRollback } from '../db/with-rollback';

describe('drivers', () => {
  it.each([
    ['as it is', 'Łukasz', 'Żak'],
    ['in other letter case, Polish letters included', 'ŁUKASZ', 'żak'],
  ])('refuses a Driver whose first and last name are taken %s', (_, firstName, lastName) =>
    withRollback(async (trx) => {
      await trx.insert(driver).values({ firstName: 'Łukasz', lastName: 'Żak' });

      await expect(trx.insert(driver).values({ firstName, lastName })).rejects.toMatchObject({
        cause: { constraint: 'drivers_name_unique' },
      });
    }));

  it('saves a Driver whose name differs from a taken one only in its Polish letters', () =>
    withRollback(async (trx) => {
      await trx.insert(driver).values({ firstName: 'Łukasz', lastName: 'Żak' });

      await expect(
        trx.insert(driver).values({ firstName: 'Lukasz', lastName: 'Zak' }),
      ).resolves.toBeDefined();
    }));

  it('saves a Driver sharing only a first or a last name with another', () =>
    withRollback(async (trx) => {
      await trx.insert(driver).values({ firstName: 'Jan', lastName: 'Kowalski' });

      await expect(
        trx.insert(driver).values([
          { firstName: 'Jan', lastName: 'Nowak' },
          { firstName: 'Anna', lastName: 'Kowalski' },
        ]),
      ).resolves.toBeDefined();
    }));
});
