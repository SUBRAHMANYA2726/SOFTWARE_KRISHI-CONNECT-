import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
  return null
}

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · KrishiConnect` : 'KrishiConnect — Farm intelligence for Karnataka'
  }, [title])
}
