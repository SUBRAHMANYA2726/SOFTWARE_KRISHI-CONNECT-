import {
  error,
  firstError,
  validateEmail,
  validatePassword,
  validateRequiredText,
} from './common'

export const NAME_LIMITS = { min: 2, max: 60 }
export const PASSWORD_LIMITS = { min: 8, max: 128 }

export function validateRegistration({ fullName, email, password, confirmPassword }) {
  const errors = {}

  const name = validateRequiredText(fullName, NAME_LIMITS)
  if (name.error) errors.fullName = name.error

  const mail = validateEmail(email)
  if (mail.error) errors.email = mail.error

  const pass = validatePassword(password)
  if (pass.error) errors.password = pass.error

  if (!confirmPassword) {
    errors.confirmPassword = error('REQUIRED')
  } else if (password !== confirmPassword) {
    errors.confirmPassword = error('PASSWORD_MISMATCH')
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return {
    ok: true,
    values: { fullName: name.value, email: mail.value, password: pass.value },
  }
}

export function validateLogin({ email, password }) {
  const errors = {}

  const mail = validateEmail(email)
  if (mail.error) errors.email = mail.error

  if (!password) errors.password = error('REQUIRED')

  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, values: { email: mail.value, password } }
}

export { firstError }
