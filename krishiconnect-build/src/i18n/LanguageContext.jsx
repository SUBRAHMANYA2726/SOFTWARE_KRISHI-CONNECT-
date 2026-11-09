import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'kc.language'

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'kn' || stored === 'en' ? stored : 'en'
  } catch {
    return 'en'
  }
}

function resolve(dictionary, key) {
  return key.split('.').reduce((current, part) => (current && current[part] !== undefined ? current[part] : undefined), dictionary)
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {
      /* storage can be unavailable in private mode */
    }
  }, [language])

  const setLanguage = useCallback((next) => {
    if (next === 'en' || next === 'kn') setLanguageState(next)
  }, [])

  const t = useCallback(
    (key, params = {}) => {
      const value = resolve(translations[language], key) ?? resolve(translations.en, key) ?? key
      if (typeof value !== 'string') return key
      return value.replace(/\{(\w+)\}/g, (match, name) =>
        params[name] !== undefined ? String(params[name]) : match,
      )
    },
    [language],
  )

  const translateError = useCallback(
    (validationError) => {
      if (!validationError) return ''
      if (typeof validationError === 'string') return t(`errors.${validationError}`)
      return t(`errors.${validationError.code}`, validationError.params || {})
    },
    [t],
  )

  const value = useMemo(
    () => ({ language, setLanguage, t, translateError, isKannada: language === 'kn' }),
    [language, setLanguage, t, translateError],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
