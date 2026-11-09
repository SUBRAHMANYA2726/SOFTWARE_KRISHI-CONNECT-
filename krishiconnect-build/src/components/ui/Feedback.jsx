import { cn } from '../../utils/cn'

export function Spinner({ className, label = 'Loading' }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-forest-700', className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function PageLoader({ label }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3" data-testid="page-loader">
      <Spinner className="h-7 w-7" label={label} />
      <p className="text-sm text-muted">{label || 'Loading…'}</p>
    </div>
  )
}

export function EmptyState({ icon, title, body, action, className, testId }) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-sage-50/60 px-6 py-12 text-center', className)}
      data-testid={testId}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest-900/[0.06] text-forest-700">
        {icon || (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 19V9m5 10V5m5 14v-7m5 7V8" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <h3 className="font-display text-xl text-forest-900">{title}</h3>
      {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Badge({ children, tone = 'sage', className, ...rest }) {
  const tones = {
    sage: 'badge-sage',
    clay: 'badge-clay',
    forest: 'badge-forest',
    ochre: 'badge-ochre',
  }
  return <span className={cn(tones[tone], className)} {...rest}>{children}</span>
}

export function Stat({ label, value, hint, accent = false }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn('font-display text-2xl leading-tight', accent ? 'text-clay-600' : 'text-forest-900')}>{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}
