import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { status } from '@/db/schemas';

const selectStatusSchema = createSelectSchema(status);
export type StatusDto = z.infer<typeof selectStatusSchema>;
