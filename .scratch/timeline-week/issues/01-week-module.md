# 01 — Week module (`lib/week.ts`), ISO numbering, week URL key

Status: ready-for-agent
Blocked by: none

Decisions: `.scratch/timeline-week/decisions.md` (Q2, Q3, Q7 partly, Q10, Q13, Q14, Q19, Q22–Q25).

## Goal

One deep module owns every Week rule. Callers stop doing date arithmetic on Weeks.

## Scope

- Add `@date-fns/tz` (`pnpm add`).
- Create `lib/week.ts`:
  - `type Week = string & { readonly __brand: 'Week' }` (its Monday, `yyyy-MM-dd`).
  - `weekOf(date: string | Date): Week`
  - `currentWeek(now?: Date): Week`: "today" in `Europe/Warsaw`.
  - `nextWeek(week)`, `prevWeek(week)`
  - `weekNumber(week): number`, `weekYear(week): number` (ISO 8601)
  - `weekDays(week): Day[]` (7 days, Monday first; include whether the day is a weekend)
  - `weeksOfYear(isoYear): Week[]` (52 or 53)
  - `formatWeekKey(week): string` → `'2026-W44'`; `parseWeekKey(s): Week | undefined` (rejects `2027-W53`, `2026-W99`, `2026-10-26`, garbage)
  - Order-day logic (`orderDays`) is **not** in this issue; see 03.
- `features/OrdersTimeline/lib/timeline-query.ts`: `week` is a `Week`. `parse` reads `?week=` through `parseWeekKey`, falling back to `currentWeek`. `toSearchParams` writes `formatWeekKey`. `apply` keeps its no-op rule.
- `use-timeline-query.ts`: drop `getToday()`; let `parse` use `currentWeek`.
- Week navigation: arrows call `change({ week: prevWeek/nextWeek })`; "today" calls `change({ week: currentWeek() })`.
- Week select: items = `weeksOfYear(weekYear(shownWeek))`, label = `weekNumber`, value = the Week itself. The selected value is the shown Week, so it is always in the list.
- `timeline-head`: weekend comes from `weekDays`. Format through `lib/dates.formatDate`, not date-fns directly.
- `timeline-content` uses `weekDays(query.week)`. The DAL call keeps its current shape for now: range = Monday..Sunday of the Week (02 replaces it).
- Delete `features/OrdersTimeline/lib/helpers.ts`, and `getWeekDays`, `getFirstDayOfWeek`, `getLastDayOfWeek` plus the `getWeek` re-export from `lib/dates.ts`. Fix every importer. No aliases.

## Tests (browser project, pure)

`__tests__/week.test.ts`:
- `weekOf` of a Wednesday and of a Sunday return the same Monday.
- ISO numbers across years: 2026-12-28 → 2026-W53; 2027-01-01 → 2026-W53; 2027-01-04 → 2027-W01.
- `nextWeek(2026-W53)` = 2027-W01; `prevWeek(2027-W01)` = 2026-W53.
- `weeksOfYear(2026)` has 53 entries; `weeksOfYear(2027)` has 52.
- `formatWeekKey` / `parseWeekKey` round-trip, including year-boundary Weeks; `parseWeekKey` rejects `2027-W53`, `2026-W99`, `2026-10-26`, `''`.
- `currentWeek` at Monday 00:30 Europe/Warsaw (= Sunday 22:30/23:30 UTC) returns the new Week.

Update `__tests__/OrdersTimeline/timeline-query.test.ts` to the `?week=YYYY-Www` contract (invalid → current Week, round-trip, apply no-op).

## Done when

- `pnpm typecheck`, `pnpm check` and `pnpm exec vitest --run` all pass.
- `grep -rn "getWeek\b\|getFirstDayOfWeek\|getLastDayOfWeek\|getWeekDays" app features lib` returns nothing outside `lib/week.ts`.
- The /timeline URL shows `?week=2026-W44`; the select shows the ISO number and lists all Weeks of that year.
