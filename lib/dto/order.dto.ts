import z from 'zod';
import { order, ordersWithDetailsView } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { selectCitySchema as City } from './city.dto';

export const createOrderFormSchema = z.object({
  orderNr: z
    .string({ error: 'Pole jest wymagane.' })
    .min(1, { error: 'Numer zlecenia nie może być pusty.' }),
  startDate: z.string({ error: 'Pole jest wymagane.' }),
  endDate: z.string({ error: 'Pole jest wymagane.' }),
  statusId: z.number({ error: 'Pole jest wymagane.' }).min(1).max(3),
  truckId: z
    .number({ error: 'Pole jest wymagane.' })
    .min(1, { error: 'Wybierz pojazd.' }),
  driverId: z
    .number({ error: 'Pole jest wymagane.' })
    .min(1, { error: 'Wyberz kierowcę.' }),
  customerId: z
    .number({ error: 'Pole jest wymagane.' })
    .min(1, { error: 'Wybierz zleceniodawcę.' }),
  currency: z.string({ error: 'Pole jest wymagane.' }),
  priceCurrency: z
    .string({ error: 'Pole jest wymagane.' })
    .refine((val) => Number(val) > 0, {
      error: 'Cena musi być wyższa od zera.',
    }),
  loadingPlaces: z
    .array(City, { error: 'Pole jest wymagane.' })
    .min(1, { error: 'Wybierz co najmniej 1 miejsce załadunku.' }),
  unloadingPlaces: z
    .array(City, { error: 'Pole jest wymagane.' })
    .min(1, { error: 'Wybierz co najmniej 1 miejsce rozładunku.' }),
  currencyInfo: z.object(
    {
      rate: z.string(),
      table: z.string(),
      date: z.string(),
    },
    { error: 'Pole jest wymagane.' },
  ),
});
export const createOrderSchema = createInsertSchema(order);
export const selectOrderViewSchema = createSelectSchema(ordersWithDetailsView);
export const selectOrderSchema = createSelectSchema(order);

export type CreateOrderFormDto = z.infer<typeof createOrderFormSchema>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type OrderDto = z.infer<typeof selectOrderViewSchema>;
