import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import db from '@/db/db';
import { seedOrder, seedOrderReferences } from '../fixtures/order';
import { openDialog } from './helpers/open-dialog';
import { cleanupTestData } from './helpers/seed';

/**
 * WCAG 2.1 A/AA, plus Label in Name (2.5.3), which axe leaves off by default.
 * `color-contrast` is off until #40 darkens the in-progress badge and the weekend headers.
 *
 * `describedControls` matches controls named by their label alone that also show a description
 * (`aria-describedby`). axe's Label in Name check takes all of a control's visible text as its
 * label, description included, so it skips that check for them; every other rule still runs.
 */
async function violations(page: Page, { describedControls }: { describedControls?: string } = {}) {
  const scan = ({ labelInName = true } = {}) =>
    new AxeBuilder({ page }).options({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: {
        'label-content-name-mismatch': { enabled: labelInName },
        'color-contrast': { enabled: false },
      },
    });
  const results = describedControls
    ? [
        await scan().exclude(describedControls).analyze(),
        await scan({ labelInName: false }).include(describedControls).analyze(),
      ]
    : [await scan().analyze()];
  return results.flatMap(({ violations }) =>
    violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map((n) => `${n.html} — ${n.failureSummary?.split('\n')[1]?.trim()}`),
    })),
  );
}

test.describe('Accessibility', () => {
  test.beforeEach(async () => {
    await cleanupTestData();
    const refs = await seedOrderReferences(db);
    // Crosses into the next Week, so the Timeline shows a continuing mark.
    await seedOrder(db, refs, {
      orderNr: 'E2E-A11Y-001',
      startDate: '2026-10-30',
      endDate: '2026-11-02',
    });
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('the Orders page, its filters and its create-Order dialog', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByRole('button', { name: 'Dodaj nowe zlecenie' })).toBeVisible();
    expect(await violations(page)).toEqual([]);

    await openDialog(page, 'Dodaj nowe zlecenie', 'Dodaj nowe zlecenie');
    expect(await violations(page)).toEqual([]);

    // The dialog opened, so the page has hydrated and the click unfolds the filters.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('button', { name: 'Filtrowanie' }).click();
    await expect(page.getByLabel('Kierowca')).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('the Status dialog', async ({ page }) => {
    await page.goto('/orders');
    await page.getByRole('row', { name: /E2E-A11Y-001/ }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Status' }).click();
    await expect(page.getByRole('button', { name: 'zakończone' })).toHaveAccessibleDescription(
      'Zlecenie zostało zakończone.',
    );
    expect(
      await violations(page, { describedControls: 'button[aria-labelledby][aria-describedby]' }),
    ).toEqual([]);
  });

  test('the Timeline page', async ({ page }) => {
    await page.goto('/timeline?week=2026-W44');
    await expect(page.getByRole('row', { name: /WP0997C/ })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('the edit-Order dialog, with its Loading and Unloading Places picked', async ({ page }) => {
    await page.goto('/timeline?week=2026-W44');
    await page.getByRole('row', { name: /WP0997C/ }).click();
    await expect(page.getByRole('heading', { name: 'Edycja zlecenia E2E-A11Y-001' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Usuń Warszawa' })).toBeAttached();
    await expect(page.getByRole('button', { name: 'Usuń Płock' })).toBeAttached();
    expect(await violations(page)).toEqual([]);
  });
});
