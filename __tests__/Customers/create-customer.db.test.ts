import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Customers from '@/lib/services/customer.services';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const customerForm = { name: 'Test Firma', tax: '7743241555' };
const otherTax = '5260250995';

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

  it.each([
    { typed: 'PL 774-324-15.55', saved: '7743241555' },
    { typed: 'nl 8517.25.640.b01', saved: 'NL851725640B01' },
  ])('saves the Tax Number $typed as $saved', ({ typed, saved }) =>
    withRollback(async (trx) => {
      const [, created] = await Customers.createCustomer(trx, { ...customerForm, tax: typed });

      expect(created?.tax).toBe(saved);
    }));

  it('rejects a Customer whose Tax Number is taken', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      const [failure] = await Customers.createCustomer(trx, {
        ...customerForm,
        name: 'Inna Firma',
      });

      expect(failure).toEqual({ reason: 'CustomerTaxTaken' });
    }));

  it('rejects a Customer whose Polish NIP is taken with a PL prefix and separators', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      const [failure] = await Customers.createCustomer(trx, {
        name: 'Inna Firma',
        tax: 'pl 774-324-15.55',
      });

      expect(failure).toEqual({ reason: 'CustomerTaxTaken' });
    }));

  it('rejects a Customer whose name is taken', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, customerForm);

      const [failure] = await Customers.createCustomer(trx, {
        ...customerForm,
        tax: otherTax,
      });

      expect(failure).toEqual({ reason: 'CustomerNameTaken' });
    }));

  it('rejects a Customer whose name is taken in other letter case, Polish letters included', () =>
    withRollback(async (trx) => {
      await Customers.createCustomer(trx, { ...customerForm, name: 'Śląsk Trans' });

      const [failure] = await Customers.createCustomer(trx, {
        name: 'ŚLĄSK TRANS',
        tax: otherTax,
      });

      expect(failure).toEqual({ reason: 'CustomerNameTaken' });
    }));

  it('saves a Customer with repeated spaces in its name as one, taking that name', () =>
    withRollback(async (trx) => {
      const [, created] = await Customers.createCustomer(trx, {
        ...customerForm,
        name: 'Zz   Trans',
      });
      const [failure] = await Customers.createCustomer(trx, { name: 'Zz Trans', tax: otherTax });

      expect(created?.name).toBe('Zz Trans');
      expect(failure).toEqual({ reason: 'CustomerNameTaken' });
    }));

  it('rejects a Customer with a too short Tax Number', () =>
    withRollback(async (trx) => {
      const [failure] = await Customers.createCustomer(trx, { ...customerForm, tax: 'PL123' });

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('rejects a Customer whose Polish NIP fails its checksum', () =>
    withRollback(async (trx) => {
      const [failure] = await Customers.createCustomer(trx, { ...customerForm, tax: '7743241556' });

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
