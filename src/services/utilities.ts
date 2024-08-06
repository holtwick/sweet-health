/** Tolerant number extractor, even if noisy string */
export function extractNumber(str: string): number | null {
  const match = str.match(/\d+/g)
  return match ? Number.parseInt(match[0]) : null
}

/** Tolerant ISO parser */
export function parseDateISOString(s: string) {
  const ds = s.split(/\D/).map(s => Number.parseInt(s))
  ds[1] = ds[1] - 1 // adjust month
  // @ts-expect-error xxx
  return new Date(...ds)
}

/**
 * [BG (mmol/L) * 18] = BG (mg/dL)
 *
 * Return the normalized mmol/L
 *
 * http://www.bcchildrens.ca/endocrinology-diabetes-site/documents/glucoseunits.pdf
 */
export function mgdlToMmol(mgdl: number): number {
  return +(mgdl / 18).toFixed(2)
}
