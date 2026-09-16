import { use } from 'react';
import type z from 'zod';
import type { RawSearchParams } from '@/types/types';

export default function useValidatedSearchParams<T extends z.ZodType>(
  searchParamsPromise: Promise<RawSearchParams>,
  schema: T,
) {
  const raw = use(searchParamsPromise);

  return schema.safeParse(raw);
}
