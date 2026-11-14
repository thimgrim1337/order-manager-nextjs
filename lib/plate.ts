/**
 * Text typed to find a Plate, as `GLOSSARY.md` defines it: a Plate is written without spaces or
 * dashes, so they are left out of the text to match one. Empty when nothing is left.
 */
export function plateSearchText(typed: string) {
  return typed.replace(/[\s-]/g, '');
}

/** Whether `plate`, written in capitals, contains the text typed to find it, letter case ignored. */
export function plateMatches(plate: string, typed: string) {
  const text = plateSearchText(typed);
  return text !== '' && plate.includes(text.toUpperCase());
}
