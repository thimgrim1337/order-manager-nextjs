import { expect, test } from '@playwright/test';
import db from '@/db/db';
import { seedOrder, seedOrderReferences } from '../fixtures/order';
import { cacheEmptySearch, searchCombobox } from './helpers/combobox';
import { cleanupTestData, dayOfThisMonth } from './helpers/seed';

const SEEDED_ORDER = {
  orderNr: 'E2E-001',
  startDate: dayOfThisMonth(12),
  endDate: dayOfThisMonth(13),
};
const { orderNr } = SEEDED_ORDER;
/** Not the seed's Order Number, so a stale cached list fails the seeded tests below. */
const CREATED_ORDER_NR = 'E2E-009';

test.describe('Order test', () => {
  test.beforeEach(async () => {
    await cleanupTestData();
  });

  test.afterAll(async () => {
    await cleanupTestData();
  });

  test('Create new order and display in table', async ({ page }) => {
    await seedOrderReferences(db);
    await page.goto('/orders');

    await page.getByRole('button', { name: 'Dodaj nowe zlecenie' }).click();

    await page.getByLabel('Zleceniodawca').fill('Test');
    await page.getByRole('option', { name: 'Test Firma' }).click();

    await page.getByLabel('Numer zlecenia').fill(CREATED_ORDER_NR);

    await page.getByLabel('Data załadunku').click();
    await expect(page.getByRole('gridcell', { name: '12' })).toBeVisible();
    await page.getByRole('gridcell', { name: '12' }).click();
    await expect(page.getByRole('gridcell', { name: '12' })).not.toBeVisible();

    await page.getByLabel('Data rozładunku').click();
    await expect(page.getByRole('gridcell', { name: '13' })).toBeVisible();
    await page.getByRole('gridcell', { name: '13' }).click();
    await expect(page.getByRole('gridcell', { name: '13' })).not.toBeVisible();

    await page.getByLabel('Miejsca załadunku').fill('Warszawa');
    await page.getByRole('option', { name: 'Warszawa' }).click();

    await page.getByLabel('Miejsca rozładunku').fill('Płock');
    await page.getByRole('option', { name: 'Płock' }).click();

    await page.getByLabel('Cena w walucie').fill('1000');

    await page.getByLabel('Pojazd').fill('WP0997C');
    await page.getByRole('option', { name: 'WP0997C' }).click();

    // submit
    await page.getByRole('button', { name: 'Zapisz' }).click();

    await expect(page.getByRole('heading', { name: 'Dodaj nowe zlecenie' })).not.toBeVisible();

    await expect(page.getByRole('cell', { name: CREATED_ORDER_NR })).toBeVisible();
  });

  test('Create an Order with a Customer and a City created from its form', async ({ page }) => {
    await seedOrderReferences(db);
    await page.goto('/orders');

    await page.getByRole('button', { name: 'Dodaj nowe zlecenie' }).click();

    // A stale cached search would still find nothing after creating.
    await cacheEmptySearch(page, 'Zleceniodawca', 'Nowa');
    await cacheEmptySearch(page, 'Miejsca załadunku', 'Kra');

    await page.getByRole('button', { name: 'Dodaj nowego zleceniodawcę' }).click();
    const customerDialog = page.getByRole('dialog', { name: 'Dodawanie nowego zleceniodawcy' });
    await customerDialog.getByLabel('Nazwa zleceniodawcy').fill('Nowa Firma');
    await customerDialog.getByLabel('NIP').fill('PL9876543210');
    await customerDialog.getByRole('button', { name: 'Zapisz' }).click();
    await expect(customerDialog).not.toBeVisible();
    await expect(page.getByLabel('Zleceniodawca')).toHaveValue('Nowa Firma');
    await searchCombobox(page, 'Zleceniodawca', 'Nowa');
    await page.getByRole('option', { name: 'Nowa Firma' }).click();

    await page.getByRole('button', { name: 'Dodaj nowe miejsce' }).click();
    const cityDialog = page.getByRole('dialog', { name: 'Dodawanie nowego miejsca' });
    await cityDialog.getByLabel('Kod kraju').click();
    await page.getByRole('option', { name: 'PL Polska' }).click();
    await cityDialog.getByLabel('Kod pocztowy').fill('30-001');
    await cityDialog.getByLabel('Nazwa miejscowości').fill('Kraków');
    await cityDialog.getByRole('button', { name: 'Zapisz' }).click();
    await expect(cityDialog).not.toBeVisible();
    // Offered at once, without searching.
    await page.getByLabel('Miejsca rozładunku').click();
    await page.getByRole('option', { name: 'Kraków' }).click();
    await page.getByLabel('Miejsca rozładunku').press('Escape');
    await expect(page.getByText('30-001')).toBeVisible();

    await page.getByLabel('Numer zlecenia').fill('E2E-002');
    await page.getByLabel('Data załadunku').click();
    await page.getByRole('gridcell', { name: '12' }).click();
    await expect(page.getByRole('gridcell', { name: '12' })).not.toBeVisible();
    await page.getByLabel('Data rozładunku').click();
    await page.getByRole('gridcell', { name: '13' }).click();
    await expect(page.getByRole('gridcell', { name: '13' })).not.toBeVisible();

    await searchCombobox(page, 'Miejsca załadunku', 'Kra');
    await page.getByRole('option', { name: 'Kraków' }).click();

    await page.getByLabel('Cena w walucie').fill('1000');
    await page.getByLabel('Pojazd').fill('WP0997C');
    await page.getByRole('option', { name: 'WP0997C' }).click();

    await page.getByRole('button', { name: 'Zapisz' }).click();
    await expect(page.getByRole('heading', { name: 'Dodaj nowe zlecenie' })).not.toBeVisible();

    const row = page.getByRole('row', { name: 'E2E-002' });
    await expect(row.getByRole('cell', { name: 'Nowa Firma' })).toBeVisible();
    // Kraków in both Places: the offered Unloading Place and the searched Loading Place.
    await expect(row.getByRole('cell', { name: 'Kraków' })).toHaveCount(2);
  });

  test.describe('with a seeded Order', () => {
    test.beforeEach(async () => {
      await seedOrder(db, await seedOrderReferences(db), SEEDED_ORDER);
    });

    test('Edit order price and display in table', async ({ page }) => {
      await page.goto('/orders');

      const row = page.getByRole('row', { name: orderNr });
      await row.click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'Edycja' }).click();

      await expect(page.getByRole('heading', { name: `Edycja zlecenia ${orderNr}` })).toBeVisible();

      await page.getByRole('button', { name: 'Edytuj' }).click();
      await page.getByLabel('Cena w walucie').fill('2500');
      await page.getByRole('button', { name: 'Zapisz' }).click();

      await expect(
        page.getByRole('heading', { name: `Edycja zlecenia ${orderNr}` }),
      ).not.toBeVisible();

      await expect(row.getByRole('cell', { name: '2500', exact: true })).toBeVisible();
      await expect(row).toContainText(/2500,00\s*zł/);
    });

    test('Change status order to finished', async ({ page }) => {
      await page.goto('/orders');

      await expect(page.getByRole('cell', { name: 'w trakcie' })).toBeVisible();

      await page.getByRole('row', { name: orderNr }).click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'Status' }).click();

      await expect(page.getByRole('heading', { name: 'Zmiana statusu zlecenia' })).toBeVisible();

      await page.getByRole('button', { name: 'zakończone' }).click();

      await expect(
        page.getByRole('heading', { name: 'Zmiana statusu zlecenia' }),
      ).not.toBeVisible();

      await expect(
        page.getByRole('row', { name: orderNr }).getByRole('cell', { name: 'zakończone' }),
      ).toBeVisible();
    });

    test('Delete order', async ({ page }) => {
      await page.goto('/orders');

      await expect(page.getByRole('cell', { name: orderNr })).toBeVisible();

      await page.getByRole('row', { name: orderNr }).click({ button: 'right' });
      await page.getByRole('menuitem', { name: 'Usuń' }).click();

      await expect(page.getByRole('heading', { name: 'Czy jesteś pewny ? ' })).toBeVisible();

      await page.getByRole('button', { name: 'Usuń' }).click();

      await expect(page.getByRole('heading', { name: 'Czy jesteś pewny ? ' })).not.toBeVisible();
      await expect(
        page.getByRole('listitem').filter({ hasText: 'Zlecenie zostało usunięte.' }),
      ).toBeVisible();
      await expect(page.getByRole('cell', { name: orderNr })).not.toBeVisible();
    });
  });
});
