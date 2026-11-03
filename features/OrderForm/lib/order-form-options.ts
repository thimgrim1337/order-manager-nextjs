import { formOptions } from '@tanstack/react-form-nextjs';
import { ORDER_STATUS } from '@/lib/consts';
import { addDays, getToday } from '@/lib/dates';
import { OrderFormSchema } from '@/lib/dto/order.dto';
import type { City, Order } from '@/types/types';

/** Loading Date today and Unloading Date tomorrow in Warsaw, read from one clock reading when called. */
const getDefaultOrderDates = () => {
  const today = getToday();
  return { startDate: today, endDate: addDays(today, 1) };
};

export const orderFormOptions = formOptions({
  defaultValues: {
    orderNr: '',
    // Placeholders: `getStartingValues` sets them.
    startDate: '',
    endDate: '',
    customerId: 0,
    driverId: 0,
    truckId: 0,
    // Widened, or the form would only accept this one Status.
    statusId: ORDER_STATUS.InProgress as number,
    priceCurrency: '1',
    currencyId: 1,
    loadingPlaces: [] as City[] | [],
    unloadingPlaces: [] as City[] | [],
    currencyInfo: {
      table: '',
      rate: '',
      date: '',
    },
  },
  validators: {
    // Also runs on submit; it holds the Loading/Unloading Date order the Orders module enforces.
    onChange: OrderFormSchema,
  },
});

/** The form's values for editing `order`, or for a new Order dated from today when there is none. */
export const getStartingValues = (order?: Order) => {
  if (!order) return { ...orderFormOptions.defaultValues, ...getDefaultOrderDates() };

  return {
    ...orderFormOptions.defaultValues,
    orderNr: order.orderNr,
    startDate: order.startDate,
    endDate: order.endDate,
    customerId: order.customer.id,
    driverId: order.driver.id,
    truckId: order.truck.id,
    statusId: order.status.id,
    priceCurrency: order.priceCurrency,
    currencyId: order.currency.id,
    loadingPlaces: order.loadingPlaces,
    unloadingPlaces: order.unloadingPlaces,
  };
};
