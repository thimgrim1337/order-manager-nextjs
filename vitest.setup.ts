import { vi } from "vitest";

vi.mock("@/db/db", () => ({
	db: {} as unknown,
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		refresh: vi.fn(),
	}),
}));

Object.defineProperties(window.HTMLElement.prototype, {
	hasPointerCapture: { value: vi.fn() },
	setPointerCapture: { value: vi.fn() },
	releasePointerCapture: { value: vi.fn() },
	scrollIntoView: { value: vi.fn() },
});
