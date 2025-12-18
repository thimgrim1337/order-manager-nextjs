import { getToday, getTomorrow } from '@/lib/dates';
import { City, orderSchema } from '@/types/types';
import { formOptions } from '@tanstack/react-form-nextjs';
import { isAfter, isBefore } from 'date-fns';

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
    currency: 'PLN',
    loadingPlaces: [] as City[] | [],
    unloadingPlaces: [] as City[] | [],
    currencyInfo: {
      table: '',
      rate: '',
      date: '',
    },
  },

  validators: {
    onChange: orderSchema,
    onSubmit: ({ value }) => {
      const isLoadingDateAfter = isAfter(value.startDate, value.endDate);
      const isUnloadingDateBefore = isBefore(value.endDate, value.startDate);

      if (isLoadingDateAfter || isUnloadingDateBefore) {
        return {
          fields: {
            ...(isLoadingDateAfter
              ? {
                  startDate: {
                    message:
                      'Data załadunku nie może być późniejsza niż data rozładunku.',
                  },
                }
              : {}),
            ...(isUnloadingDateBefore
              ? {
                  endDate: {
                    message:
                      'Data rozładunku nie może być wcześniejsza niż data załadunku.',
                  },
                }
              : {}),
          },
        };
      }
    },
  },
});
