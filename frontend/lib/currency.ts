const dkkFormatter = new Intl.NumberFormat('da-DK', {
  style: 'currency',
  currency: 'DKK',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format integer øre/cents as Danish kroner (DKK). */
export function formatDkk(cents: number): string {
  return dkkFormatter.format(cents / 100);
}

export const freeShippingThresholdDkk = 375;
