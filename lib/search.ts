/**
 * A search's term, for the Orders Table's Search and the comboboxes' alike: `search` trimmed, as
 * `text`, and wrapped as `%text%` for `ilike`, as `pattern`, with its `%`, `_` and `\` escaped so
 * each matches only itself (`\` being Postgres's default LIKE escape:
 * https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE); or undefined
 * for an empty search, which matches everything.
 */
export function toSearchTerm(search?: string) {
  const text = search?.trim();

  return text ? { text, pattern: `%${text.replace(/[\\%_]/g, '\\$&')}%` } : undefined;
}
