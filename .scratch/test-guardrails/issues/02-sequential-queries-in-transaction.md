# 02 — Catch parallel queries on one transaction

Status: needs-triage

From the timeline-week retro (2026-10-28).

## Problem

A test seed ran `Promise.all` over inserts on one `trx`. pg warned `Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0`. Neither reviewer caught it; it only surfaced in the pre-commit hook output. One transaction is one client, so its queries must run one after another. That is a mechanical pattern, so it wants a check rather than a coding-standards rule.

## Options (pick one in triage)

- Run the `db` vitest project with Node's `--throw-deprecation` (`execArgv` in its pool options). Check first that vitest's own `DEP0205` (`module.register()`) warning doesn't trip it in the worker.
- A Biome GritQL plugin flagging `Promise.all` whose elements call a `trx`/transaction.

## Done when

- Reintroducing `Promise.all` over `trx` inserts in a `*.db.test.ts` fails `pnpm exec vitest --run` or `pnpm check`.
