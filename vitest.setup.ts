import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { worker } from './__tests__/mocks/browser';
import { closeUrl } from './__tests__/utils/memory-url';

// vi.mock('@/db/db', () => ({
//   db: {} as unknown,
// }));

vi.mock('@/lib/actions', async () => (await import('./__tests__/mocks/actions')).actions);

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn(),
}));

vi.mock(
  'next/navigation',
  async () => (await import('./__tests__/utils/memory-url')).nextNavigation,
);

document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent =
    '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }';
  document.head.appendChild(style);
});

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: 'error',
    serviceWorker: {
      url: '/mockServiceWorker.js', // make sure this file exists in /public
    },
  });
});

afterEach(() => {
  worker.resetHandlers();
  // Before cleanup, while the page's hooks still listen for the popstate it sends.
  closeUrl();
  cleanup();
});
afterAll(() => worker.stop());
