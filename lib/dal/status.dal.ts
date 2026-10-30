import type { InferSelectModel } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import type { status } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

export type DbStatus = InferSelectModel<typeof status>;

export async function getAllStatuses() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Status);

  return db.query.status.findMany();
}
