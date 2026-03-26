import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { worker } from "./__tests__/mocks/browser";

// vi.mock('@/db/db', () => ({
//   db: {} as unknown,
// }));

vi.mock("@/lib/actions", () => ({
	createOrder: vi.fn(),
	updateOrder: vi.fn(),
	deleteOrder: vi.fn(),
	createCity: vi.fn(),
	createCustomer: vi.fn(),
	// dodaj pozostałe akcje których używasz
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
	unstable_cache: vi.fn(),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
	usePathname: () => "/",
}));

document.addEventListener("DOMContentLoaded", () => {
	const style = document.createElement("style");
	style.textContent =
		"*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }";
	document.head.appendChild(style);
});

beforeAll(() => worker.start({ onUnhandledRequest: "error" }));

afterEach(() => {
	worker.resetHandlers();
	cleanup();
});
afterAll(() => worker.stop());
