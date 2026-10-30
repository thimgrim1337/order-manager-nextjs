import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import { CACHE_TAG } from '@/lib/consts';

export async function getAllStatuses() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Status);

  return db.query.status.findMany();
}
