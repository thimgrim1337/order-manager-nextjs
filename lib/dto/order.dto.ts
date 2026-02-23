import z from 'zod';
import { order, ordersWithDetailsView } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { selectCitySchema as City } from './city.dto';
import { ZOD_ERROR_MESSAGES } from '../consts';

export const createOrderFormSchema = z.object({
  orderNr: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Numer zlecenia nie może być pusty.' }),
  startDate: z.string({ error: ZOD_ERROR_MESSAGES.FieldRequired }),
  endDate: z.string({ error: ZOD_ERROR_MESSAGES.FieldRequired }),
  statusId: z.number({ error: ZOD_ERROR_MESSAGES.FieldRequired }).min(1).max(3),
  truckId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz pojazd.' }),
  driverId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wyberz kierowcę.' }),
  customerId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: 'Wybierz zleceniodawcę.' }),
  currency: z.string({ error: ZOD_ERROR_MESSAGES.FieldRequired }),
  priceCurrency: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .refine((val) => Number(val) > 0, {
      error: 'Cena musi być wyższa od zera.',
    }),
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
export const createOrderSchema = createInsertSchema(order);
export const selectOrderViewSchema = createSelectSchema(ordersWithDetailsView);
export const selectOrderSchema = createSelectSchema(order);

export type CreateOrderFormDto = z.infer<typeof createOrderFormSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type OrderDto = z.infer<typeof selectOrderViewSchema>;
