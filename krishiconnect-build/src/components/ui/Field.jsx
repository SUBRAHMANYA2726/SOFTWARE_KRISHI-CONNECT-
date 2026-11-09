import { forwardRef, useId } from 'react'
import { useLanguage } from '../../i18n/LanguageContext'
import { cn } from '../../utils/cn'

export function FormField({ id, label, hint, error, required = true, optionalLabel, children, className }) {
  const { t, translateError } = useLanguage()
  const hintId = `${id}-hint`
  return (
    <div className={cn('field', className)}>
      <div className="field-label">
        <label htmlFor={id}>{label}</label>
        {!required && <span className="text-[11px] font-medium uppercase tracking-wide text-muted">{optionalLabel || t('common.optional')}</span>}
      </div>
      {children}
      {hint && !error && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert" data-testid={`error-${id}`} data-error-code={error.code}>
          <svg viewBox="0 0 16 16" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7.25 4.5h1.5v5h-1.5v-5Zm0 6.25h1.5v1.5h-1.5v-1.5Z" />
          </svg>
          <span>{translateError(error)}</span>
        </p>
      )}
    </div>
  )
}

export const TextField = forwardRef(function TextField(
  { id, label, hint, error, required = true, className, wrapperClassName, ...inputProps },
  ref,
) {
  const generatedId = useId()
  const fieldId = id || generatedId
  return (
    <FormField id={fieldId} label={label} hint={hint} error={error} required={required} className={wrapperClassName}>
      <input
        ref={ref}
        id={fieldId}
        className={cn('field-input', className)}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        {...inputProps}
      />
    </FormField>
  )
})

export const SelectField = forwardRef(function SelectField(
  { id, label, hint, error, required = true, className, children, placeholder, ...selectProps },
  ref,
) {
  const generatedId = useId()
  const fieldId = id || generatedId
  return (
    <FormField id={fieldId} label={label} hint={hint} error={error} required={required}>
      <div className="relative">
        <select
          ref={ref}
          id={fieldId}
          className={cn('field-input appearance-none pr-10', className)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...selectProps}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-700"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FormField>
  )
})
