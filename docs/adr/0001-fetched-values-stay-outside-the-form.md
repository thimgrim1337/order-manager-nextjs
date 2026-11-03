# Values fetched for a form stay outside its TanStack Form state

The Order form's Exchange Rate is fetched (or kept from the stored Order) by `useExchangeRate`, a hook the form reads during render; it never enters the form's state. Its error reaches the Currency field through `SelectField`'s `error` prop (`FormControlProps` in `features/OrderForm/components/FormFields/form-base.tsx`), it blocks saving through `FormControls`' `isBlocked`, and `onSubmit` sends the hook's `currencyInfo` in place of the form's. We chose this because TanStack Form takes a value from React state only by copying it in, and the `useEffect`s doing that (plus a validator reading the fetch's outcome from the render's closure) caused both bugs of #14.

## Considered Options

- **Copy the hook's values into the form** (`setFieldValue` / `validateField` in a `useEffect`): what #14 shipped; the effect had to guess when the fetch's outcome changed.
- **Fetch inside the `currencyId` validator** (`onChangeAsync` with `onChangeListenTo: ['endDate']`, `queryClient.fetchQuery`): reads only form state, but the validator writes `currencyInfo` as a side effect.
- **`transform` / `mergeForm`**: built for merging a Server Action's state into the form; it merges values without re-running validation.

## Consequences

- The form's own `currencyInfo` value keeps the stored one and goes stale once the Unloading Date or Currency changes: deliberate, since only the submitted payload carries the hook's.
- `form.validateField(name)` marks the field touched, so an error it produces shows at once; `FormBase`'s `error` shows at once too, keeping that behaviour.
- `useAppForm`'s options, `onSubmit` included, are refreshed on every render (`formApi.update` in a layout effect), so `onSubmit` sees the current render's hook values.
