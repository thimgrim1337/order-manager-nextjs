# 01 — Context-menu dialog reopens when closed during a save

Status: ready-for-agent

## Problem

`features/OrdersTable/components/OrdersContextMenu/context-menu.tsx` passes `useToggle`'s `toggle` as `onOpenChange` to the Status, Edit and Remove dialogs. Each dialog also calls `onOpenChange()` itself once its action finishes (`order-status.tsx`, `context-menu-remove.tsx`, the edit form's `onDialogClose`).

So closing the dialog (Escape, overlay click) while a save is in flight toggles it shut, and the action finishing toggles it open again. Found while fixing the e2e spec: pressing Escape right after picking a status left "Zmiana statusu zlecenia" open.

## Scope

- Dialogs get an `onOpenChange(open: boolean)` that sets the state (`setValue(open)`), as `features/shared/components/ui/dialog.tsx` already types it.
- After the action finishes, the option components close the dialog explicitly (set `false`), never toggle.

## Done when

- Opening Status, pressing Escape before the save finishes, and waiting leaves the dialog closed.
- `pnpm test:e2e` stays green.
