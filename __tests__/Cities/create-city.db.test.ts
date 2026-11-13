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

  it('returns the City with its Country, as an Order shows its Places', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);

      const [, created] = await Cities.createCity(trx, {
        name: 'Kraków',
        postal: '30-001',
        countryId: dbCountry.id,
      });

      expect(created?.country).toEqual({ id: dbCountry.id, name: 'Polska', code: 'PL' });
    }));

  it('rejects a City whose name is taken', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      const krakow = { name: 'Kraków', postal: '30-001', countryId: dbCountry.id };
      await Cities.createCity(trx, krakow);

      const [failure] = await Cities.createCity(trx, { ...krakow, postal: '30-002' });

      expect(failure).toEqual({ reason: 'CityNameTaken' });
    }));

  it('rejects a City whose name is taken in other letter case, Polish letters included', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      await Cities.createCity(trx, { name: 'Łódź', postal: '90-001', countryId: dbCountry.id });

      const [failure] = await Cities.createCity(trx, {
        name: 'ŁÓDŹ',
        postal: '90-002',
        countryId: dbCountry.id,
      });

      expect(failure).toEqual({ reason: 'CityNameTaken' });
    }));

  it('saves a City with repeated spaces in its name as one, taking that name', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      const city = { name: 'Nowy  Targ', postal: '34-400', countryId: dbCountry.id };

      const [, created] = await Cities.createCity(trx, city);
      const [failure] = await Cities.createCity(trx, { ...city, name: 'Nowy Targ' });

      expect(created?.name).toBe('Nowy Targ');
      expect(failure).toEqual({ reason: 'CityNameTaken' });
    }));

  it('rejects a City identical to a saved one as its name taken', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);
      const krakow = { name: 'Kraków', postal: '30-001', countryId: dbCountry.id };
      await Cities.createCity(trx, krakow);

      const [failure] = await Cities.createCity(trx, krakow);

      expect(failure).toEqual({ reason: 'CityNameTaken' });
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
