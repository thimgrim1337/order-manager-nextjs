import { city } from '@/db/schemas';
import { createSelectSchema } from 'drizzle-zod';
import z from 'zod';

const City = createSelectSchema(city);
export type City = z.infer<typeof City>;
