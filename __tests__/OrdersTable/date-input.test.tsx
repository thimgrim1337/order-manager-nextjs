import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import DateInput from '@/features/OrdersTable/components/OrdersFilter/date-input';
import { openUrl } from '../utils/memory-url';

it("names a date filter's calendar in Polish", async () => {
  openUrl('/orders?startDate=2026-09-15');
  render(<DateInput id="start-date" filterName="startDate" />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('button', { name: '2026-09-15' }));

  expect(screen.getByRole('grid')).toHaveAttribute('aria-label', 'wrzesień 2026');
});
