import z from 'zod';
import { ZOD_ERROR_MESSAGES } from './consts';

/** A Tax Number as typed, written in its canonical form: capitals, no separators, a Polish NIP without PL. */
function canonical(typed: string) {
  return typed
    .replace(/[\s.-]/g, '')
    .toUpperCase()
    .replace(/^PL(\d{10})$/, '$1');
}

/** A country prefix other than PL: a foreign VAT number, checked by its shape only. */
function isForeign(tax: string) {
  return /^[A-Z]{2}/.test(tax) && !tax.startsWith('PL');
}

const FOREIGN_VAT_NUMBER = /^[A-Z]{2}[A-Z0-9]{2,12}$/;

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** Ten digits whose last is the weighted sum of the first nine, modulo 11. */
function isPolishNip(tax: string) {
  if (!/^\d{10}$/.test(tax)) return false;
  const digits = [...tax].map(Number);
  const sum = NIP_WEIGHTS.reduce((acc, weight, i) => acc + weight * (digits[i] ?? 0), 0);
  return sum % 11 === digits[9];
}

/** A Customer's Tax Number: a Polish NIP or a foreign VAT number, parsed into its canonical form. */
export const taxNumberSchema = z
  .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
  .trim()
  .min(1, { error: ZOD_ERROR_MESSAGES.FieldRequired })
  .transform(canonical)
  .superRefine((tax, ctx) => {
    if (isForeign(tax)) {
      if (!FOREIGN_VAT_NUMBER.test(tax))
        ctx.addIssue({ code: 'custom', message: 'Nieprawidłowy numer VAT.' });
    } else if (!isPolishNip(tax)) ctx.addIssue({ code: 'custom', message: 'Nieprawidłowy NIP.' });
  });
