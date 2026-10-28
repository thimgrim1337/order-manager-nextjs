# 02 — Orders-in-Week query + `db` vitest project

Status: ready-for-agent
Blocked by: 01

Decisions: `.scratch/timeline-week/decisions.md` (Q1, Q4, Q5, Q6, Q9, Q15, Q17, Q18).

## Goal

A dedicated query owns the "Order in a Week" rule (see GLOSSARY), tested against real Postgres.

## Scope

- In `lib/dal/order.dal.ts`:
  - `findOrdersInWeek(db: db | dbTransaction, week: Week, opts?: { driverId?: number })`:
    - reads from `ordersWithDetailsView`;
    - `startDate <= Sunday AND endDate >= Monday`, using `weekDays(week)` / `lib/week.ts`;
    - optional `driverId` filter;
    - `ORDER BY startDate ASC, id ASC`;
    - no limit.
  - `getOrdersInWeek(week, opts)`: thin adapter with `'use cache'` + `cacheTag('orders')` that calls `findOrdersInWeek(db, …)`. No other logic in it.
- `timeline-content.tsx` calls `getOrdersInWeek(query.week, { driverId })` instead of `getAllOrders(0, 100, [], …)`. `getAllOrders` is left untouched for the Orders Table.
- `timeline-body.tsx`: border colour = `borderColors[index % borderColors.length]`. Drop `async` from the component (it awaits nothing).
- Vitest: switch `vitest.config.ts` to `test.projects`:
  - `browser`: current config unchanged (`__tests__/**/*.test.{ts,tsx}` excluding `*.db.test.ts`).
  - `db`: `environment: 'node'`, include `__tests__/**/*.db.test.ts`, connects to the `db-test` container (the same env Playwright uses, `NODE_ENV=test`). Document in CLAUDE.md's Development Commands that the `db-test` container must be up.
  - Test helper: run each test inside a transaction that is rolled back at the end (e.g. throw a sentinel from `db.transaction` after the body), passing the `trx` to `findOrdersInWeek`. Seed rows inside the test.

## Tests (`__tests__/OrdersTimeline/orders-in-week.db.test.ts`), for Week 2026-W44 (2026-10-26..2026-11-01)

- An Order fully inside the Week → included.
- Fri 2026-10-23 → Mon 2026-10-26 → included; also included in 2026-W43.
- Sun 2026-11-01 → Tue 2026-11-03 → included.
- An Order spanning longer than the Week (2026-10-20 → 2026-11-05) → included.
- An Order ending Sun 2026-10-25 → excluded.
- An Order starting Mon 2026-11-02 → excluded.
- `driverId` filter excludes other Drivers' Orders.
- 120 Orders in the Week → all 120 returned.
- Order: by Start Date, then `id`.

## Done when

- `pnpm typecheck` and `pnpm check` pass, and `pnpm exec vitest --run` runs both projects green with `db-test` up.
- A Fri→Mon Order is visible on /timeline in both Weeks (manual check against the dev server).
