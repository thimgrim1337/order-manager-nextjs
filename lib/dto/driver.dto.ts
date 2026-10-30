import { createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { driver } from '@/db/schemas';

const selectDriverSchema = createSelectSchema(driver);

export type DriverDto = z.infer<typeof selectDriverSchema>;
