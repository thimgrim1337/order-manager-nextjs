# 03 — Order days on the Timeline, server-owned days, e2e smoke

Status: ready-for-agent
Blocked by: 01, 02

Decisions: `.scratch/timeline-week/decisions.md` (Q7, Q11, Q12, Q20).

## Goal

Timeline cells render roles computed by the Week module, and the client stops re-deriving the Week.

## Scope

- `lib/week.ts`: `orderDays(week, order: { startDate; endDate }) → OrderDay[7]`:
  - role ∈ `none | loading | unloading | loading-unloading | transit`;
  - edge flags: `continuesBefore` on Monday when `startDate < Monday`, and `continuesAfter` on Sunday when `endDate > Sunday`. Flags only exist when the Order crosses that edge. They are rendered only on `transit` cells: if Monday is `unloading` (or Sunday is `loading`), that city wins and no marker is shown.
- `timeline-place.tsx` receives its `OrderDay` and renders by role:
  - `loading`: loading city (+ flag) and Customer name, as today;
  - `unloading`: unloading city (+ flag);
  - `loading-unloading`: "A → B" in one cell (loading city → unloading city) and Customer name;
  - `transit`: border only. With `continuesBefore`: "← <loading city>". With `continuesAfter`: "<unloading city> →";
  - `none`: empty cell.
  - No date comparisons remain in the component.
- Server-owned days: `timeline-content` computes `weekDays(query.week)` once and passes the days / Week down. `timeline-order.tsx` no longer calls `useTimelineQuery` or computes days. `useTimelineQuery` is used only by the week select, week navigation and driver select.
- One Order = one row (unchanged).

## Tests

- Browser project, `__tests__/week.test.ts`: `orderDays` for each role, same-day loading+unloading, an Order starting before Monday, ending after Sunday, and spanning the whole Week (all `transit`, both flags).
- Playwright (`e2e/timeline.spec.ts`): seed an Order Fri 2026-10-30 → Mon 2026-11-02.
  - On `/timeline?week=2026-W44` it is visible, and Friday shows the loading city.
  - Pressing "→" shows 2026-W45: the select shows 45, the Order is visible, and Monday shows the unloading city with no edge marker. Sunday of W44 shows "<unloading city> →".

## Done when

- `pnpm typecheck` and `pnpm check` pass; `pnpm exec vitest --run` and `pnpm test:e2e` are green.
- `features/OrdersTimeline/components/timeline-order.tsx` imports nothing from `lib/dates` or `use-timeline-query`.
