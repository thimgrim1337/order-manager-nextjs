import {
  city,
  country,
  customer,
  driver,
  ordersWithDetailsView,
  truck,
} from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const Order = createSelectSchema(ordersWithDetailsView);
export type Order = z.infer<typeof Order>;

const City = createSelectSchema(city, { id: z.number().optional() });
export type City = z.infer<typeof City>;

const Customer = createSelectSchema(customer);
export type Customer = z.infer<typeof Customer>;

const Driver = createSelectSchema(driver);
export type Driver = z.infer<typeof Driver>;

const Truck = createSelectSchema(truck);
export type Truck = z.infer<typeof Truck>;

const Country = createSelectSchema(country);
export type Country = z.infer<typeof Country>;

export const orderSchema = z.object({
  orderNr: z.string().min(1, { error: 'Numer zlecenia nie może być pusty.' }),
  startDate: z.string(),
  endDate: z.string(),
  statusId: z.number().min(1).max(3),
  truckId: z.number().min(1, { error: 'Wybierz pojazd.' }),
  driverId: z.number().min(1, { error: 'Wyberz kierowcę.' }),
  customerId: z.number().min(1, { error: 'Wybierz zleceniodawcę.' }),
  currency: z.string(),
  priceCurrency: z.string().refine((val) => Number(val) > 0, {
    error: 'Cena musi być wyższa od zera.',
  }),
  pricePLN: z.string(),
  currencyRate: z.string(),
  loadingPlaces: z
    .array(City)
    .min(1, { error: 'Wybierz co najmniej 1 miejsce załadunku.' }),
  unloadingPlaces: z
    .array(City)
    .min(1, { error: 'Wybierz co najmniej 1 miejsce rozładunku.' }),
});
export type OrderCreate = z.infer<typeof orderSchema>;

export type SortOptions = {
  id: string;
  desc: boolean;
};

export const SearchParams = z.object({
  sort: z
    .templateLiteral([z.string(), '.', z.enum(['asc', 'desc'])])
    .optional(),
  globalFilters: z.string().optional(),
  pageIndex: z.number().min(0).default(0).optional(),
  pageSize: z.number().min(10).max(100).default(10).optional(),
  customer: z.string().optional(),
});
export type SearchParams = z.infer<typeof SearchParams>;

export type Data = {
  id: number;
  value: string | number;
};
