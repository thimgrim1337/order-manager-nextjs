import type { Result } from './error';

/** Why a write was refused, for a form to show it on the field it concerns. */
export type FailureReason = keyof typeof FAILURE_MESSAGES;

/** A refused write, with its reason and Polish message. */
export type Refusal = { success: false; reason: FailureReason; message: string; details?: unknown };

export type ActionResponse<T> = { success: true; data: T; message?: string } | Refusal;

const FAILURE_MESSAGES = {
  InvalidData: 'Nieprawidłowe dane.',
  OrderNrTaken: 'Zlecenie o tym numerze już istnieje.',
  NotFound: 'Zlecenie nie istnieje.',
  UnknownStatus: 'Nieznany status zlecenia.',
  UnknownTruck: 'Wybrany pojazd nie istnieje.',
  UnknownDriver: 'Wybrany kierowca nie istnieje.',
  UnknownCustomer: 'Wybrany zleceniodawca nie istnieje.',
  UnknownCurrency: 'Wybrana waluta nie istnieje.',
  UnknownCity: 'Wybrana miejscowość nie istnieje.',
  RepeatedLoadingPlace: 'Miejsce załadunku powtarza się.',
  RepeatedUnloadingPlace: 'Miejsce rozładunku powtarza się.',
  CityTaken: 'Ta miejscowość już istnieje.',
  CustomerTaken: 'Ten zleceniodawca już istnieje.',
  ExchangeRateNotPublished: 'Nie znaleziono kursu dla wskazanej daty.',
  NbpUnavailable: 'Nie udało się pobrać kursu walut.',
};

/** A failure outcome the translator has a user-facing message for. */
type Failure = { reason: FailureReason; details?: unknown };

/**
 * The Polish message of a failure outcome, for a write's toast or field, or the Order form's
 * Exchange Rate.
 */
export const failureMessage = (failure: Failure) => FAILURE_MESSAGES[failure.reason];

/** Turns a write's outcome into what a Server Action returns, with the failure's Polish message. */
export function toActionResponse<T>([failure, data]: Result<T, Failure>): ActionResponse<T> {
  if (failure === null) return { success: true, data };

  return {
    success: false,
    reason: failure.reason,
    message: failureMessage(failure),
    details: failure.details,
  };
}
