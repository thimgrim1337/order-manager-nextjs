import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { country } from '@/db/schemas';

const selectCountrySchema = createSelectSchema(country);

export type CountryDto = z.infer<typeof selectCountrySchema>;
