import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { customer } from '@/db/schemas';
import { findCustomers } from '@/lib/dal/customer.dal';
import { withRollback } from '../db/with-rollback';

async function seedCustomers(trx: dbTransaction, customers: { name: string; tax: string }[]) {
  return trx.insert(customer).values(customers).returning();
}

const devil = { name: 'Devil Transport', tax: '7743241555' };
const anioł = { name: 'Anioł Logistyka', tax: '5250001003' };

describe('findCustomers', () => {
  it('finds a Customer by part of its name, ignoring case', () =>
    withRollback(async (trx) => {
      await seedCustomers(trx, [devil, anioł]);

      const customers = await findCustomers(trx, 'devil');

      expect(customers.map((c) => c.name)).toEqual(['Devil Transport']);
    }));

  it('finds a Customer by part of its tax number', () =>
    withRollback(async (trx) => {
      await seedCustomers(trx, [devil, anioł]);

      const customers = await findCustomers(trx, '525000');

      expect(customers.map((c) => c.name)).toEqual(['Anioł Logistyka']);
    }));

  it('finds no Customer when neither name nor tax number matches', () =>
    withRollback(async (trx) => {
      await seedCustomers(trx, [devil, anioł]);

      expect(await findCustomers(trx, 'Nieznana')).toEqual([]);
    }));

  it('orders the matches by name', () =>
    withRollback(async (trx) => {
      await seedCustomers(trx, [devil, anioł]);

      const customers = await findCustomers(trx, '3');

      expect(customers.map((c) => c.name)).toEqual(['Anioł Logistyka', 'Devil Transport']);
    }));

  it('orders the matches by name in Polish alphabetical order', () =>
    withRollback(async (trx) => {
      await seedCustomers(trx, [
        { name: 'Zenit', tax: '9990000014' },
        { name: 'Śląsk Trans', tax: '9990000020' },
        { name: 'Sokół', tax: '9990000037' },
      ]);

      const customers = await findCustomers(trx, '999000');

      expect(customers.map((c) => c.name)).toEqual(['Sokół', 'Śląsk Trans', 'Zenit']);
    }));
});
