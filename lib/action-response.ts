import type { Result } from './error';

export type ActionResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message?: string; details?: unknown };

const FAILURE_MESSAGES = {
  InvalidData: 'Nieprawidłowe dane.',
  OrderNrTaken: 'Zlecenie o tym numerze już istnieje.',
  NotFound: 'Zlecenie nie istnieje.',
  UnknownStatus: 'Nieznany status zlecenia.',
  CityTaken: 'Ta miejscowość już istnieje.',
  CustomerTaken: 'Ten zleceniodawca już istnieje.',
  ExchangeRateNotPublished: 'Nie znaleziono kursu dla wskazanej daty.',
  NbpUnavailable: 'Nie udało się pobrać kursu walut.',
};

/** A failure outcome the translator has a user-facing message for. */
type Failure = { reason: keyof typeof FAILURE_MESSAGES; details?: unknown };

/** The Polish message of a failure outcome, for a write's toast or the Order form's Exchange Rate. */
export const failureMessage = (failure: Failure) => FAILURE_MESSAGES[failure.reason];

/** Turns a write's outcome into what a Server Action returns, with the failure's Polish message. */
export function toActionResponse<T>([failure, data]: Result<T, Failure>): ActionResponse<T> {
  if (failure === null) return { success: true, data };

  return { success: false, message: failureMessage(failure), details: failure.details };
}
