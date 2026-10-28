# 03 — Document the DAL seam in CODING_STANDARDS.md

Status: ready-for-agent

From the timeline-week retro (2026-10-28).

## Problem

Issue `timeline-week/02` introduced a data-access convention whose reason lives only in `.scratch/timeline-week/decisions.md` (Q9): `cacheTag()` throws outside the Next runtime, so a query that needs testing can't be the cached function itself. The next DAL change won't know to follow it, and the reviewer has no rule to enforce.

## Scope

Add a "Data access" section to `CODING_STANDARDS.md` (judgement rules, read at review):

- A query worth testing is a `find*(db: db | dbTransaction, …)` function; a thin `get*` adapter adds `'use cache'` + `cacheTag` and holds no other logic. Why: `cacheTag()` throws outside Next.
- Query tests are `*.db.test.ts`, seed their own rows and run inside `withRollback` (`__tests__/db/with-rollback.ts`).
- Example: `findOrdersInWeek` / `getOrdersInWeek` in `lib/dal/order.dal.ts`.

## Done when

- The section exists and names the reason and the example.
