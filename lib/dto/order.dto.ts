import { isAfter } from 'date-fns';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { order } from '@/db/schemas';
import { ORDER_STATUS, ZOD_ERROR_MESSAGES } from '../consts';
import { toDate } from '../dates';
import { selectCitySchema as City } from './city.dto';

const OrderFields = z.object({
  orderNr: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Numer zlecenia nie może być pusty.' })
    .trim(),
  startDate: z.string({ error: ZOD_ERROR_MESSAGES.FieldRequired }),
  endDate: z.string({ error: ZOD_ERROR_MESSAGES.FieldRequired }),
  statusId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(ORDER_STATUS.InProgress)
    .max(ORDER_STATUS.Delivered),
  truckId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz pojazd.' }),
  driverId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wyberz kierowcę.' }),
  customerId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz zleceniodawcę.' }),
  currencyId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz walutę' }),
  priceCurrency: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .refine((val) => Number(val) > 0, {
      error: 'Cena musi być wyższa od zera.',
    })
    .trim(),
});

/** An Order's Loading and Unloading Places, each list holding at least one, in the order entered. */
const withPlaces = <Place extends z.ZodType>(place: Place) =>
  OrderFields.extend({
    loadingPlaces: z
      .array(place, { error: ZOD_ERROR_MESSAGES.FieldRequired })
      .min(1, { error: 'Wybierz co najmniej 1 miejsce załadunku.' }),
    unloadingPlaces: z
      .array(place, { error: ZOD_ERROR_MESSAGES.FieldRequired })
      .min(1, { error: 'Wybierz co najmniej 1 miejsce rozładunku.' }),
  });

/** On the form, the Loading and Unloading Places are the Cities the user picked. */
const OrderFormFields = withPlaces(City);

/** On the Order input, the Loading and Unloading Places are City ids. */
const OrderInputFields = withPlaces(z.int().positive());

const OrderDates = OrderFields.pick({ startDate: true, endDate: true });

const isLoadingAfterUnloading = ({ startDate, endDate }: z.infer<typeof OrderDates>) =>
  isAfter(toDate(startDate), toDate(endDate));

/** Checks the dates even while other fields are invalid, so the form shows it as the user types. */
const onlyWhenDatesValid = {
  when: ({ value }: { value: unknown }) => OrderDates.safeParse(value).success,
};

/** Holds the Loading Date no later than the Unloading Date, on the form and on the Order input. */
const withOrderedDates = <T extends z.ZodType<z.infer<typeof OrderDates>>>(fields: T) =>
  fields
    .refine((order) => !isLoadingAfterUnloading(order), {
      error: 'Data załadunku nie może być późniejsza niż data rozładunku.',
      path: ['startDate'],
      ...onlyWhenDatesValid,
    })
    .refine((order) => !isLoadingAfterUnloading(order), {
      error: 'Data rozładunku nie może być wcześniejsza niż data załadunku.',
      path: ['endDate'],
      ...onlyWhenDatesValid,
    });

/** The Order form's validation. */
export const OrderFormSchema = withOrderedDates(OrderFormFields);

/** What the Orders module saves an Order from: its fields, with its Places as City ids. */
export const OrderInputSchema = withOrderedDates(OrderInputFields);

export const selectOrderSchema = createSelectSchema(order);

export type OrderInputDto = z.infer<typeof OrderInputSchema>;
export type OrderDto = z.infer<typeof selectOrderSchema>;
