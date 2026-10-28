import { expect, test } from '@playwright/test';
import { cleanupTestData, seedOrder, seedTestData } from './helpers/seed';

// Cell 0 holds the Truck and Driver; cells 1–7 are Monday to Sunday.
const MONDAY = 1;
const FRIDAY = 5;
const SUNDAY = 7;

test.describe('Timeline', () => {
  test.beforeAll(async () => {
    await cleanupTestData();
    const data = await seedTestData();
    await seedOrder(data, {
      orderNr: 'E2E-TL-001',
      startDate: '2026-10-30',
      endDate: '2026-11-02',
    });
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('shows a Fri→Mon Order in both Weeks it crosses', async ({ page }) => {
    await page.goto('/timeline?week=2026-W44');

    const row = page.getByRole('row', { name: /WP0997C/ });
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(FRIDAY)).toContainText('Warszawa');
    await expect(row.getByRole('cell').nth(SUNDAY)).toHaveText('Płock →');

    await page.getByRole('button', { name: 'Next week' }).click();

    await expect(page).toHaveURL(/week=2026-W45/);
    await expect(page.getByRole('combobox', { name: 'Week' })).toContainText('45');
    await expect(row).toBeVisible();
    await expect(row.getByRole('cell').nth(MONDAY)).toHaveText('Płock');
  });
});
