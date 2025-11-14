import { city, ordersWithDetailsView } from '@/db/schemas';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

const City = createSelectSchema(city);
export type City = z.infer<typeof City>;

export const Order = createSelectSchema(ordersWithDetailsView);
export type Order = z.infer<typeof Order>;

const OrderFilters = Order.extend({
  globalFilters: z.string(),
});
export type OrderFilters = Partial<z.infer<typeof OrderFilters>>;

export type SortOptions = {
  field: string;
  order: 'asc' | 'desc';
};
