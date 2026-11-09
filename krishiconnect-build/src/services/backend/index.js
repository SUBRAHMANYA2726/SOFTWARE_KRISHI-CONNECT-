import { isFirebaseConfigured } from '../../firebase/client'
import { firebaseAdapter } from './firebaseAdapter'
import { localAdapter } from './localAdapter'

/**
 * Single data-access entry point for the whole app. Swapping Firebase for
 * another provider only requires implementing the same eight methods.
 */
const configured = isFirebaseConfigured()

export const backend = configured ? firebaseAdapter : localAdapter
export const backendMode = backend.mode
export const isDemoMode = backendMode === 'demo'
