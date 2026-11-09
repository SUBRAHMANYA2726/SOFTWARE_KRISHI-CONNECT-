import { getFirebase } from '../../firebase/client'
import { AppError, mapAuthError } from '../authErrors'

/**
 * Firebase-backed adapter. Activated automatically when all public Firebase
 * environment values are present. Data model:
 *   farmers/{uid}                      → farm profile (owner only)
 *   farmers/{uid}/reports/{reportId}   → saved calculator reports (owner only)
 */
function toISO(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  return null
}

function mapProfile(snapshot) {
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return { ...data, createdAt: toISO(data.createdAt), updatedAt: toISO(data.updatedAt) }
}

function mapReport(snapshot) {
  const data = snapshot.data()
  return {
    ...data,
    id: snapshot.id,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

export const firebaseAdapter = {
  mode: 'firebase',

  onAuthChange(callback) {
    let unsubscribe = () => {}
    let cancelled = false
    getFirebase()
      .then(({ auth, authModule }) => {
        if (cancelled) return
        unsubscribe = authModule.onAuthStateChanged(auth, (user) => {
          callback(
            user
              ? {
                  uid: user.uid,
                  email: user.email,
                  displayName: user.displayName,
                  provider: user.providerData?.[0]?.providerId || 'password',
                  createdAt: user.metadata?.creationTime,
                }
              : null,
          )
        })
      })
      .catch(() => callback(null))
    return () => {
      cancelled = true
      unsubscribe()
    }
  },

  async register({ email, password, fullName }) {
    const { auth, authModule } = await getFirebase()
    try {
      const credential = await authModule.createUserWithEmailAndPassword(auth, email, password)
      if (fullName) await authModule.updateProfile(credential.user, { displayName: fullName })
      return credential.user
    } catch (error) {
      throw mapAuthError(error)
    }
  },

  async login({ email, password }) {
    const { auth, authModule } = await getFirebase()
    try {
      const credential = await authModule.signInWithEmailAndPassword(auth, email, password)
      return credential.user
    } catch (error) {
      throw mapAuthError(error)
    }
  },

  async loginWithGoogle() {
    const { auth, authModule } = await getFirebase()
    try {
      const provider = new authModule.GoogleAuthProvider()
      const credential = await authModule.signInWithPopup(auth, provider)
      return credential.user
    } catch (error) {
      throw mapAuthError(error)
    }
  },

  async logout() {
    const { auth, authModule } = await getFirebase()
    await authModule.signOut(auth)
  },

  async getProfile(uid) {
    const { db, firestoreModule } = await getFirebase()
    const snapshot = await firestoreModule.getDoc(firestoreModule.doc(db, 'farmers', uid))
    return mapProfile(snapshot)
  },

  async saveProfile(uid, profile) {
    const { db, firestoreModule } = await getFirebase()
    const reference = firestoreModule.doc(db, 'farmers', uid)
    const existing = await firestoreModule.getDoc(reference)
    const payload = {
      ...profile,
      uid,
      updatedAt: firestoreModule.serverTimestamp(),
    }
    if (!existing.exists()) payload.createdAt = firestoreModule.serverTimestamp()
    await firestoreModule.setDoc(reference, payload, { merge: true })
    return { ...profile, uid }
  },

  async listReports(uid) {
    const { db, firestoreModule } = await getFirebase()
    const collection = firestoreModule.collection(db, 'farmers', uid, 'reports')
    const snapshot = await firestoreModule.getDocs(
      firestoreModule.query(collection, firestoreModule.orderBy('createdAt', 'desc')),
    )
    return snapshot.docs.map(mapReport)
  },

  async getReport(uid, reportId) {
    const { db, firestoreModule } = await getFirebase()
    const snapshot = await firestoreModule.getDoc(
      firestoreModule.doc(db, 'farmers', uid, 'reports', reportId),
    )
    return snapshot.exists() ? mapReport(snapshot) : null
  },

  async saveReport(uid, report) {
    const { db, firestoreModule } = await getFirebase()
    const payload = {
      ...report,
      createdAt: firestoreModule.serverTimestamp(),
      updatedAt: firestoreModule.serverTimestamp(),
    }
    const reference = await firestoreModule.addDoc(
      firestoreModule.collection(db, 'farmers', uid, 'reports'),
      payload,
    )
    return { ...report, id: reference.id, createdAt: new Date().toISOString() }
  },

  async deleteReport(uid, reportId) {
    const { db, firestoreModule } = await getFirebase()
    await firestoreModule.deleteDoc(firestoreModule.doc(db, 'farmers', uid, 'reports', reportId))
  },

  async resetPassword(email) {
    const { auth, authModule } = await getFirebase()
    try {
      await authModule.sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw mapAuthError(error)
    }
  },
}

export { AppError }
