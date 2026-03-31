import { expect, test } from "@playwright/test";
import { cleanupTestData, seedTestData } from "./helpers/seed";

test.describe("Order create", () => {
	test.beforeEach(async () => {
		await seedTestData();
	});

	test.afterEach(async () => {
		await cleanupTestData();
	});

	test("Create new order and display in table", async ({ page }) => {
		await page.goto("/orders");

		await page.getByRole("button", { name: "Dodaj nowe zlecenie " }).click();

		await page.getByLabel("Zleceniodawca").click();
		await page.getByRole("option", { name: "Test Firma" }).click();

		await page.getByLabel("Numer zlecenia").fill("E2E-001");

		await page.getByLabel("Data załadunku").click();
		await page.getByRole("gridcell", { name: "12" }).click();

		await page.getByLabel("Data rozładunku").click();
		await page.getByRole("gridcell", { name: "13" }).click();

		await page.getByLabel("Miejsca załadunku").click();
		await page.getByRole("option", { name: "Warszawa" }).click();

		await page.getByLabel("Miejsca rozładunku").click();
		await page.getByRole("option", { name: "Warszawa" }).click();

		await page.getByLabel("Cena w walucie").fill("1000");

		await page.getByLabel("Pojazd").click();
		await page.getByRole("option", { name: "WP0997C" }).click();

		// submit
		await page.getByRole("button", { name: "Dodaj" }).click();

		await expect(page.getByText("E2E-001")).toBeVisible();
	});
});
