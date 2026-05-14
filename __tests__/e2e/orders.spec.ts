import { expect, test } from "@playwright/test";
import { cleanupTestData, seedTestData } from "./helpers/seed";

test.describe("Order test", () => {
	test.beforeAll(async () => {
		await cleanupTestData();
		const data = await seedTestData();
		console.log("SEED DATA:", JSON.stringify(data));
	});

	test.afterAll(async () => {
		await cleanupTestData();
	});

	test("Create new order and display in table", async ({ page }) => {
		await page.goto("/orders");

		await page.getByRole("button", { name: "Dodaj nowe zlecenie " }).click();

		await page.getByLabel("Zleceniodawca").fill("Test");
		await page.getByRole("option", { name: "Test Firma" }).click();

		await page.getByLabel("Numer zlecenia").fill("E2E-001");

		await page.getByLabel("Data załadunku").click();
		await expect(page.getByRole("gridcell", { name: "12" })).toBeVisible();
		await page.getByRole("gridcell", { name: "12" }).click();
		await page.keyboard.press("Escape");
		await expect(page.getByRole("gridcell", { name: "12" })).not.toBeVisible();

		await page.getByLabel("Data rozładunku").click();
		await expect(page.getByRole("gridcell", { name: "13" })).toBeVisible();
		await page.getByRole("gridcell", { name: "13" }).click();
		await page.keyboard.press("Escape");
		await expect(page.getByRole("gridcell", { name: "13" })).not.toBeVisible();

		await page.getByLabel("Miejsca załadunku").fill("Warszawa");
		await page.getByRole("option", { name: "Warszawa" }).click();

		await page.getByLabel("Miejsca rozładunku").fill("Płock");
		await page.getByRole("option", { name: "Płock" }).click();

		await page.getByLabel("Cena w walucie").fill("1000");

		await page.getByLabel("Pojazd").fill("WP0997C");
		await page.getByRole("option", { name: "WP0997C" }).click();

		// submit
		await page.getByRole("button", { name: "Dodaj" }).click();
		await page.keyboard.press("Escape");

		await expect(
			page.getByRole("heading", { name: "Dodaj nowe zlecenie" }),
		).not.toBeVisible();

		await expect(page.getByRole("cell", { name: "E2E-001" })).toBeVisible();
	});

	test("Change status order to finished", async ({ page }) => {
		await page.goto("/orders");

		await expect(page.getByRole("cell", { name: "w trakcie" })).toBeVisible();

		await page.getByRole("menu", { name: "order actions" }).click();
		await page.getByRole("button", { name: "order status" }).click();

		await expect(
			page.getByRole("heading", { name: "Zmiana statusu zlecenia" }),
		).toBeVisible();

		await page.getByRole("button", { name: "status-delivered" }).click();
		await page.keyboard.press("Escape");

		await expect(
			page.getByRole("heading", { name: "Zmiana statusu zlecenia" }),
		).not.toBeVisible();

		await expect(page.getByText("zakończone")).toBeVisible();
	});

	test("Delete order", async ({ page }) => {
		await page.goto("/orders");

		await expect(page.getByRole("cell", { name: "E2E-001" })).toBeVisible();

		await page.getByRole("menu", { name: "order actions" }).click();
		await page.getByRole("button", { name: "order remove" }).click();

		await expect(
			page.getByRole("heading", { name: "Czy jesteś pewny ? " }),
		).toBeVisible();

		await page.getByRole("button", { name: "Usuń" }).click();
		await page.keyboard.press("Escape");

		await expect(page.getByRole("cell", { name: "E2E-001" })).not.toBeVisible();
	});
});
