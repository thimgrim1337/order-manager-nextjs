import { vi } from 'vitest';
import type * as Actions from '@/lib/actions';

/**
 * A vi.fn() for every Server Action; tsc flags a missing or stale one. Listed by hand because an
 * automock imports the real module, whose database client can't load in the browser.
 */
export const actions = {
  createOrder: vi.fn(),
  updateOrder: vi.fn(),
  changeOrderStatus: vi.fn(),
  removeOrder: vi.fn(),
  searchCustomers: vi.fn(),
  searchCities: vi.fn(),
  createCustomer: vi.fn(),
  createCity: vi.fn(),
} satisfies Record<keyof typeof Actions, unknown>;
