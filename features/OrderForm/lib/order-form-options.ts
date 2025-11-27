import { getToday, getTomorrow } from '@/lib/dates';
import { City } from '@/types/types';
import { formOptions } from '@tanstack/react-form-nextjs';

export const orderFormOptions = formOptions({
  defaultValues: {
    orderNr: '',
    startDate: getToday(),
    endDate: getTomorrow(),
    customerId: 0,
    driverId: 0,
    truckId: 0,
    statusId: 1,
    priceCurrency: '1',
    currencyRate: '1',
    pricePLN: '1',
    currency: 'PLN',
    loadingPlaces: [] as City[] | [],
    unloadingPlaces: [] as City[] | [],
  },
});
