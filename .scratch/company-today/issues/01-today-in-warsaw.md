# 01 — "Today" in `Europe/Warsaw` across the app

Status: ready-for-agent

From the timeline-week branch review (2026-10-28).

## Problem

`CODING_STANDARDS.md` says "today" is the company's day in `Europe/Warsaw`. `currentWeek` in `lib/week.ts` follows that rule, but the older helpers in `lib/dates.ts` still use the machine's time zone:

- `getToday` (`formatDate(Date.now())`) and `getTomorrow` set the Order form's default Start Date and End Date (`features/OrderForm/lib/order-form-options.ts`) and the fallback currency-rate date (`features/OrderForm/hooks/useCurrencyInfo.ts`).
- `isFuture` compares with the machine's "now". `getValidCurrencyDate` (`features/OrderForm/lib/utils.ts`) uses it to choose the NBP rate date.
- The date pickers open on `new Date(Date.now())` (`features/OrderForm/components/FormFields/date-field.tsx`, `features/OrdersTable/components/OrdersFilter/date-input.tsx`).

Around midnight, a browser or server outside Warsaw gets a different day from the company. The Order form then defaults to the wrong dates and can pick the wrong currency-rate date.

## Scope

- One source of "today" in Warsaw: `getToday(now?)` via `@date-fns/tz`, the way `currentWeek` does it. `currentWeek` builds on it, so there is one zone constant.
- `getTomorrow` and `isFuture` work from that "today".
- The date pickers open on the month of that "today".

## Tests

- Browser project (runs in `America/Los_Angeles`): `getToday` at a moment that is already the next day in Warsaw but still the previous day in UTC/LA (the same pair of instants as the `currentWeek` tests), and `isFuture` on that boundary.

## Done when

- No `Date.now()` / `new Date()` reads "today" outside the Warsaw helper.
- `pnpm typecheck` and `pnpm check` pass; `pnpm exec vitest --run` is green.
