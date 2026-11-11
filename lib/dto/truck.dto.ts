import { createSelectSchema } from 'drizzle-zod';
import { truck } from '@/db/schemas';

export const selectTruckSchema = createSelectSchema(truck);
