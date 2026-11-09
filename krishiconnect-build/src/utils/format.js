const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

/** Format a rupee amount using Indian digit grouping (e.g. ₹1,25,000). */
export function formatINR(value, { decimals = false } = {}) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return decimals ? inrDecimalFormatter.format(numeric) : inrFormatter.format(numeric)
}

/** Format a plain number with Indian digit grouping. */
export function formatNumber(value, fallback = '—') {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return numberFormatter.format(numeric)
}

/** Format a quantity with a unit, e.g. 12.5 qt/acre. */
export function formatQuantity(value, unit) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return `${numberFormatter.format(numeric)} ${unit}`
}

export function formatDate(value, locale = 'en-IN') {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value, locale = 'en-IN') {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Converts acres to hectares using the international acre. */
export const ACRES_TO_HECTARES = 0.40468564224

export function round(value, places = 2) {
  const factor = 10 ** places
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor
}

export function percent(part, total) {
  if (!total) return 0
  return round((part / total) * 100, 1)
}
