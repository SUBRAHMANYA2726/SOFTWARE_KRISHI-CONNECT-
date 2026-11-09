import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import Logo from '../components/ui/Logo'
import LanguageToggle from '../components/i18n/LanguageToggle'
import ProfileForm from '../components/profile/ProfileForm'
import Button from '../components/ui/Button'
import { useToast } from '../context/ToastContext'

export default function Onboarding() {
  const { t } = useLanguage()
  const { user, profile, saveProfile, logout } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  useDocumentTitle(t('onboarding.eyebrow'))

  if (profile) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (values) => {
    setBusy(true)
    try {
      await saveProfile({ ...values, email: user?.email || '' })
      pushToast(t('onboarding.success'))
      navigate('/dashboard', { replace: true })
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = () => {
    logout()
      .then(() => navigate('/', { replace: true }))
      .catch(() => pushToast(t('errors.UNKNOWN'), 'error'))
  }

  return (
    <div className="min-h-screen bg-ivory">
      <header className="border-b border-forest-900/10">
        <div className="wrap flex h-[72px] items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden text-sm font-medium text-forest-900/70 hover:text-forest-900 sm:block"
              data-testid="onboarding-signout"
            >
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </header>

      <main className="wrap py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <aside className="lg:sticky lg:top-10 lg:self-start">
            <p className="eyebrow">{t('onboarding.eyebrow')}</p>
            <h1 className="display-lg mt-4 text-forest-950 text-balance">{t('onboarding.title')}</h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{t('onboarding.body')}</p>

            <div className="mt-8 hidden rounded-2xl border border-forest-900/10 bg-sage-50 p-6 lg:block">
              <p className="font-display text-xl text-forest-900">{t('onboarding.sideTitle')}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t('onboarding.sideBody')}</p>
              <div className="mt-6 space-y-3 border-t border-forest-900/10 pt-5">
                {[
                  ['01', t('dashboard.district'), t('dashboard.mandiSubtitle')],
                  ['02', t('dashboard.farmArea'), t('onboarding.farmAreaHint')],
                  ['03', t('dashboard.crops'), t('onboarding.primaryCropsHint')],
                ].map(([step, label, hint]) => (
                  <div key={step} className="flex gap-3">
                    <span className="font-display text-xs text-forest-500">{step}</span>
                    <div>
                      <p className="text-[13px] font-semibold text-forest-900">{label}</p>
                      <p className="text-xs leading-relaxed text-muted">{hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-muted">{t('landing.footerDisclaimerBody')}</p>
          </aside>

          <section className="card-pad animate-rise">
            <div className="mb-6 flex items-center justify-between border-b border-forest-900/10 pb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-600">{t('onboarding.stepLabel')}</p>
                <p className="mt-1 text-sm text-muted">{user?.email}</p>
              </div>
              <span className="badge-sage">1 / 1</span>
            </div>

            <ProfileForm onSubmit={handleSubmit} busy={busy} submitLabel={t('onboarding.submit')} testPrefix="onboarding" />
          </section>
        </div>

        <div className="mt-10 flex justify-center">
          <Button to="/" variant="ghost" size="sm">{t('common.goHome')}</Button>
        </div>
      </main>
    </div>
  )
}
