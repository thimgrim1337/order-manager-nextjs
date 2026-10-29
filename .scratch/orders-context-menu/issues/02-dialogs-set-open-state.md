# 02 — Every dialog sets its open state instead of toggling it

Status: needs-triage

From the code review of 01 (dialog reopens on Escape).

## Problem

01 fixed the context-menu dialogs, but other dialogs still pass `useToggle`'s `toggle` as `onOpenChange`:

- `features/OrderForm/components/create-order.tsx`
- `features/OrderForm/components/CityForm/create-city.tsx`
- `features/OrderForm/components/CustomerForm/create-customer.tsx`
- `features/OrdersTimeline/components/timeline-order.tsx`

They don't reopen today, because their forms close via `setFalse`. But a dialog's `onOpenChange(open)` that ignores `open` is the pattern that caused 01: any later caller that toggles after an action brings the bug back.

Separately, `features/OrdersTable/components/OrdersContextMenu/context-menu.tsx` keeps three `useToggle()` states (Edit, Status, Remove) where only one dialog can be open at a time. A single `openDialog: 'edit' | 'status' | 'remove' | null` state would say that directly.

## Scope

- The dialogs above pass a setter (`setValue`, or `(open) => …`) as `onOpenChange`, never `toggle`.
- Decide whether `context-menu.tsx` moves to one "which dialog is open" state.

## Done when

- No dialog passes `toggle` as `onOpenChange`.
- `pnpm test:e2e` stays green.
