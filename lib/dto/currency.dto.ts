import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { currency } from '@/db/schemas';

const selectCurrencySchema = createSelectSchema(currency);

export type CurrencyDto = z.infer<typeof selectCurrencySchema>;
