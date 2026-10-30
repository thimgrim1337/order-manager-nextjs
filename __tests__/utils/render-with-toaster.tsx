import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Toaster } from 'sonner';

/**
 * Renders `ui` beside a Toaster, so a component's toasts reach the DOM.
 *
 * Mounts sonner's own Toaster: the app's `@/components/ui/sonner` reads `next-themes` and throws
 * `reading 'useContext'` in browser tests. Sonner fades toasts in, so poll for them:
 * `await expect.poll(() => screen.queryByText('…')).toBeVisible()`.
 */
export function renderWithToaster(ui: ReactElement) {
  return render(
    <>
      {ui}
      <Toaster />
    </>,
  );
}
