/**
 * Prisma maps money columns to `Decimal`. A `Decimal` is a decimal.js instance
 * (neither a number nor a string), and JSON.stringify turns it into a string —
 * so responses would carry `"250.00"` where `@repo/contracts` declares a
 * number. Coerce every money value on the way out.
 */
export function toAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  // `Number()` goes through Decimal#valueOf / #toString; numeric strings from
  // request payloads are handled by the same path.
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
