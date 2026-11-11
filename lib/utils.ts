import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * A search's term, for the Orders Table's Search and the comboboxes' alike: `search` trimmed, as
 * `text`, and wrapped as `%text%` for `ilike`, as `pattern`; or undefined for an empty search,
 * which matches everything.
 */
export function toSearchTerm(search?: string) {
  const text = search?.trim();

  return text ? { text, pattern: `%${text}%` } : undefined;
}
