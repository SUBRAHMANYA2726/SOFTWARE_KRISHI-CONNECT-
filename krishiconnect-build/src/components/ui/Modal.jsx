import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'

export default function Modal({ open, onClose, title, description, children, footer, testId, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" data-testid={testId}>
      <div
        className="absolute inset-0 bg-forest-950/45 animate-fade"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${testId}-title`}
        className={cn(
          'relative w-full animate-rise rounded-t-2xl border border-forest-900/10 bg-paper p-6 shadow-panel sm:rounded-2xl sm:p-7',
          size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-lg',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h2 id={`${testId}-title`} className="font-display text-2xl leading-tight text-forest-900">
              {title}
            </h2>
            {description && <p className="text-sm leading-relaxed text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-forest-900/5 hover:text-forest-900"
            aria-label="Close dialog"
            data-testid={`${testId}-close`}
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
