import { describe, expect, it } from 'vitest';
import type { CityReadModel } from '@/lib/dal/city.dal';
import { firstLoadingPlace, lastUnloadingPlace } from '@/lib/places';

const city = (id: number, name: string): CityReadModel => ({
  id,
  name,
  postal: '00-001',
  countryId: 1,
});
const warszawa = city(1, 'Warszawa');
const plock = city(2, 'Płock');
const gdansk = city(3, 'Gdańsk');

describe('Places: firstLoadingPlace and lastUnloadingPlace', () => {
  it('picks the first Loading Place and the last Unloading Place', () => {
    const order = { loadingPlaces: [warszawa, plock], unloadingPlaces: [plock, gdansk] };

    expect(firstLoadingPlace(order)).toBe(warszawa);
    expect(lastUnloadingPlace(order)).toBe(gdansk);
  });

  it('has no place for an Order without Loading or Unloading Places', () => {
    const order = { loadingPlaces: [], unloadingPlaces: [] };

    expect(firstLoadingPlace(order)).toBeUndefined();
    expect(lastUnloadingPlace(order)).toBeUndefined();
  });
});
