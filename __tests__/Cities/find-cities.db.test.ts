import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, country } from '@/db/schemas';
import { findCities } from '@/lib/dal/city.dal';
import { withRollback } from '../db/with-rollback';

async function seedCities(trx: dbTransaction, names: string[]) {
  const [dbCountry] = await trx.insert(country).values({ name: 'Polska', code: 'PL' }).returning();

  return trx
    .insert(city)
    .values(names.map((name, i) => ({ name, postal: `00-${100 + i}`, countryId: dbCountry.id })))
    .returning();
}

describe('findCities', () => {
  it('finds a City by part of its name, ignoring case', () =>
    withRollback(async (trx) => {
      await seedCities(trx, ['Płock', 'Warszawa', 'Gdańsk']);

      const cities = await findCities(trx, 'ARSZ');

      expect(cities.map((c) => c.name)).toEqual(['Warszawa']);
    }));

  it('gives each City with its Country', () =>
    withRollback(async (trx) => {
      const [plock] = await seedCities(trx, ['Płock']);

      expect(await findCities(trx, 'Płock')).toEqual([
        {
          id: plock.id,
          name: 'Płock',
          postal: '00-100',
          countryId: plock.countryId,
          country: { id: plock.countryId, name: 'Polska', code: 'PL' },
        },
      ]);
    }));

  it('finds no City when no name matches', () =>
    withRollback(async (trx) => {
      await seedCities(trx, ['Płock', 'Warszawa']);

      expect(await findCities(trx, 'Berlin')).toEqual([]);
    }));

  it.each([
    '_',
    '%',
    '\\',
  ])('finds only Cities containing %s, matching it as itself, alone or within a longer term in any case', (character) =>
    withRollback(async (trx) => {
      await seedCities(trx, [`A${character}1`, 'AB1']);

      expect((await findCities(trx, character)).map((c) => c.name)).toEqual([`A${character}1`]);
      expect((await findCities(trx, `a${character}1`)).map((c) => c.name)).toEqual([
        `A${character}1`,
      ]);
    }));

  it('orders the matches by name', () =>
    withRollback(async (trx) => {
      await seedCities(trx, ['Testowo Dolne', 'Testowo Górne', 'Testowo Bliskie']);

      const cities = await findCities(trx, 'testowo');

      expect(cities.map((c) => c.name)).toEqual([
        'Testowo Bliskie',
        'Testowo Dolne',
        'Testowo Górne',
      ]);
    }));

  it('orders Cities by name in Polish alphabetical order', () =>
    withRollback(async (trx) => {
      await seedCities(trx, ['Mława', 'Łódź', 'Lublin']);

      const cities = await findCities(trx);

      expect(cities.map((c) => c.name)).toEqual(['Lublin', 'Łódź', 'Mława']);
    }));

  it('finds a City beyond the first 10 by name', () =>
    withRollback(async (trx) => {
      const first = Array.from({ length: 10 }, (_, i) => `Aaa ${String(i).padStart(2, '0')}`);
      await seedCities(trx, [...first, 'Zielona Góra']);

      const cities = await findCities(trx, 'zielona');

      expect(cities.map((c) => c.name)).toEqual(['Zielona Góra']);
    }));
});
