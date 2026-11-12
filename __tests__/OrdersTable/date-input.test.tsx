import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import DateInput from '@/features/OrdersTable/components/OrdersFilter/date-input';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('startDate=2026-09-15'),
  usePathname: () => '/orders',
  useRouter: () => ({ replace: vi.fn() }),
}));

it("names a date filter's calendar in Polish", async () => {
  render(<DateInput filterName="startDate" />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: '2026-09-15' }));

  expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'wrzesień 2026');
});
