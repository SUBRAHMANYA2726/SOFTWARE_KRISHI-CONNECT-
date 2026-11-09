import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'btn-primary',
  outline: 'btn-outline',
  light: 'btn-light',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

export default function Button({
  as,
  to,
  variant = 'primary',
  size,
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}) {
  const classes = cn(variants[variant] || variants.primary, size === 'sm' && 'btn-sm', className)
  const content = (
    <>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  const Component = as || 'button'
  return (
    <Component
      className={classes}
      type={Component === 'button' ? type : undefined}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </Component>
  )
}
