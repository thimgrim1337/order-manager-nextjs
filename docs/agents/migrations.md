# Migrations

`pnpm db:generate --name=<topic>` writes `db/migrations/<n>_<topic>.sql` from the schema diff. The `db-test` container is migrated from empty, so tests pass on a migration that fails on a database with rows: read the generated SQL before committing it.

## A NOT NULL column on a table with rows

Drizzle emits `ADD COLUMN … NOT NULL` with no default, which fails on any existing row. Rewrite it as three statements, each ending in `--> statement-breakpoint`:

1. `ADD COLUMN` without `NOT NULL`.
2. `UPDATE` to backfill every row, deterministically (e.g. `ROW_NUMBER() OVER (PARTITION BY … ORDER BY …)`).
3. `ALTER COLUMN … SET NOT NULL`, then any constraints.

`0003_place-position.sql` is a worked example.

## The `orders_with_details` view

The view is SQL only. Drizzle sees it through `pgView(…).existing()` in `db/schemas/order.ts` and never generates it. Its current definition is the latest migration that recreates it: `grep -l 'CREATE VIEW orders_with_details' db/migrations | sort | tail -1`.

To change it, add a statement to the migration (or a `pnpm db:generate --custom --name=<topic>` one): `DROP VIEW orders_with_details;` and the whole `CREATE VIEW`, copied from that latest definition and edited. A column added, removed or renamed in the view is changed in the `pgView` column list too.

Its `loading_city`/`unloading_city` columns pick the same Places as `lib/places.ts`: the first Loading Place and last Unloading Place by `position`.

## Checking a backfill

Run the backfill against real-shaped rows in a transaction that rolls back:

```sh
NODE_ENV=test docker compose exec -T db-test psql -U postgres -d postgres_test -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
-- create or insert sample rows, run the UPDATE, SELECT the result
ROLLBACK;
SQL
```
