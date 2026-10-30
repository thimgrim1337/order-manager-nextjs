import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DebouncedInput from '@/components/ui/debounced-input';

describe('DebouncedInput', () => {
  it('hands the typed value to the latest onFiltersChange when it changes within the debounce', async () => {
    const user = userEvent.setup();
    const stale = vi.fn();
    const latest = vi.fn();
    const { rerender } = render(
      <DebouncedInput value="" onFiltersChange={stale} debounce={100} placeholder="search" />,
    );

    await user.type(screen.getByPlaceholderText('search'), 'Kraków');
    rerender(
      <DebouncedInput value="" onFiltersChange={latest} debounce={100} placeholder="search" />,
    );

    await vi.waitFor(() => expect(latest).toHaveBeenCalledWith('Kraków'));
    expect(stale).not.toHaveBeenCalledWith('Kraków');
  });
});
