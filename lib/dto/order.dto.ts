import { isAfter } from 'date-fns';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { order, ordersWithDetailsView } from '@/db/schemas';
import { ORDER_STATUS, ZOD_ERROR_MESSAGES } from '../consts';
import { toDate } from '../dates';
import { selectCitySchema as City } from './city.dto';

const OrderFormFields = z.object({
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
  loadingPlaces: z
    .array(City, { error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz co najmniej 1 miejsce załadunku.' }),
  unloadingPlaces: z
    .array(City, { error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz co najmniej 1 miejsce rozładunku.' }),
  currencyInfo: z.object(
    {
      rate: z.string(),
      table: z.string(),
      date: z.string(),
    },
    { error: ZOD_ERROR_MESSAGES.FieldRequired },
  ),
});

const OrderDates = OrderFormFields.pick({ startDate: true, endDate: true });

const isLoadingAfterUnloading = ({ startDate, endDate }: z.infer<typeof OrderDates>) =>
  isAfter(toDate(startDate), toDate(endDate));

/** Checks the dates even while other fields are invalid, so the form shows it as the user types. */
const onlyWhenDatesValid = {
  when: ({ value }: { value: unknown }) => OrderDates.safeParse(value).success,
};

/** The Order form, shared by the form's validation and the Orders module's. */
export const OrderFormSchema = OrderFormFields.refine((order) => !isLoadingAfterUnloading(order), {
  error: 'Data załadunku nie może być późniejsza niż data rozładunku.',
  path: ['startDate'],
  ...onlyWhenDatesValid,
}).refine((order) => !isLoadingAfterUnloading(order), {
  error: 'Data rozładunku nie może być wcześniejsza niż data załadunku.',
  path: ['endDate'],
  ...onlyWhenDatesValid,
});

const selectOrderViewSchema = createSelectSchema(ordersWithDetailsView);
export const selectOrderSchema = createSelectSchema(order);

export type OrderFormDto = z.infer<typeof OrderFormSchema>;
type OrderWithDetailsDto = z.infer<typeof selectOrderViewSchema>;
export type OrderTableDto = Required<
  Pick<
    OrderWithDetailsDto,
    | 'id'
    | 'currency'
    | 'customer'
    | 'driver'
    | 'startDate'
    | 'endDate'
    | 'loadingPlaces'
    | 'unloadingPlaces'
    | 'orderNr'
    | 'priceCurrency'
    | 'pricePLN'
    | 'status'
    | 'truck'
  >
>;
export type OrderDto = z.infer<typeof selectOrderSchema>;
