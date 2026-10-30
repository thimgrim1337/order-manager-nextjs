import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { truck } from '@/db/schemas';

const selectTruckSchema = createSelectSchema(truck);

export type TruckDto = z.infer<typeof selectTruckSchema>;
