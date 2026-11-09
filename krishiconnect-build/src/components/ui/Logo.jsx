import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

export default function Logo({ to = '/', light = false, compact = false, className }) {
  const content = (
    <>
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          light ? 'bg-ivory/10 text-ivory' : 'bg-forest-900 text-ivory',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M12 20c0-6 2.4-10.4 7.5-13-.4 6.2-2.9 10.6-7.5 13Z" fill="currentColor" opacity="0.9" />
          <path d="M12 20c0-6-2.4-10.4-7.5-13 .4 6.2 2.9 10.6 7.5 13Z" fill="currentColor" opacity="0.55" />
          <path d="M12 21V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && (
        <span className={cn('font-display text-[22px] leading-none tracking-tight', light ? 'text-ivory' : 'text-forest-900')}>
          Krishi<span className={light ? 'text-sage-300' : 'text-forest-600'}>Connect</span>
        </span>
      )}
    </>
  )

  if (!to) return <span className={cn('inline-flex items-center gap-2.5', className)}>{content}</span>

  return (
    <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="KrishiConnect home" data-testid="brand-link">
      {content}
    </Link>
  )
}
