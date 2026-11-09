import { AppError } from '../authErrors'

/**
 * Local demonstration adapter.
 *
 * Used ONLY when Firebase environment values are absent. It keeps the app fully
 * testable without inventing Firebase credentials. The UI labels this mode and
 * the data never leaves this browser. The API mirrors firebaseAdapter.js.
 */
const USERS_KEY = 'kc.demo.users.v1'
const SESSION_KEY = 'kc.demo.session.v1'
const profileKey = (uid) => `kc.demo.profile.${uid}`
const reportsKey = (uid) => `kc.demo.reports.${uid}`
const listeners = new Set()

function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function readUsers() {
  const users = readJSON(USERS_KEY, [])
  return Array.isArray(users) ? users : []
}

function toPublicUser(record) {
  if (!record) return null
  return {
    uid: record.uid,
    email: record.email,
    displayName: record.displayName,
    provider: record.provider,
    createdAt: record.createdAt,
  }
}

function currentUserId() {
  try {
    return window.localStorage.getItem(SESSION_KEY) || null
  } catch {
    return null
  }
}

function currentUser() {
  const uid = currentUserId()
  if (!uid) return null
  return toPublicUser(readUsers().find((user) => user.uid === uid))
}

function notify() {
  const user = currentUser()
  listeners.forEach((listener) => listener(user))
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const localAdapter = {
  mode: 'demo',

  onAuthChange(callback) {
    listeners.add(callback)
    callback(currentUser())
    return () => listeners.delete(callback)
  },

  async register({ email, password, fullName }) {
    const users = readUsers()
    const normalisedEmail = email.trim().toLowerCase()
    if (users.some((user) => user.email === normalisedEmail)) {
      throw new AppError('AUTH_EMAIL_IN_USE')
    }
    const salt = window.crypto.randomUUID()
    const record = {
      uid: `demo_${window.crypto.randomUUID().slice(0, 12)}`,
      email: normalisedEmail,
      displayName: fullName,
      provider: 'password',
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    }
    writeJSON(USERS_KEY, [...users, record])
    window.localStorage.setItem(SESSION_KEY, record.uid)
    notify()
    return toPublicUser(record)
  },

  async login({ email, password }) {
    const normalisedEmail = email.trim().toLowerCase()
    const record = readUsers().find((user) => user.email === normalisedEmail)
    if (!record) throw new AppError('AUTH_INVALID_CREDENTIAL')
    const candidate = await hashPassword(password, record.salt)
    if (candidate !== record.passwordHash) throw new AppError('AUTH_INVALID_CREDENTIAL')
    window.localStorage.setItem(SESSION_KEY, record.uid)
    notify()
    return toPublicUser(record)
  },

  async loginWithGoogle() {
    throw new AppError('AUTH_GENERIC')
  },

  async logout() {
    window.localStorage.removeItem(SESSION_KEY)
    notify()
  },

  async getProfile(uid) {
    return readJSON(profileKey(uid), null)
  },

  async saveProfile(uid, profile) {
    const existing = readJSON(profileKey(uid), null)
    const next = {
      ...existing,
      ...profile,
      uid,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    writeJSON(profileKey(uid), next)
    return next
  },

  async listReports(uid) {
    const reports = readJSON(reportsKey(uid), [])
    return Array.isArray(reports)
      ? [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : []
  },

  async getReport(uid, reportId) {
    const reports = readJSON(reportsKey(uid), [])
    return reports.find((report) => report.id === reportId) || null
  },

  async saveReport(uid, report) {
    const reports = readJSON(reportsKey(uid), [])
    const record = {
      ...report,
      id: `rep_${window.crypto.randomUUID().slice(0, 12)}`,
      uid,
      createdAt: new Date().toISOString(),
    }
    writeJSON(reportsKey(uid), [...reports, record])
    return record
  },

  async deleteReport(uid, reportId) {
    const reports = readJSON(reportsKey(uid), [])
    writeJSON(
      reportsKey(uid),
      reports.filter((report) => report.id !== reportId),
    )
  },

  async resetPassword() {
    throw new AppError('DEMO_UNAVAILABLE')
  },
}
