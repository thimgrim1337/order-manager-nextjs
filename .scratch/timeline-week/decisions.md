# Decisions: Deepen the Week (grilling session 2026-10-28)

Source: architecture review candidate #1 ("Deepen the Week: one module owns which Orders are in this Week").

Problem: the Timeline borrows `getAllOrders` (Orders Table shape) with a "contained in range" date filter, so an Order crossing a Week edge (e.g. Fri→Mon) appears in neither Week. Each Week is silently capped at 100 Orders with no ORDER BY. Week numbers come from date-fns `getWeek` (Sunday start, US numbering), which disagrees with the calendar's ISO numbers on Sundays and in years like 2027. Week math is spread across `lib/dates.ts`, `features/OrdersTimeline/lib/helpers.ts`, week select/navigation, `timeline-place`, and `timeline-order` (which re-parses the URL per row with the browser's today). No tests.

Decisions:
- Q1: Order in a Week = overlap: `startDate <= Sunday AND endDate >= Monday`. Crossing Orders show in both Weeks. (GLOSSARY: "Order in a Week".)
- Q2: Week numbering is ISO 8601 (`getISOWeek` / `getISOWeekYear`). (GLOSSARY: "Week Number".)
- Q3: `Week` is a branded string holding its Monday (`yyyy-MM-dd`), with free functions in `lib/week.ts`. Serializable across RSC props.
- Q4: Timeline shows all Orders in the Week: no cap, no paging.
- Q5: dedicated query for Orders in a Week; `getAllOrders` stays for the Orders Table only.
- Q6: Timeline rows sorted by Start Date, then `id`.
- Q7: server computes the Week and its days once and passes them as props; `useTimelineQuery` only where Week/Driver is changed.
- Q8: tests: pure Week tests in the browser project; Orders-in-Week query against Postgres in a new node vitest project; one e2e smoke.
- Q9: seam: `findOrdersInWeek(db, week, { driverId })` takes `db` (or a transaction); a thin Next adapter `getOrdersInWeek(week, opts)` adds `'use cache'` + `cacheTag('orders')`. Reason: `cacheTag()` throws outside the Next runtime.
- Q10: Week select lists every Week (1–52/53) of the shown Week's ISO year; item value = the Week (not its number). Crossing a year with the arrows switches the list.
- Q11: `orderDays(week, order)` returns 7 roles: `none | loading | unloading | loading-unloading | transit`. Loading and unloading on the same day renders "A → B" in one cell. Each Order is one row.
- Q12: edge markers: when an Order starts before Monday, Monday's cell shows "← <loading city>"; when it ends after Sunday, Sunday's cell shows "<unloading city> →".
- Q13: "today" is computed explicitly in `Europe/Warsaw` via `@date-fns/tz` (supersedes orders-query Q16).
- Q14: module lives at `lib/week.ts`. Delete week functions from `lib/dates.ts` (`getWeekDays`, `getFirstDayOfWeek`, `getLastDayOfWeek`, `getWeek` re-export) and delete `features/OrdersTimeline/lib/helpers.ts`. No aliases. `timeline-head` takes weekend info from Week instead of hard-coded indices 5/6 and stops importing `formatDate` from date-fns.
- Q15: border colours cycle `index % 5`.
- Q16 → replaced by Q22.
- Q17: vitest `test.projects`: `browser` (existing) + `db` (`environment: 'node'`, `__tests__/**/*.db.test.ts`, db-test container). Each test runs inside a transaction that is rolled back. `pnpm exec vitest --run` runs both.
- Q18: query cases (see issue 02).
- Q19: Week cases (see issue 01).
- Q20: one Playwright smoke (see issue 03).
- Q21: three vertical slices in `issues/`, each shippable on its own.
- Q22: URL uses ISO week notation: `?week=2026-W44` (ISO week-year + number). Supersedes orders-query Q14 (`?week=<monday>`).
- Q23: the year+number form is only serialization in `timeline-query`; inside the code `Week` stays a Monday. `lib/week.ts` exposes `formatWeekKey(week) → '2026-W44'` and `parseWeekKey(s) → Week | undefined`.
- Q24: GLOSSARY: Week is "identified by its year and Week Number (e.g. 2026-W44)".
- Q25: invalid `week` (old date links, `2027-W53`, `2026-W99`, garbage) → current Week. No backward-compatibility path.
- No ADR.
