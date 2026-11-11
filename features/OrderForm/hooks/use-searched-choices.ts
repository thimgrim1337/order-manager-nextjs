import { useEffect, useEffectEvent, useState } from 'react';

type SearchedChoicesOptions<T> = {
  /** Finds the choices matching the search text, e.g. through a Server Action. */
  search: (text: string) => Promise<T[]>;
  /** The choices offered while there is no search text. */
  startingChoices: T[];
  /** Offered first while there is no search text, ahead of the picked items, e.g. ones just created. */
  offered?: T[];
  /** The items the field holds. */
  picked: T[];
};

/** How long typing must pause before a search runs, in ms. */
const SEARCH_DELAY = 300;

/** The choices a searched field offers as the user types. */
export default function useSearchedChoices<T extends { id: number }>({
  search,
  startingChoices,
  offered = [],
  picked,
}: SearchedChoicesOptions<T>) {
  const [searchText, setSearchText] = useState('');
  // What the last answered search found, shown until a newer one answers; `null` with no search text.
  const [found, setFound] = useState<T[] | null>(null);

  const runSearch = useEffectEvent((text: string) => search(text));

  useEffect(() => {
    if (!searchText) return;

    let isStale = false;
    const timer = setTimeout(async () => {
      const result = await runSearch(searchText);
      if (!isStale) setFound(result);
    }, SEARCH_DELAY);

    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [searchText]);

  const changeSearchText = (text: string) => {
    setSearchText(text);
    if (!text) setFound(null);
  };

  const choices =
    (searchText && found) ||
    uniqueById([
      ...offered,
      // A picked item found by an earlier search, or saved on the Order, stays among the choices.
      ...picked.filter((item) => !startingChoices.some((choice) => choice.id === item.id)),
      ...startingChoices,
    ]);

  return { choices, setSearchText: changeSearchText };
}

/** `items` without repeats, each kept where it first appears. */
const uniqueById = <T extends { id: number }>(items: T[]) =>
  items.filter((item, index) => items.findIndex(({ id }) => id === item.id) === index);
