# Coding Standards

Read during review. Biome and `tsc` enforce formatting and types; these are the conventions they can't check.

## Domain language

- Names follow `GLOSSARY.md` (Order, Week, Week Number, Timeline…). A new domain term gets a GLOSSARY entry in the same change.

## URL search params

- Each page owns a query module (`features/<Feature>/lib/*-query.ts`) with `parse`, `apply` and `toSearchParams`.
- Components read and change the URL query through `useUrlQuery(<page>Query)` (`features/shared/hooks/use-url-query.ts`), passing the page's query module directly; a page gets no hook of its own wrapping it. A change relative to the current query (the Week after it) passes a function: `change(({ week }) => ({ week: nextWeek(week) }))`.
- `parse` reads every param through `features/shared/lib/search-param-parsers.ts` (Biome enforces that a query module imports no `zod`): one `parseX(value: RawSearchParam)` per kind of value, returning `undefined` when the value is missing or invalid. A new kind of param gets a new parser there.
- A parser's bounds belong to its kind and live in it (`parsePageSize`, not `parseInteger({ min, max })`). It takes a second argument only for the values a page defines, like the sort fields `parseSort(value, ORDER_SORT_FIELDS)` accepts.

## Dates and Weeks

- Week rules (which Week, its days, numbering, the URL key) live in `lib/week.ts`. Callers pass a `Week` around and leave the date arithmetic to that module.
- Dates are `yyyy-MM-dd` strings. Any string handed to date-fns goes through `toDate`/`parseDate` from `lib/dates.ts` first: date-fns reads a bare `yyyy-MM-dd` string as UTC midnight, which is the previous day west of UTC.
- "Today" is the company's day in `Europe/Warsaw` (Biome enforces reading it through `lib/dates.ts`). Browser tests run in `America/Los_Angeles`: code that depends on today gets a test across a Warsaw-midnight boundary, passing `now` explicitly.
- A test whose expected values pass through a default derived from today (the Timeline's default Week, the Order form's dates) pins the clock with `vi.setSystemTime`, as `__tests__/OrderForm/order-form.test.tsx` does.

## Tests

- A regression test goes red on the bug it guards: with the fix reverted it fails on its assertion, not only on a missing module.
- A test covering existing code goes red when that code breaks: each condition it covers fails a test once mutated (`>=` to `>`, a filter dropped, `and` to `or`). A range filter gets an Order on each edge and one just past it.
- Tests build a Week from its key with `week('2026-W44')` (`__tests__/utils/week.ts`).

## Data access

- A query worth testing is a `find*(database: db | dbTransaction, …)` function in `lib/dal/`. A thin `get*` adapter adds `'use cache'` + `cacheLife` + `cacheTag` and calls it, holding no other logic (Biome enforces it holds no query): `cacheTag()` throws outside the Next runtime, so the cached function itself can't be tested. Example: `findOrdersInWeek` / `getOrdersInWeek` in `lib/dal/order.dal.ts`. `findOrders` / `getAllOrders` follow it too. A `find*` with nothing to test (a plain select with no filter or order, like `findCurrencies`) stays module-private until a test imports it.
- A `find*` selects named columns, and its row type sits beside it in `lib/dal/` (e.g. `OrderReadModel`): every screen showing that row imports this one type. Derive it as `Awaited<ReturnType<typeof find…>>[number]`, since Drizzle exports no public type for a partial select.
- One DAL file per entity: `lib/dal/<entity>.dal.ts` (`city.dal.ts`, `customer.dal.ts`), importing no other DAL (Biome enforces it). An issue's "module" grouping several entities is code in the feature that uses it, calling each entity's `get*`: `features/<Feature>/lib/`, or `features/shared/lib/` when several features share it (e.g. `order-choices.ts`).
- Writes go through a server-only service in `lib/services/<entity>.services.ts`, e.g. the Orders module `orders.services.ts`: it takes `db | dbTransaction`, owns validation, the transaction and cache invalidation (Biome enforces where Orders with their Places and a Truck's Driver, Customers and Cities are written, and where `updateTag` is called), and returns a `Result` of domain outcomes. A Server Action only passes `db` and maps the outcome through `toActionResponse` (`lib/action-response.ts`), which holds the failures' Polish messages. A Server Action's arguments are untrusted: the service parses every one it receives, ids included, and a malformed one returns `InvalidData`.
- A write returns an expected constraint violation (a taken name, an unknown id) as a domain outcome and lets anything else throw.
- A query ordering by a name orders through `inPolishOrder` (`lib/polish-order.ts`): the db images' default collation sorts by bytes, putting "Łódź" after "Zabrze". The orders view's name columns already carry that collation, so `findOrders` orders them as they are.
- Query tests are `*.db.test.ts`, seed their own rows and run inside `withRollback` (`__tests__/db/with-rollback.ts`), passing its transaction to the `find*` function.
- A test of a write's cache invalidation first reads the cached query the write should change, with the same arguments, so it goes red without the invalidation. In e2e, `cacheEmptySearch` (`__tests__/e2e/helpers/combobox.ts`) does this for a combobox search.

## Forms

- A value a form fetches (like the Order form's Exchange Rate) stays outside its TanStack Form state, with no `useEffect` copying it in: its error goes through a field's `error` prop and `FormControls`' `isBlocked`, and `onSubmit` adds the value. See `docs/adr/0001-fetched-values-stay-outside-the-form.md`.

## Accessibility

An element's accessible name is whatever a screen reader announces for it: its text, an `aria-label`, an `aria-labelledby` target, or `sr-only` text. The rules cover every name the app renders, `components/ui/` (shadcn) included.

- A control with visible label text takes its name from that text (WCAG 2.5.3 Label in Name): its own content, or the visible label beside it through `aria-labelledby`, and no `aria-label`. A displayed value is not a label: a select trigger showing the chosen Week still gets one.
- Every other name (an icon-only control, a `role="img"` mark, `sr-only` text) is Polish like the rest of the UI (e.g. `Następny tydzień`); the page is `<html lang="pl">`. A code that reads the same in any language, like a flag's country code, stays as it is.
- Tests find elements by role and their Polish accessible name.
- `__tests__/e2e/a11y.spec.ts` runs axe (WCAG 2.1 A/AA plus Label in Name) on each page; a new page or dialog gets a scan there axe counts a control's visible description as part of its label, so a control named by `aria-labelledby` and described by `aria-describedby` (the Status menu buttons) is passed as `describedControls`, which skips Label in Name for it alone.

## Types

- Use the library's named type (`NodePgTransaction`, `InferSelectModel`…). Derive a type with `Parameters`/`ReturnType` only when the library doesn't export one.

## Placement

- Constants shared across files live in `lib/consts.ts`; module-private constants stay in their module.
- A domain rule several views share lives in `lib/<concept>.ts` (`exchange-rate.ts`, `places.ts`), tested in `__tests__/<concept>.test.ts`.
