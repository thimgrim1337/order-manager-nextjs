import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { customer } from '@/db/schemas';
import { findCustomers } from '@/lib/dal/customer.dal';
import { withRollback } from '../db/with-rollback';

async function seedCustomers(trx: dbTransaction, customers: { name: string; tax: string }[]) {
  return trx.insert(customer).values(customers).returning();
}

const devil = { name: 'Devil Transport', tax: 'PL7743241555' };
const anioł = { name: 'Anioł Logistyka', tax: 'PL5250001009' };

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

      const customers = await findCustomers(trx, 'PL');

      expect(customers.map((c) => c.name)).toEqual(['Anioł Logistyka', 'Devil Transport']);
    }));
});
