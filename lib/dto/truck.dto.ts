import { truck } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const createTruckSchema = createInsertSchema(truck);
export const selectTruckSchema = createSelectSchema(truck);

export type CreateTruckDto = z.infer<typeof createTruckSchema>;
export type TruckDto = z.infer<typeof selectTruckSchema>;
