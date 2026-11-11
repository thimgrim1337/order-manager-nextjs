import 'server-only';
import { revalidateTag } from 'next/cache';
import { CACHE_TAG } from '../consts';

/**
 * Expires every cached read, for e2e seeds that write to the database outside the app (ADR 0003).
 * `expire: 0`, not `'max'`: the next read must miss, not serve the stale entry once.
 */
export function expireEveryCacheTag() {
  for (const tag of Object.values(CACHE_TAG)) revalidateTag(tag, { expire: 0 });
}
