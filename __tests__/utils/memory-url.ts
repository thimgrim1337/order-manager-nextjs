import { useSyncExternalStore } from 'react';

/**
 * An in-memory URL standing in for the Next router in browser tests (`vitest.setup.ts` mocks
 * `next/navigation` with it): `replace` renders the page at the new URL, so what a control writes
 * comes back as its next value. Each test starts at `/`; `openUrl` starts it elsewhere.
 */

const ORIGIN = 'http://localhost';

let rendered = new URL('/', ORIGIN);
let requested: URL | undefined;
let held: URL[] | undefined;
const listeners = new Set<() => void>();

function render(url: URL) {
  rendered = url;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function navigate(href: string) {
  const url = new URL(href, rendered);
  requested = url;
  if (held) held.push(url);
  else render(url);
}

/** The page's URL before it renders, e.g. `openUrl('/orders?sort=driverFullname.asc')`. */
export function openUrl(href: string) {
  rendered = new URL(href, ORIGIN);
  requested = undefined;
}

/** The URL the page renders. */
export function renderedUrl() {
  return rendered;
}

/** The URL the last navigation since `openUrl` went to, rendered or still held. */
export function requestedUrl() {
  return requested;
}

/**
 * Keeps navigations in flight until the returned `release` renders them in order, the way a
 * navigation that is still loading leaves the page on its old URL.
 */
export function holdNavigations() {
  held = [];
  return function release() {
    const navigations = held ?? [];
    held = undefined;
    for (const url of navigations) render(url);
  };
}

/** Leaves the page as a browser does (a popstate, so no change stays pending), back at `/`. */
export function closeUrl() {
  window.dispatchEvent(new PopStateEvent('popstate'));
  held = undefined;
  openUrl('/');
}

export const nextNavigation = {
  useSearchParams: () =>
    new URLSearchParams(useSyncExternalStore(subscribe, () => rendered.search)),
  usePathname: () => useSyncExternalStore(subscribe, () => rendered.pathname),
  useRouter: () => ({ replace: navigate }),
};
