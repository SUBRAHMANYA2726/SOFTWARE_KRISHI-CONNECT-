import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { backend, isDemoMode } from '../services/backend'
import { mapAuthError } from '../services/authErrors'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authPending, setAuthPending] = useState(false)

  useEffect(() => {
    let active = true
    const unsubscribe = backend.onAuthChange(async (nextUser) => {
      if (!active) return
      setAuthPending(false)
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setInitializing(false)
        return
      }
      setProfileLoading(true)
      try {
        const stored = await backend.getProfile(nextUser.uid)
        if (active) setProfile(stored)
      } catch {
        if (active) setProfile(null)
      } finally {
        if (active) {
          setProfileLoading(false)
          setInitializing(false)
        }
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return null
    const stored = await backend.getProfile(user.uid)
    setProfile(stored)
    return stored
  }, [user])

  const register = useCallback(async (details) => {
    setAuthPending(true)
    try {
      return await backend.register(details)
    } catch (error) {
      setAuthPending(false)
      throw mapAuthError(error)
    }
  }, [])

  const login = useCallback(async (details) => {
    setAuthPending(true)
    try {
      return await backend.login(details)
    } catch (error) {
      setAuthPending(false)
      throw mapAuthError(error)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    try {
      return await backend.loginWithGoogle()
    } catch (error) {
      throw mapAuthError(error)
    }
  }, [])

  const logout = useCallback(async () => {
    await backend.logout()
  }, [])

  const saveProfile = useCallback(
    async (values) => {
      if (!user) throw new Error('Not signed in')
      const saved = await backend.saveProfile(user.uid, values)
      setProfile(saved)
      return saved
    },
    [user],
  )

  const value = useMemo(
    () => ({
      user,
      profile,
      initializing,
      profileLoading,
      authPending,
      isDemoMode,
      register,
      login,
      loginWithGoogle,
      logout,
      saveProfile,
      refreshProfile,
    }),
    [user, profile, initializing, profileLoading, authPending, register, login, loginWithGoogle, logout, saveProfile, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
