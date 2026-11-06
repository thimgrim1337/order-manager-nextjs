import { describe, expect, it } from 'vitest';
import { driver } from '@/db/schemas';
import { findDrivers } from '@/lib/dal/driver.dal';
import { withRollback } from '../db/with-rollback';

describe('findDrivers', () => {
  it('orders Drivers by first then last name, in Polish alphabetical order', () =>
    withRollback(async (trx) => {
      await trx.insert(driver).values([
        { firstName: 'Łukasz', lastName: 'Adamski' },
        { firstName: 'Jan', lastName: 'Zieliński' },
        { firstName: 'Lucjan', lastName: 'Wiśniewski' },
        { firstName: 'Jan', lastName: 'Kowalski' },
        { firstName: 'Mateusz', lastName: 'Nowak' },
      ]);

      const drivers = await findDrivers(trx);

      expect(drivers.map((d) => `${d.firstName} ${d.lastName}`)).toEqual([
        'Jan Kowalski',
        'Jan Zieliński',
        'Lucjan Wiśniewski',
        'Łukasz Adamski',
        'Mateusz Nowak',
      ]);
    }));
});
