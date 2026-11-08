import { type AnyColumn, sql } from 'drizzle-orm';

/** `column` in Polish alphabetical order, for `orderBy`; why: CODING_STANDARDS.md (Data access). */
export const inPolishOrder = (column: AnyColumn) => sql`${column} COLLATE "pl-PL-x-icu"`;
