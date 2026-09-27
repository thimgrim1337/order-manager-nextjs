import type { InferSelectModel } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import type { status } from '@/db/schemas';

export type DbStatus = InferSelectModel<typeof status>;

export async function getAllStatuses() {
  'use cache';
  cacheLife('days');
  cacheTag('status');

  return db.query.status.findMany();
}
