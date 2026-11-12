import { expect, type Page } from '@playwright/test';

/**
 * Opens a dialog by its trigger and waits for it to take focus.
 *
 * Right after `goto` the trigger is server-rendered but not yet hydrated, and a click then opens
 * nothing, so this clicks again until the dialog shows. The dialog moves focus to its first field
 * a moment after it shows: a field filled before that loses focus mid-typing, and the rest of its
 * text lands in the first field.
 */
export async function openDialog(page: Page, triggerName: string, dialogName: string) {
  const dialog = page.getByRole('dialog', { name: dialogName });
  await expect(async () => {
    if (!(await dialog.isVisible())) {
      // Bounded, so a click the opening dialog's overlay blocks retries instead of hanging.
      await page.getByRole('button', { name: triggerName }).click({ timeout: 1000 });
    }
    await expect(dialog).toBeVisible({ timeout: 1000 });
  }).toPass();
  await expect
    .poll(() => dialog.evaluate((element) => element.contains(document.activeElement)))
    .toBe(true);
  return dialog;
}
