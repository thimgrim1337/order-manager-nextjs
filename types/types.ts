import { city, ordersWithDetailsView } from '@/db/schemas';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

const City = createSelectSchema(city);
export type City = z.infer<typeof City>;

export const Order = createSelectSchema(ordersWithDetailsView);
export type Order = z.infer<typeof Order>;

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
});
export type SearchParams = z.infer<typeof SearchParams>;
