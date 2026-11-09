/**
 * Firebase client initialization.
 *
 * Only public Firebase web config values are used here (they are designed to be
 * shipped to browsers). Access is protected by Firestore security rules, never
 * by hiding these identifiers. Service-account keys must never reach this app.
 */
const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
]

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export function isFirebaseConfigured() {
  return requiredKeys.every((key) => {
    const value = (import.meta.env[key] || '').trim()
    return value.length > 0 && !value.includes('your-') && !value.includes('YOUR_')
  })
}

let cached = null

export async function getFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error('FIREBASE_NOT_CONFIGURED')
  }
  if (cached) return cached

  const [{ initializeApp, getApps }, authModule, firestoreModule] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])

  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  cached = {
    app,
    auth: authModule.getAuth(app),
    db: firestoreModule.getFirestore(app),
    authModule,
    firestoreModule,
  }
  return cached
}
