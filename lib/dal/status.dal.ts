import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { status } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

/** Every Status. */
async function findStatuses(database: db | dbTransaction) {
  return database.select({ id: status.id, name: status.name }).from(status);
}

export type StatusReadModel = Awaited<ReturnType<typeof findStatuses>>[number];

export async function getAllStatuses() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Status);

  return findStatuses(db);
}
