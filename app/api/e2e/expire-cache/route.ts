import { ENV } from '@/env';
import { expireEveryCacheTag } from '@/lib/services/cache.services';

/** e2e only (ADR 0003): not found unless Playwright's server sets `E2E`. */
export function POST() {
  if (!ENV.E2E) return new Response(null, { status: 404 });

  expireEveryCacheTag();
  return new Response(null, { status: 204 });
}
