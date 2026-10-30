import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { country } from '@/db/schemas';
import { createCityService } from '@/lib/services/city.services';
import { withRollback } from '../db/with-rollback';

async function seedCountry(trx: dbTransaction) {
  const [dbCountry] = await trx.insert(country).values({ name: 'Polska', code: 'PL' }).returning();

  return dbCountry;
}

describe('createCityService', () => {
  it('saves a City', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);

      const [failure, created] = await createCityService(trx, {
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
      await createCityService(trx, krakow);

      const [failure] = await createCityService(trx, { ...krakow, postal: '30-002' });

      expect(failure).toEqual({ reason: 'CityTaken' });
    }));

  it('rejects a City without a name', () =>
    withRollback(async (trx) => {
      const dbCountry = await seedCountry(trx);

      const [failure] = await createCityService(trx, {
        name: '',
        postal: '30-001',
        countryId: dbCountry.id,
      });

      expect(failure?.reason).toBe('InvalidData');
    }));
});
