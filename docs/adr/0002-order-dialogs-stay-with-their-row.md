# Each Order's dialogs stay with its row, not in one set per page

Every Orders Table row mounts its own edit, Status and Remove dialogs (through the Orders Table's context menu), and every Timeline row its own edit dialog. We considered one page-level set of Order dialogs that rows ask to open with an Order, and kept them per row: a running write's state (`useSettleWrite`, the Status being sent) belongs to its Order, so it survives its dialog closing and reopening mid-write without blocking or marking another Order's dialog. A page-level set would have to keep that state per Order anyway, moving the complexity rather than concentrating it. A closed dialog renders nothing, so per-row dialogs cost next to nothing, and the context menu already holds the one rule they share (a late close must not close a dialog opened since).

## Consequences

- To offer Status and Remove on the Timeline, wrap its row in the same context menu module rather than building a page-level one.
