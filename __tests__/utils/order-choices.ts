import type { OrderChoices } from '@/features/shared/lib/order-choices';

/**
 * The choices a browser test renders the Order form or filters with: Płock and DEVIL, two Drivers,
 * two Trucks (one with a Driver), PLN/EUR/USD and the three Statuses.
 */
export const orderChoices = (): OrderChoices => ({
  cities: [{ id: 1, name: 'Płock', postal: '09-410', countryId: 1 }],
  customers: [{ id: 1, name: 'DEVIL', tax: '7743241555' }],
  drivers: [
    { id: 1, firstName: 'Jan', lastName: 'Kowalski' },
    { id: 2, firstName: 'Adam', lastName: 'Nowak' },
  ],
  trucks: [
    {
      id: 1,
      plate: 'WND0997C',
      insuranceEndAt: '2027-06-01',
      serviceEndAt: '2027-06-01',
      driverId: 1,
    },
    {
      id: 2,
      plate: 'WPL1234A',
      insuranceEndAt: '2027-06-01',
      serviceEndAt: '2027-06-01',
      driverId: null,
    },
  ],
  countries: [{ id: 1, name: 'Poland', code: 'PL' }],
  currencies: [
    { id: 1, code: 'PLN' },
    { id: 2, code: 'EUR' },
    { id: 3, code: 'USD' },
  ],
  statuses: [
    { id: 1, name: 'w trakcie' },
    { id: 2, name: 'anulowane' },
    { id: 3, name: 'zakończone' },
  ],
});
