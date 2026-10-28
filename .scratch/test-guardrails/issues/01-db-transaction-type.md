# 01 — Correct `dbTransaction` type

Status: ready-for-agent

From the timeline-week retro (2026-10-28).

## Problem

`db/db.ts` types `dbTransaction` as `PostgresJsDatabase<typeof schema>`, but `db` is a node-postgres client. To get a real transaction type, `__tests__/db/with-rollback.ts` derives its own `Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]`. So there are two transaction types, and the exported one is wrong.

## Scope

- `db/db.ts` exports `dbTransaction` derived from `db.transaction` (the same expression `with-rollback.ts` uses).
- `__tests__/db/with-rollback.ts` and `orders-in-week.db.test.ts` use `dbTransaction` and drop their own `Transaction`.
- Callers: `lib/dal/order.dal.ts`, `lib/dal/truck.dal.ts`, `lib/services/*`.

## Done when

- One transaction type exists, `pnpm typecheck` passes, and `pnpm exec vitest --run` is green.
