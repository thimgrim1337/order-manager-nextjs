import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCustomerService } from '@/lib/services/customer.services';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const customerForm = { name: 'Test Firma', tax: 'PL1234567890' };

describe('createCustomerService', () => {
  beforeEach(() => {
    vi.mocked(updateTag).mockClear();
  });

  it('saves a Customer', () =>
    withRollback(async (trx) => {
      const [failure, created] = await createCustomerService(trx, customerForm);

      expect(failure).toBeNull();
      expect(created).toMatchObject(customerForm);
    }));

  it('rejects a Customer whose tax number is taken', () =>
    withRollback(async (trx) => {
      await createCustomerService(trx, customerForm);

      const [failure] = await createCustomerService(trx, { ...customerForm, name: 'Inna Firma' });

      expect(failure).toEqual({ reason: 'CustomerTaken' });
    }));

  it('rejects a Customer with a too short tax number', () =>
    withRollback(async (trx) => {
      const [failure] = await createCustomerService(trx, { ...customerForm, tax: 'PL123' });

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('invalidates cached Customers once created', () =>
    withRollback(async (trx) => {
      await createCustomerService(trx, customerForm);

      expect(updateTag).toHaveBeenCalledExactlyOnceWith('customers');
    }));

  it('invalidates nothing when not created', () =>
    withRollback(async (trx) => {
      await createCustomerService(trx, { ...customerForm, tax: 'PL123' });

      expect(updateTag).not.toHaveBeenCalled();
    }));
});
