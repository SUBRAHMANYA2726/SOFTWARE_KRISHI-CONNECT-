const FIREBASE_ERROR_MAP = {
  'auth/invalid-credential': 'AUTH_INVALID_CREDENTIAL',
  'auth/wrong-password': 'AUTH_INVALID_CREDENTIAL',
  'auth/user-not-found': 'AUTH_INVALID_CREDENTIAL',
  'auth/invalid-login-credentials': 'AUTH_INVALID_CREDENTIAL',
  'auth/email-already-in-use': 'AUTH_EMAIL_IN_USE',
  'auth/weak-password': 'AUTH_WEAK_PASSWORD',
  'auth/too-many-requests': 'AUTH_TOO_MANY',
  'auth/network-request-failed': 'AUTH_NETWORK',
  'auth/popup-closed-by-user': 'AUTH_POPUP',
  'auth/cancelled-popup-request': 'AUTH_POPUP',
  'auth/popup-blocked': 'AUTH_POPUP',
  'auth/operation-not-allowed': 'AUTH_GENERIC',
  'auth/invalid-email': 'INVALID_EMAIL',
}

export class AppError extends Error {
  constructor(code, params = {}) {
    super(code)
    this.name = 'AppError'
    this.code = code
    this.params = params
  }
}

export function mapAuthError(error) {
  if (!error) return new AppError('AUTH_GENERIC')
  if (error.code && FIREBASE_ERROR_MAP[error.code]) {
    return new AppError(FIREBASE_ERROR_MAP[error.code])
  }
  if (error.code && String(error.code).startsWith('auth/')) {
    return new AppError('AUTH_GENERIC')
  }
  if (error instanceof AppError) return error
  return new AppError(error.code && error.code === 'DEMO_MODE' ? 'AUTH_GENERIC' : 'AUTH_GENERIC')
}
