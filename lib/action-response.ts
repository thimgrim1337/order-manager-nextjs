import type { Result } from './error';

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message?: string; details?: unknown };

const FAILURE_MESSAGES = {
  InvalidData: 'Nieprawidłowe dane.',
  OrderNrTaken: 'Zlecenie o tym numerze już istnieje.',
  NotFound: 'Zlecenie nie istnieje.',
};

/** A failure outcome the translator has a user-facing message for. */
type Failure = { reason: keyof typeof FAILURE_MESSAGES; details?: unknown };

/** Turns a write's outcome into what a Server Action returns, with the failure's Polish message. */
export function toActionResponse<T>([failure, data]: Result<T, Failure>): ActionResponse<T> {
  if (failure === null) return { success: true, data };

  return { success: false, message: FAILURE_MESSAGES[failure.reason], details: failure.details };
}
