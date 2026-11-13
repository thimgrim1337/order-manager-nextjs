import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Customers from '@/lib/services/customer.services';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const customerForm = { name: 'Test Firma', tax: 'PL1234567890' };

describe('Customers.createCustomer', () => {
  beforeEach(() => {
    vi.mocked(updateTag).mockClear();
  });

  it('saves a Customer', () =>
    withRollback(async (trx) => {
      const [failure, created] = await Customers.createCustomer(trx, customerForm);

      expect(failure).toBeNull();
      expect(created).toMatchObject(customerForm);
    }));

  it('rejects a Customer whose tax number is taken', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      const [failure] = await Customers.createCustomer(trx, {
        ...customerForm,
        name: 'Inna Firma',
      });

      expect(failure).toEqual({ reason: 'CustomerTaxTaken' });
    }));

  it('rejects a Customer whose name is taken', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      const [failure] = await Customers.createCustomer(trx, {
        ...customerForm,
        tax: 'PL0987654321',
      });

      expect(failure).toEqual({ reason: 'CustomerNameTaken' });
    }));

  it('rejects a Customer with a too short tax number', () =>
    withRollback(async (trx) => {
      const [failure] = await Customers.createCustomer(trx, { ...customerForm, tax: 'PL123' });

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('invalidates cached Customers once created', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      expect(updateTag).toHaveBeenCalledExactlyOnceWith('customers');
    }));

  it('invalidates nothing when not created', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, { ...customerForm, tax: 'PL123' });

      expect(updateTag).not.toHaveBeenCalled();
    }));
});
