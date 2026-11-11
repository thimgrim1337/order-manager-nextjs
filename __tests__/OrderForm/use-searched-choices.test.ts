import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useSearchedChoices from '@/features/OrderForm/hooks/use-searched-choices';

type Item = { id: number; name: string };

const plock: Item = { id: 1, name: 'Płock' };
const lodz: Item = { id: 2, name: 'Łódź' };
const zgierz: Item = { id: 3, name: 'Zgierz' };
const starting = [plock, lodz];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

/** Lets the debounce run out and the search's promise settle. */
async function pause(ms = 300) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

describe('useSearchedChoices', () => {
  it('searches once per pause in typing, with the last text', async () => {
    const search = vi.fn(async (_text: string) => [zgierz]);
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [] }),
    );

    act(() => result.current.setSearchText('Z'));
    await pause(100);
    act(() => result.current.setSearchText('Zg'));
    await pause(100);
    act(() => result.current.setSearchText('Zgi'));
    await pause();

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('Zgi');
    expect(result.current.choices).toEqual([zgierz]);
  });

  it('drops a response that arrives after a newer search', async () => {
    const answers: Record<string, Item[]> = { Ł: [lodz], Z: [zgierz] };
    // The search for Ł answers only after the one for Z.
    const delays: Record<string, number> = { Ł: 1000, Z: 0 };
    const search = vi.fn(
      (text: string) =>
        new Promise<Item[]>((resolve) =>
          setTimeout(() => resolve(answers[text] ?? []), delays[text]),
        ),
    );
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [] }),
    );

    act(() => result.current.setSearchText('Ł'));
    await pause();
    act(() => result.current.setSearchText('Z'));
    await pause();
    await pause(1000);

    expect(search).toHaveBeenCalledTimes(2);
    expect(result.current.choices).toEqual([zgierz]);
  });

  it('offers the starting choices before any search', () => {
    const search = vi.fn(async (_text: string) => [zgierz]);
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [] }),
    );

    expect(result.current.choices).toEqual([plock, lodz]);
  });

  it('restores the starting choices once the search text is emptied, dropping a search in flight', async () => {
    const search = vi.fn(
      (_text: string) => new Promise<Item[]>((resolve) => setTimeout(() => resolve([zgierz]), 500)),
    );
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [] }),
    );

    act(() => result.current.setSearchText('Zg'));
    await pause();
    act(() => result.current.setSearchText(''));
    expect(result.current.choices).toEqual([plock, lodz]);

    await pause(1000);
    expect(result.current.choices).toEqual([plock, lodz]);
  });

  it("offers the starting choices, not an earlier search's, when typing again after emptying the text", async () => {
    const search = vi.fn(async (_text: string) => [zgierz]);
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [] }),
    );

    act(() => result.current.setSearchText('Zg'));
    await pause();
    act(() => result.current.setSearchText(''));
    act(() => result.current.setSearchText('Ł'));

    expect(result.current.choices).toEqual([plock, lodz]);
  });

  it('lists the picked items missing from the starting choices first while there is no search text', async () => {
    const search = vi.fn(async (_text: string) => [lodz]);
    const { result } = renderHook(() =>
      useSearchedChoices({ search, startingChoices: starting, picked: [lodz, zgierz] }),
    );

    expect(result.current.choices).toEqual([zgierz, plock, lodz]);

    act(() => result.current.setSearchText('Ł'));
    await pause();
    expect(result.current.choices).toEqual([lodz]);
  });

  it('keeps a search running when the search function and starting choices change, offering the new starting choices after', async () => {
    const answer = async (_text: string) => [zgierz];
    const first = vi.fn(answer);
    const latest = vi.fn(answer);
    const { result, rerender } = renderHook(
      ({ search, startingChoices }) => useSearchedChoices({ search, startingChoices, picked: [] }),
      { initialProps: { search: first, startingChoices: starting } },
    );

    act(() => result.current.setSearchText('Zg'));
    await pause(200);
    rerender({ search: latest, startingChoices: [plock] });
    await pause(100);

    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);
    expect(result.current.choices).toEqual([zgierz]);

    act(() => result.current.setSearchText(''));
    expect(result.current.choices).toEqual([plock]);
  });
});
