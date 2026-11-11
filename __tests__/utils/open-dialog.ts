import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect, vi } from 'vitest';

/**
 * Opens a dialog by its trigger and waits for it to take focus: typed text sent earlier can land
 * outside it, where it is lost, once focus moves in mid-typing.
 */
export async function openDialog(user: UserEvent, triggerName: string, dialogName: string) {
  await user.click(screen.getByRole('button', { name: triggerName }));
  const dialog = await screen.findByRole('dialog', { name: dialogName });
  await vi.waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  return dialog;
}
