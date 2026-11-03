import { updateTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { country } from '@/db/schemas';
import * as Cities from '@/lib/services/city.services';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seedCountry(trx: dbTransaction) {
  const [dbCountry] = await trx.insert(country).values({ name: 'Polska', code: 'PL' }).returning();

  return dbCountry;
}

describe('Cities.createCity', () => {
  beforeEach(() => {
    vi.mocked(updateTag).mockClear();
  });

  it('saves a City', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);

      const [failure, created] = await Cities.createCity(trx, {
        name: 'Kraków',
        postal: '30-001',
        countryId: dbCountry.id,
      });

      expect(failure).toBeNull();
      expect(created).toMatchObject({ name: 'Kraków', postal: '30-001', countryId: dbCountry.id });
    }));

  it('rejects a City whose name is taken', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      const krakow = { name: 'Kraków', postal: '30-001', countryId: dbCountry.id };
      await Cities.createCity(trx, krakow);

      const [failure] = await Cities.createCity(trx, { ...krakow, postal: '30-002' });

      expect(failure).toEqual({ reason: 'CityTaken' });
    }));

  it('rejects a City without a name', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);

      const [failure] = await Cities.createCity(trx, {
        name: '',
        postal: '30-001',
        countryId: dbCountry.id,
      });

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('invalidates cached Cities once created', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      await Cities.createCity(trx, { name: 'Kraków', postal: '30-001', countryId: dbCountry.id });

      expect(updateTag).toHaveBeenCalledExactlyOnceWith('cities');
    }));

  it('invalidates nothing when not created', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      await Cities.createCity(trx, { name: '', postal: '30-001', countryId: dbCountry.id });

      expect(updateTag).not.toHaveBeenCalled();
    }));
});
