# 02 — Order form defaults read "today" when the form opens

Status: ready-for-agent

From the company-today retro (2026-10-29).

## Problem

`orderFormOptions.defaultValues` (`features/OrderForm/lib/order-form-options.ts`) calls `getToday()` and `getTomorrow()` once, when the module loads. A long-running server process, or a browser tab left open past midnight in Warsaw, keeps offering yesterday as the default Start Date and End Date.

`CreateOrderForm` (`features/OrderForm/components/create-order-form.tsx`) spreads `orderFormOptions`, so it gets the stale dates. `EditOrderForm` overrides `defaultValues` with the Order's own dates, so it is unaffected.

## Scope

- Default Start Date and End Date are read each time the create form opens: today and tomorrow in `Europe/Warsaw`, via `getToday` / `getTomorrow` from `@/lib/dates`.
- `orderFormOptions` keeps the validators and the rest of the defaults; only the date defaults move to open time.

## Tests

- Browser project (runs in `America/Los_Angeles`): with the clock set to an instant that is already the next day in Warsaw but still the previous day in UTC/LA (the pair used in `__tests__/dates.test.ts`), the create form's defaults are that Warsaw day and the day after. Advancing the clock past the next Warsaw midnight and opening the form again gives the new day.

## Done when

- No module-level read of "today" remains in `features/OrderForm`.
- `pnpm typecheck` and `pnpm check` pass; `pnpm exec vitest --run` is green.
