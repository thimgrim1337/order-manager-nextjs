import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { cleanupTestData, seedOrder, seedTestData } from './helpers/seed';

/**
 * WCAG 2.1 A/AA, plus Label in Name (2.5.3), which axe leaves off by default.
 * `color-contrast` is off until #40 darkens the in-progress badge and the weekend headers.
 */
async function violations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .options({
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      rules: {
        'label-content-name-mismatch': { enabled: true },
        'color-contrast': { enabled: false },
      },
    })
    .analyze();
  return violations.map(({ id, nodes }) => ({
    id,
    nodes: nodes.map((n) => `${n.html} — ${n.failureSummary?.split('\n')[1]?.trim()}`),
  }));
}

test.describe('Accessibility', () => {
  test.beforeEach(async () => {
    await cleanupTestData();
    const data = await seedTestData();
    // Crosses into the next Week, so the Timeline shows a continuing mark.
    await seedOrder(data, {
      orderNr: 'E2E-A11Y-001',
      startDate: '2026-10-30',
      endDate: '2026-11-02',
    });
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('the Orders page and its create-Order dialog', async ({ page }) => {
    await page.goto('/orders');
    await expect(page.getByRole('button', { name: 'Dodaj nowe zlecenie' })).toBeVisible();
    expect(await violations(page)).toEqual([]);

    await page.getByRole('button', { name: 'Dodaj nowe zlecenie' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test('the Timeline page', async ({ page }) => {
    await page.goto('/timeline?week=2026-W44');
    await expect(page.getByRole('row', { name: /WP0997C/ })).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
});
