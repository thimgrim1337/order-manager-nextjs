import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { createElement } from 'react';
import { Toaster } from 'sonner';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
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

/**
 * Every test renders beside sonner's own Toaster, so a toast, or its absence, shows in the DOM;
 * the app's `@/components/ui/sonner` reads `next-themes` and throws `reading 'useContext'` here.
 * Sonner fades toasts in, so poll for them: `await expect.poll(() => screen.queryByText('…')).toBeVisible()`.
 */
beforeEach(() => {
  render(createElement(Toaster));
});

afterEach(() => {
  worker.resetHandlers();
  // Before cleanup, while the page's hooks still listen for the popstate it sends.
  closeUrl();
  cleanup();
});
afterAll(() => worker.stop());
