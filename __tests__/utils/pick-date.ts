import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

/**
 * Opens the date field labelled `label` and picks `day` of the shown month.
 *
 * Clicks the day's button: a click on its gridcell selects nothing in browser tests.
 */
export async function pickDate(user: UserEvent, label: string, day: number) {
  await user.click(screen.getByLabelText(label));
  await user.click(within(screen.getByRole('gridcell', { name: String(day) })).getByRole('button'));

  expect(screen.getByLabelText(label)).toHaveTextContent(`-${String(day).padStart(2, '0')}`);
}
