import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { city } from '@/db/schemas';
import { ZOD_ERROR_MESSAGES } from '../consts';
import { nameSchema } from '../name';

export const createCitySchema = createInsertSchema(city, {
  name: nameSchema(20, 'Nazwa miejscowości nie może być dłuższa niż 20 znaków.'),
  postal: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: ZOD_ERROR_MESSAGES.FieldRequired })
    .max(6, {
      error: 'Kod pocztowy nie może być dłuższy niż 6 znaków.',
    })
    .trim(),
  countryId: z
    .number({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: ZOD_ERROR_MESSAGES.FieldRequired }),
});
export const selectCitySchema = createSelectSchema(city);

export type CreateCityDto = z.input<typeof createCitySchema>;
