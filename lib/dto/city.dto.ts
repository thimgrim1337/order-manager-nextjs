import z from 'zod';
import { city } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const createCitySchema = createInsertSchema(city);
export const selectCitySchema = createSelectSchema(city);

export type CreateCityDto = z.infer<typeof createCitySchema>;
export type CityDto = z.infer<typeof selectCitySchema>;
