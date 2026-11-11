import { createSelectSchema } from 'drizzle-zod';
import { driver } from '@/db/schemas';

export const selectDriverSchema = createSelectSchema(driver);
