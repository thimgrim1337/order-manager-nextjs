/**
 * The PLN Price of `price` at the Exchange Rate `rate`, to the grosz, half a grosz rounded up.
 *
 * Works in whole grosze and ten-thousandths of the rate, the scales the Order stores them at,
 * so the product is exact: in floating point 1070 × 4.1235 lands just below 4412.145.
 */
export function toPricePLN(price: string, rate: string) {
  const grosze = Math.round(Number(price) * 100);
  const rateTenThousandths = Math.round(Number(rate) * 10_000);

  return (Math.round((grosze * rateTenThousandths) / 10_000) / 100).toFixed(2);
}
