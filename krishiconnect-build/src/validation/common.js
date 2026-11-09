/**
 * Shared validation primitives.
 *
 * Validation functions return structured error codes (not display strings) so
 * the same rules can drive English and Kannada messages and automated tests.
 */

export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const NUMBER_PATTERN = /^\d+(\.\d+)?$/

export function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === ''
}

export function error(code, params = {}) {
  return { code, params }
}

/**
 * Validates a non-negative decimal number within an inclusive range.
 * Used by both calculators and by farmer onboarding.
 */
export function validateNumberField(rawValue, { min, max }) {
  if (isEmpty(rawValue)) {
    return { value: null, error: error('REQUIRED') }
  }
  const text = String(rawValue).trim()
  if (!NUMBER_PATTERN.test(text)) {
    return { value: null, error: error('NOT_NUMBER') }
  }
  const value = Number(text)
  if (!Number.isFinite(value)) {
    return { value: null, error: error('NOT_NUMBER') }
  }
  if (value < min) {
    return { value: null, error: error('BELOW_MIN', { min }) }
  }
  if (value > max) {
    return { value: null, error: error('ABOVE_MAX', { max }) }
  }
  return { value, error: null }
}

export function validateRequiredText(rawValue, { min = 1, max = 120 } = {}) {
  if (isEmpty(rawValue)) return { value: '', error: error('REQUIRED') }
  const value = String(rawValue).trim()
  if (value.length < min) return { value, error: error('TOO_SHORT', { min }) }
  if (value.length > max) return { value, error: error('TOO_LONG', { max }) }
  return { value, error: null }
}

export function validateEmail(rawValue) {
  if (isEmpty(rawValue)) return { value: '', error: error('REQUIRED') }
  const value = String(rawValue).trim().toLowerCase()
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) {
    return { value, error: error('INVALID_EMAIL') }
  }
  return { value, error: null }
}

export function validatePassword(rawValue) {
  if (isEmpty(rawValue)) return { value: '', error: error('REQUIRED') }
  const value = String(rawValue)
  if (value.length < 8) return { value, error: error('PASSWORD_TOO_SHORT', { min: 8 }) }
  if (value.length > 128) return { value, error: error('PASSWORD_TOO_LONG', { max: 128 }) }
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return { value, error: error('PASSWORD_WEAK') }
  }
  return { value, error: null }
}

export function firstError(result) {
  return result && result.error ? result.error : null
}
