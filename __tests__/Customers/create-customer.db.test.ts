import { describe, expect, it } from 'vitest';
import { createCustomerService } from '@/lib/services/customer.services';
import { withRollback } from '../db/with-rollback';

const customerForm = { name: 'Test Firma', tax: 'PL1234567890' };

describe('createCustomerService', () => {
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
});
