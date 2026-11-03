import { expect, type Page } from '@playwright/test';

/**
 * Types `query` into a combobox and waits for the server to answer its debounced search.
 * Matches the search Server Action's request by its serialised `[query]` argument.
 */
export async function searchCombobox(page: Page, label: string, query: string) {
  const answered = page.waitForResponse(
    (res) =>
      res.request().headers()['next-action'] !== undefined &&
      res.request().postData() === JSON.stringify([query]),
  );
  await page.getByLabel(label).fill(query);
  await answered;
}

/** Searches a combobox for `query`, so the server caches it finding nothing, then closes it. */
export async function cacheEmptySearch(page: Page, label: string, query: string) {
  await searchCombobox(page, label, query);
  await expect(page.getByText('Nic nie znaleziono.')).toBeVisible();
  const combobox = page.getByLabel(label);
  await combobox.fill('');
  await combobox.press('Escape');
}
