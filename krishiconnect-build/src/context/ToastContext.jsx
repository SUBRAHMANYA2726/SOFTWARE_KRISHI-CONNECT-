import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastContext = createContext(null)
const AUTO_DISMISS_MS = 4500

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (message, tone = 'success') => {
      counter.current += 1
      const id = counter.current
      setToasts((current) => [...current, { id, message, tone }])
      window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ pushToast, dismissToast }), [pushToast, dismissToast])

  const tones = {
    success: 'border-forest-700/25 bg-forest-900 text-ivory',
    error: 'border-clay-500/30 bg-clay-500/[0.08] text-clay-600',
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            data-testid={toast.tone === 'error' ? 'toast-error' : 'toast'}
            className={`pointer-events-auto flex w-full max-w-sm items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-panel animate-rise ${
              tones[toast.tone] || tones.success
            }`}
          >
            <p className="leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={toast.tone === 'error' ? 'Dismiss error' : 'Dismiss notification'}
              data-testid="toast-close"
              className="mt-0.5 shrink-0 rounded-full p-1 opacity-70 transition hover:opacity-100"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
