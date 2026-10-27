# Decisions: Orders Table Query + Timeline Query (grilling session 2026-10-27)

Problem: one shared Zod `SearchParams` schema (types/types.ts) held the URL contract for both /orders and /timeline. Three sort-field lists disagreed (sorting by driver broke the page: server safeParse dropped all filters, client parse threw), date defaults were computed at module load and forced /orders to the current week, `.catch(1)` turned invalid ids into id 1, page index never reset on filter change.

Decisions:
- Q1: /orders default view = NO date filter (all Orders, paginated), default sort startDate DESC.
- Q2: table date filters keep semantics: Order.startDate >= "Załadunek od" AND Order.endDate <= "Rozładunek do", each bound independent. UI labels renamed to "Załadunek od" / "Rozładunek do".
- Q3: Timeline gets its own narrow URL contract `?week=<monday>&driverId=<id>`; date range derived from week. Placement/overlap logic stays for later (#2).
- Q4: invalid param = treated as absent; other params kept. Never substitute a made-up value.
- Q5: single source of truth for sortable fields; DAL column map typed Record<SortField, Column> so lists can't drift; driverId becomes sortable (by id; sort-by-name is a separate future ticket).
- Q6: any filter/search/sort change goes back to the first page; rule lives in the query module.
- Q7: two modules, Orders Table Query and Timeline Query, each with `parse(raw, today)` (today only where defaults need it), `apply(query, change)`, `toSearchParams(query)` (omits defaults), plus thin client hook returning `{ query, change, reset }` over router.replace. Shared only small parsers (positive id, ISO date). `apply`: a change that doesn't change the query does nothing (DebouncedInput fires on mount).
- Q8: keep existing URL param names for the table (startDate, endDate, driverId, statusId, globalFilters, sort, pageIndex, pageSize).
- Q9: id validation = positive integer only (no max(3)/max(100)).
- Q10: Reset clears filters, search and sort; keeps pageSize.
- Q11: getAllOrders signature unchanged (DAL criteria refactor is #6); fix only the `[]`-is-truthy bug that yields no ORDER BY. Default sort lives in Orders Table Query.
- Q12: vitest unit tests on parse/apply/toSearchParams with fixed `today`; no hook/component tests. Delete use-validated-search-params.ts and SearchParams from types.ts.
- Q13: controls read their value from the query (timeline-driver-select, status-select, driver-combobox), not only write.
- Q14: `week` that isn't Monday is snapped to its Monday; toSearchParams always writes Monday.
- Q15: out of scope for #1: cross-week overlap filter, 100-order cap, week numbering/week-select list; arrows only call change({ week: ±7 days }).
- Q16: server/client "today" may briefly differ around Sunday midnight: accepted, no redirect.
- Q17: files: features/OrdersTable/lib/orders-table-query.ts, features/OrdersTable/hooks/use-orders-table-query.ts, features/OrdersTimeline/lib/timeline-query.ts, features/OrdersTimeline/hooks/use-timeline-query.ts, features/shared/lib/search-param-parsers.ts, tests in __tests__/OrdersTable and __tests__/OrdersTimeline; delete features/shared/hooks/use-filters.ts.
- Q18: no ADR.

Implemented in 599cbc4.

## Follow-ups found in review

- DebouncedInput captures `onFiltersChange` from the render where text changed: typing, then changing another filter within 500 ms, re-applies search to the stale query and drops the newer filter. Pre-existing; fix in DebouncedInput.
- Sorting by Driver / Customer / Truck orders by id, not name (Q5): needs name columns in the orders view.
- Headers toggle asc/desc only (`enableSortingRemoval: false`): sort can't be cleared, by design, since a default sort always applies.
