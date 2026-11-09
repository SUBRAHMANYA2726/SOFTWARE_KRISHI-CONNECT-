import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import AuthLayout from '../layouts/AuthLayout'
import { TextField } from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { validateLogin } from '../validation/auth'

export default function Login() {
  const { t, translateError } = useLanguage()
  const { user, initializing, login, loginWithGoogle, isDemoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'
  useDocumentTitle(t('common.signIn'))

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleBusy, setGoogleBusy] = useState(false)

  if (!initializing && user) {
    return <Navigate to={from} replace />
  }

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setServerError(null)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const result = validateLogin(form)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setSubmitting(true)
    setServerError(null)
    try {
      await login(result.values)
      navigate(from, { replace: true })
    } catch (error) {
      setServerError(error)
    } finally {
      setSubmitting(false)
    }
  }

  const onGoogle = async () => {
    setGoogleBusy(true)
    setServerError(null)
    try {
      await loginWithGoogle()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error)
    } finally {
      setGoogleBusy(false)
    }
  }

  return (
    <AuthLayout
      eyebrow={t('landing.eyebrow')}
      sideTitle={t('auth.signInSideTitle')}
      sideBody={t('auth.signInSideBody')}
    >
      <div className="space-y-2">
        <p className="eyebrow">{t('common.signIn')}</p>
        <h1 className="font-display text-[2.1rem] leading-tight text-forest-950">{t('auth.signInTitle')}</h1>
        <p className="text-sm leading-relaxed text-muted">{t('auth.signInBody')}</p>
      </div>

      {isDemoMode && (
        <div className="mt-5">
          <Alert tone="warning" data-testid="login-demo-notice">
            {t('auth.demoNotice')}
          </Alert>
        </div>
      )}

      {serverError && (
        <div className="mt-5">
          <Alert tone="error" data-testid="auth-error">
            {translateError(serverError.code ? { code: serverError.code, params: serverError.params } : 'AUTH_GENERIC')}
          </Alert>
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate data-testid="login-form">
        <TextField
          id="email"
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={update('email')}
          error={errors.email}
          data-testid="login-email"
        />

        <div>
          <TextField
            id="password"
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('auth.passwordPlaceholder')}
            value={form.password}
            onChange={update('password')}
            error={errors.password}
            data-testid="login-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="mt-2 text-xs font-semibold text-forest-700 hover:underline"
            data-testid="toggle-password"
          >
            {showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
          </button>
        </div>

        <Button type="submit" className="w-full" loading={submitting} data-testid="login-submit">
          {t('auth.signInCta')}
        </Button>
      </form>

      {!isDemoMode && (
        <>
          <div className="mt-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-forest-900/10" />
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">{t('auth.or')}</span>
            <span className="h-px flex-1 bg-forest-900/10" />
          </div>

          <Button
            variant="outline"
            className="mt-5 w-full"
            onClick={onGoogle}
            disabled={isDemoMode}
            loading={googleBusy}
            data-testid="google-signin"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z" />
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24Z" />
              <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
              <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8L20 3.2A12 12 0 0 0 1.4 6.7l4 3.1A7 7 0 0 1 12 4.8Z" />
            </svg>
            {t('auth.google')}
          </Button>
        </>
      )}

      <p className="mt-5 text-center text-sm text-muted">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-forest-900 underline decoration-forest-900/30 underline-offset-4 hover:decoration-forest-900">
          {t('auth.createOne')}
        </Link>
      </p>
    </AuthLayout>
  )
}
