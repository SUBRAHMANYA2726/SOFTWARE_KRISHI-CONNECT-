import { cn } from '../../utils/cn'

const tones = {
  info: 'border-forest-900/15 bg-sage-50 text-forest-900',
  success: 'border-forest-500/25 bg-forest-50 text-forest-800',
  warning: 'border-ochre/30 bg-ochre/[0.09] text-[#6f4e12]',
  error: 'border-clay-500/30 bg-clay-500/[0.07] text-clay-600',
}

const icons = {
  info: 'M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v1.5h-1.5v-1.5h1.5Zm0 2.75v5h-1.5v-5h1.5Z',
  success: 'M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.28-8.78-4 4a.75.75 0 0 1-1.06 0L4.22 8.22l1.06-1.06L7 8.88l3.47-3.47 1.06 1.06Z',
  warning: 'M8 1.5 15 14H1L8 1.5Zm-.75 4.25v4h1.5v-4h-1.5Zm0 5.25v1.5h1.5V11h-1.5Z',
  error: 'M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM7.25 4.5h1.5v4.25h-1.5V4.5Zm0 5.5h1.5v1.5h-1.5V10Z',
}

export default function Alert({ tone = 'info', title, children, className, ...rest }) {
  return (
    <div
      className={cn('flex gap-3 rounded-xl border px-4 py-3.5 text-sm leading-relaxed', tones[tone], className)}
      role={tone === 'error' ? 'alert' : 'status'}
      {...rest}
    >
      <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
        <path d={icons[tone] || icons.info} />
      </svg>
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-[13px] leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
