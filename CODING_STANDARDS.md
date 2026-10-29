# Coding Standards

Read during review. Biome and `tsc` enforce formatting and types; these are the conventions they can't check.

## Domain language

- Names follow `GLOSSARY.md` (Order, Week, Week Number, Timeline…). A new domain term gets a GLOSSARY entry in the same change.

## URL search params

- Each page owns a query module (`features/<Feature>/lib/*-query.ts`) with `parse`, `apply` and `toSearchParams`.
- `parse` reads every param through `features/shared/lib/search-param-parsers.ts`: one `parseX(value: RawSearchParam)` per kind of value, returning `undefined` when the value is missing or invalid. A new kind of param gets a new parser there.

## Dates and Weeks

- Week rules (which Week, its days, numbering, the URL key) live in `lib/week.ts`. Callers pass a `Week` around and leave the date arithmetic to that module.
- Dates are `yyyy-MM-dd` strings. Any string handed to date-fns goes through `toDate`/`parseDate` from `lib/dates.ts` first: date-fns reads a bare `yyyy-MM-dd` string as UTC midnight, which is the previous day west of UTC.
- "Today" is the company's day in `Europe/Warsaw` (Biome enforces reading it through `lib/dates.ts`). Browser tests run in `America/Los_Angeles`: code that depends on today gets a test across a Warsaw-midnight boundary, passing `now` explicitly.

## Accessibility

- Icon-only controls get an English `aria-label` (e.g. `Next week`). E2E tests find elements by role and accessible name.

## Placement

- Constants shared across files live in `lib/consts.ts`; module-private constants stay in their module.
