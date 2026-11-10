import { describe, expect, it } from 'vitest';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { type OrderDay, orderDays } from '@/lib/order-day';
import { place } from './utils/place';
import { week } from './utils/week';

describe('Order Day: orderDays', () => {
  const w44 = week('2026-W44');
  const poland: CountryReadModel = { id: 1, name: 'Poland', code: 'PL' };
  const germany: CountryReadModel = { id: 2, name: 'Germany', code: 'DE' };
  const city = (id: number, name: string, country: CountryReadModel) =>
    place({ id, name, postal: '00-001', countryId: country.id }, country);
  const warszawa = city(1, 'Warszawa', poland);
  const plock = city(2, 'Płock', poland);
  const berlin = city(3, 'Berlin', germany);
  const customer: CustomerReadModel = { id: 1, name: 'Acme', tax: 'PL1234567890' };
  const order = (dates: { startDate: string; endDate: string }) => ({
    ...dates,
    loadingPlaces: [warszawa, plock],
    unloadingPlaces: [plock, berlin],
    customer,
  });
  const daysOf = (order: Parameters<typeof orderDays>[1]) => orderDays(w44, order);
  const shown = (day: OrderDay) => ({
    loadingPlace: day.loadingPlace?.name,
    unloadingPlace: day.unloadingPlace?.name,
    customer: day.customer?.name,
  });
  const kinds = (days: OrderDay[]) => days.map((day) => day.kind);
  const flagged = (days: OrderDay[]) =>
    days.filter((day) => day.continuesBefore || day.continuesAfter);

  it('marks loading, transit and unloading days of an Order inside the Week', () => {
    expect(kinds(daysOf(order({ startDate: '2026-10-27', endDate: '2026-10-30' })))).toEqual([
      'none',
      'loading',
      'transit',
      'transit',
      'unloading',
      'none',
      'none',
    ]);
  });

  it('marks a day with both loading and unloading as loading-unloading', () => {
    expect(kinds(daysOf(order({ startDate: '2026-10-28', endDate: '2026-10-28' })))).toEqual([
      'none',
      'none',
      'loading-unloading',
      'none',
      'none',
      'none',
      'none',
    ]);
  });

  it('flags Monday as continuing from the previous Week when the Order starts before Monday', () => {
    const days = daysOf(order({ startDate: '2026-10-23', endDate: '2026-10-27' }));

    expect(kinds(days)).toEqual(['transit', 'unloading', 'none', 'none', 'none', 'none', 'none']);
    expect(days[0].continuesBefore).toBe(true);
    expect(flagged(days)).toHaveLength(1);
  });

  it('flags Sunday as continuing into the next Week when the Order ends after Sunday', () => {
    const days = daysOf(order({ startDate: '2026-10-30', endDate: '2026-11-02' }));

    expect(kinds(days)).toEqual(['none', 'none', 'none', 'none', 'loading', 'transit', 'transit']);
    expect(days[6].continuesAfter).toBe(true);
    expect(flagged(days)).toHaveLength(1);
  });

  it('marks every day as transit, with both flags, when the Order spans the whole Week', () => {
    const days = daysOf(order({ startDate: '2026-10-20', endDate: '2026-11-05' }));

    expect(kinds(days)).toEqual(Array(7).fill('transit'));
    expect(days[0].continuesBefore).toBe(true);
    expect(days[6].continuesAfter).toBe(true);
  });

  it('shows the first Loading Place and the Customer on the loading day, the last Unloading Place on the unloading day', () => {
    const days = daysOf(order({ startDate: '2026-10-27', endDate: '2026-10-30' }));

    expect(days.map(shown)).toEqual([
      {},
      { loadingPlace: 'Warszawa', customer: 'Acme' },
      {},
      {},
      { unloadingPlace: 'Berlin' },
      {},
      {},
    ]);
  });

  it('shows both places and the Customer when loading and unloading fall on the same day', () => {
    const days = daysOf(order({ startDate: '2026-10-28', endDate: '2026-10-28' }));

    expect(shown(days[2])).toEqual({
      loadingPlace: 'Warszawa',
      unloadingPlace: 'Berlin',
      customer: 'Acme',
    });
  });

  it('shows where an Order crossing the Week came from on Monday and where it goes on Sunday', () => {
    const days = daysOf(order({ startDate: '2026-10-20', endDate: '2026-11-05' }));

    expect(shown(days[0])).toEqual({ loadingPlace: 'Warszawa' });
    expect(days.slice(1, 6).map(shown)).toEqual(Array(5).fill({}));
    expect(shown(days[6])).toEqual({ unloadingPlace: 'Berlin' });
  });

  it('shows only the Unloading Place when a continuing Monday is the unloading day, and only the Loading Place when a continuing Sunday is the loading day', () => {
    const endsMonday = daysOf(order({ startDate: '2026-10-23', endDate: '2026-10-26' }));
    const startsSunday = daysOf(order({ startDate: '2026-11-01', endDate: '2026-11-03' }));

    expect(shown(endsMonday[0])).toEqual({ unloadingPlace: 'Berlin' });
    expect(shown(startsSunday[6])).toEqual({ loadingPlace: 'Warszawa', customer: 'Acme' });
  });

  it('shows no place, but still the Customer, for an Order without Loading or Unloading Places', () => {
    const noPlaces = {
      ...order({ startDate: '2026-10-20', endDate: '2026-10-28' }),
      loadingPlaces: [],
      unloadingPlaces: [],
    };
    const crossing = daysOf(noPlaces);
    const sameDay = daysOf({ ...noPlaces, startDate: '2026-10-29', endDate: '2026-10-29' });

    expect(shown(crossing[0])).toEqual({});
    expect(shown(crossing[2])).toEqual({});
    expect(shown(sameDay[3])).toEqual({ customer: 'Acme' });
  });

  it("shows each Place with its City's Country", () => {
    const days = daysOf(order({ startDate: '2026-10-28', endDate: '2026-10-28' }));

    expect(days[2]?.loadingPlace?.country).toEqual(poland);
    expect(days[2]?.unloadingPlace?.country).toEqual(germany);
  });
});
