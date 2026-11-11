# The e2e cleanup expires the app's cache through a test-only route

e2e seeds write to the db-test database from the Playwright process, outside the app, so no `updateTag` drops the cached reads the server kept from earlier tests; a page opened after a seed could show an earlier test's Orders, Customers or Trucks. `cleanupTestData` therefore calls `POST /api/e2e/expire-cache`, which expires every `CACHE_TAG` with `revalidateTag(tag, { expire: 0 })`. The route answers 404 unless the server runs with `E2E` set, which only Playwright's `webServer.env` does; `NODE_ENV` cannot gate it, since `next build` and `next start` force `production`.

We considered turning the cache off in the e2e build (a no-op `cacheHandlers`), and kept it on: the e2e specs check that a write's `updateTag` drops a cached read (`cacheEmptySearch`), which a build without a cache would pass by construction. Restarting the server per test would cost seconds per test and still leave one spec's tests sharing a cache.

## Consequences

- A spec that writes to the database outside the app must do it right after `cleanupTestData`, before any page loads, or expire the cache again.
- The route ships in the production build, inert without `E2E`.
- `lib/services/cache.services.ts` is no entity's service: it sits there because only `lib/services` may invalidate cache tags. Writes still invalidate their own tags in their entity's service.
