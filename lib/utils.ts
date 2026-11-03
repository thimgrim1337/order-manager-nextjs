import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `%search%` for `ilike`, or undefined for an empty search, which matches everything. */
export function toSearchTerm(search?: string) {
  const trimmed = search?.trim();

  return trimmed ? `%${trimmed}%` : undefined;
}
