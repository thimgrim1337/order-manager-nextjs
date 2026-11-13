import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TimelinePagination from '@/features/OrdersTimeline/components/TimelinePagination/timeline-pagination';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { holdNavigations, openUrl, renderedUrl } from '../utils/memory-url';
import { orderChoices } from '../utils/order-choices';

const choices = orderChoices();

/** Renders the Timeline's controls at `href`. */
function renderAt(href: string) {
  openUrl(href);
  render(
    <OrderChoicesProvider choices={choices}>
      <TimelinePagination />
    </OrderChoicesProvider>,
  );
  return userEvent.setup();
}

function urlParam(name: string) {
  return renderedUrl().searchParams.get(name);
}

function weekSelect() {
  return screen.getByRole('combobox', { name: 'Tydzień' });
}

function driverSelect() {
  return screen.getByRole('combobox', { name: 'Kierowca' });
}

function nextWeekButton() {
  return screen.getByRole('button', { name: 'Następny tydzień' });
}

function previousWeekButton() {
  return screen.getByRole('button', { name: 'Poprzedni tydzień' });
}

/** Pins today to a Friday in 2026-W46. */
function todayInW46() {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-13T11:00:00Z'));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Timeline Week navigation', () => {
  it('moves to the next Week', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(nextWeekButton());

    expect(urlParam('week')).toBe('2026-W45');
    expect(weekSelect()).toHaveTextContent('45');
  });

  it('moves to the previous Week', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(previousWeekButton());

    expect(urlParam('week')).toBe('2026-W43');
    expect(weekSelect()).toHaveTextContent('43');
  });

  it("moves from a year's last Week to the next year's first", async () => {
    const user = renderAt('/timeline?week=2026-W53');

    await user.click(nextWeekButton());

    expect(urlParam('week')).toBe('2027-W01');
    await user.click(weekSelect());
    expect(await screen.findAllByRole('option')).toHaveLength(52);
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(/^1$/);
  });

  it("moves from a year's first Week to the previous year's last", async () => {
    const user = renderAt('/timeline?week=2026-W01');

    await user.click(previousWeekButton());

    expect(urlParam('week')).toBe('2025-W52');
    await user.click(weekSelect());
    expect(await screen.findAllByRole('option')).toHaveLength(52);
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent(/^52$/);
  });

  it('moves two Weeks on two clicks', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(nextWeekButton());
    await user.click(nextWeekButton());

    expect(urlParam('week')).toBe('2026-W46');
  });

  it('goes back to the current Week', async () => {
    todayInW46();
    const user = renderAt('/timeline?week=2026-W30');

    await user.click(screen.getByRole('button', { name: 'Bieżący tydzień' }));

    expect(urlParam('week')).toBe('2026-W46');
  });
});

describe('Timeline Week select', () => {
  it('shows the Week the URL opened with', () => {
    renderAt('/timeline?week=2026-W44');

    expect(weekSelect()).toHaveTextContent('44');
  });

  it('shows the current Week when the URL names none', () => {
    todayInW46();
    renderAt('/timeline');

    expect(weekSelect()).toHaveTextContent('46');
  });

  it('puts a picked Week in the URL', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(weekSelect());
    await user.click(screen.getByRole('option', { name: '10' }));

    expect(urlParam('week')).toBe('2026-W10');
    expect(weekSelect()).toHaveTextContent('10');
  });

  it("offers the Weeks of the shown Week's year", async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(weekSelect());

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(53);
    expect(options[0]).toHaveTextContent(/^1$/);
    expect(options.at(-1)).toHaveTextContent(/^53$/);
  });
});

describe('Timeline Driver select', () => {
  it('shows the Driver the URL opened with', () => {
    renderAt('/timeline?week=2026-W44&driverId=2');

    expect(driverSelect()).toHaveTextContent('Adam Nowak');
  });

  it('shows every Driver when the URL names none', () => {
    renderAt('/timeline?week=2026-W44');

    expect(driverSelect()).toHaveTextContent('Wszyscy kierowcy');
  });

  it('puts a picked Driver in the URL, keeping the Week', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(driverSelect());
    await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));

    expect(urlParam('driverId')).toBe('2');
    expect(urlParam('week')).toBe('2026-W44');
    expect(driverSelect()).toHaveTextContent('Adam Nowak');
  });

  it('drops the Driver from the URL when every Driver is picked', async () => {
    const user = renderAt('/timeline?week=2026-W44&driverId=2');

    await user.click(driverSelect());
    await user.click(screen.getByRole('option', { name: 'Wszyscy' }));

    expect(urlParam('driverId')).toBeNull();
    expect(driverSelect()).toHaveTextContent('Wszyscy kierowcy');
  });
});

describe('Timeline controls together', () => {
  it('keeps the picked Driver when the Week moves', async () => {
    const user = renderAt('/timeline?week=2026-W44&driverId=2');

    await user.click(nextWeekButton());

    expect(urlParam('week')).toBe('2026-W45');
    expect(urlParam('driverId')).toBe('2');
  });

  it('keeps a Driver picked while its navigation is still loading when the Week moves', async () => {
    const user = renderAt('/timeline?week=2026-W44');
    const release = holdNavigations();

    await user.click(driverSelect());
    await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));
    await user.click(nextWeekButton());
    release({ lastOnly: true });

    await expect.poll(() => urlParam('week')).toBe('2026-W45');
    expect(urlParam('driverId')).toBe('2');
  });

  it('moves two Weeks on two clicks while the first is still loading', async () => {
    const user = renderAt('/timeline?week=2026-W44');
    const release = holdNavigations();

    await user.click(nextWeekButton());
    await user.click(nextWeekButton());
    release({ lastOnly: true });

    await expect.poll(() => urlParam('week')).toBe('2026-W46');
  });

  it('keeps the picked Driver when a Week is picked', async () => {
    const user = renderAt('/timeline?week=2026-W44');

    await user.click(driverSelect());
    await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));
    await user.click(weekSelect());
    await user.click(screen.getByRole('option', { name: '10' }));

    expect(urlParam('week')).toBe('2026-W10');
    expect(urlParam('driverId')).toBe('2');
    expect(driverSelect()).toHaveTextContent('Adam Nowak');
  });
});
