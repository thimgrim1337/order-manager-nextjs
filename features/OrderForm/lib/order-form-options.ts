import { formOptions } from '@tanstack/react-form-nextjs';
import { ORDER_STATUS } from '@/lib/consts';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import type { DriverReadModel } from '@/lib/dal/driver.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import type { TruckReadModel } from '@/lib/dal/truck.dal';
import { addDays, getToday } from '@/lib/dates';
import type { OrderInputDto } from '@/lib/dto/order.dto';
import { OrderFormSchema } from '@/lib/dto/order.dto';
import { type StoredExchangeRate, toStoredExchangeRate } from '@/lib/exchange-rate';

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
    customer: null as CustomerReadModel | null,
    driver: null as DriverReadModel | null,
    truck: null as TruckReadModel | null,
    // Widened, or the form would only accept this one Status.
    statusId: ORDER_STATUS.InProgress as number,
    priceCurrency: '1',
    currencyId: 1,
    loadingPlaces: [] as CityReadModel[] | [],
    unloadingPlaces: [] as CityReadModel[] | [],
  },
  validators: {
    // Also runs on submit; it holds the Loading/Unloading Date order the Orders module enforces.
    onChange: OrderFormSchema,
  },
});

/** The form's values for editing `order`, or for a new Order dated from today when there is none. */
export const getStartingValues = (order?: OrderReadModel) => {
  if (!order) return { ...orderFormOptions.defaultValues, ...getDefaultOrderDates() };

  return {
    ...orderFormOptions.defaultValues,
    orderNr: order.orderNr,
    startDate: order.startDate,
    endDate: order.endDate,
    customer: order.customer,
    driver: order.driver,
    truck: order.truck,
    statusId: order.status.id,
    priceCurrency: order.priceCurrency,
    currencyId: order.currency.id,
    loadingPlaces: order.loadingPlaces,
    unloadingPlaces: order.unloadingPlaces,
  };
};

/** What the form holds, from opening to submit. */
type FormValues = ReturnType<typeof getStartingValues>;

/**
 * The Order input the form's values save as: its picked Customer, Truck and Driver as their ids,
 * its picked Places as City ids, in picked order. Only a valid form saves, so each is picked by then.
 */
export const toOrderInput = ({
  customer,
  truck,
  driver,
  loadingPlaces,
  unloadingPlaces,
  ...fields
}: FormValues): OrderInputDto => ({
  ...fields,
  customerId: customer?.id ?? 0,
  truckId: truck?.id ?? 0,
  driverId: driver?.id ?? 0,
  loadingPlaces: loadingPlaces.map((city) => city.id),
  unloadingPlaces: unloadingPlaces.map((city) => city.id),
});

/** The Exchange Rate the form starts with: `order`'s stored one, or none for a new Order. */
export const getStartingExchangeRate = (order?: OrderReadModel): StoredExchangeRate | null =>
  order ? toStoredExchangeRate(order) : null;
