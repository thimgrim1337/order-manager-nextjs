import { describe, expect, it } from 'vitest';
import { firstLoadingPlace, lastUnloadingPlace } from '@/lib/places';
import { place } from './utils/place';

const poland = { id: 1, name: 'Poland', code: 'PL' };
const city = (id: number, name: string) =>
  place({ id, name, postal: '00-001', countryId: poland.id }, poland);
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
