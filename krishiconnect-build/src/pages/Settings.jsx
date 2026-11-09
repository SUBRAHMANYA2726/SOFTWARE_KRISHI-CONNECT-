import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import ProfileForm from '../components/profile/ProfileForm'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Modal from '../components/ui/Modal'
import LanguageToggle from '../components/i18n/LanguageToggle'
import { formatDate } from '../utils/format'
import { useToast } from '../context/ToastContext'

export default function Settings() {
  const { t, language } = useLanguage()
  const { user, profile, saveProfile, logout, isDemoMode } = useAuth()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  useDocumentTitle(t('common.settings'))

  const [busy, setBusy] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const handleProfileSave = async (values) => {
    setBusy(true)
    try {
      await saveProfile({ ...values, email: user?.email || '' })
      pushToast(t('settings.profileSaved'))
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleSignOut = async () => {
    setConfirmSignOut(false)
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
    }
  }

  const providerLabel = t('settings.providerPassword')

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('settings.eyebrow')}</p>
        <h1 className="display-lg mt-3 text-forest-950 text-balance" data-testid="settings-heading">{t('settings.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('settings.body')}</p>
      </header>

      {isDemoMode && (
        <Alert tone="info" data-testid="settings-demo-notice">
          {t('settings.demoNotice')}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section className="card-pad">
          <div className="flex items-start justify-between gap-3 border-b border-forest-900/10 pb-4">
            <div>
              <h2 className="font-display text-xl text-forest-900">{t('settings.profileTitle')}</h2>
              <p className="mt-1 text-sm text-muted">{t('settings.profileBody')}</p>
            </div>
          </div>

          <div className="mt-5">
            <ProfileForm
              initialValues={profile || {}}
              onSubmit={handleProfileSave}
              busy={busy}
              submitLabel={t('settings.saveProfile')}
              testPrefix="settings"
              showLanguage={false}
            />
          </div>
        </section>

        <div className="space-y-4">
          <section className="card px-5 py-4 sm:px-6">
            <h2 className="font-display text-xl text-forest-900">{t('settings.accountTitle')}</h2>
            <p className="mt-1 text-sm text-muted">{t('settings.accountBody')}</p>
            <dl className="mt-4 space-y-3" data-testid="settings-account">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('settings.email')}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-forest-900 break-all" data-testid="settings-email">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('settings.provider')}</dt>
                <dd className="mt-0.5 text-sm text-forest-900">{providerLabel}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('settings.memberSince')}</dt>
                <dd className="mt-0.5 text-sm text-forest-900">{formatDate(user?.createdAt || profile?.createdAt, language === 'kn' ? 'kn-IN' : 'en-IN')}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{t('settings.uid')}</dt>
                <dd className="mt-0.5 font-mono text-xs text-forest-900 break-all" data-testid="settings-uid">{user?.uid}</dd>
              </div>
            </dl>
          </section>

          <section className="card px-5 py-4 sm:px-6">
            <h2 className="font-display text-xl text-forest-900">{t('settings.preferencesTitle')}</h2>
            <p className="mt-1 text-sm text-muted">{t('settings.preferencesBody')}</p>
            <div className="mt-3" data-testid="settings-language">
              <LanguageToggle onChange={() => pushToast(t('settings.languageSaved'))} />
            </div>
          </section>

          <section className="card px-5 py-4 sm:px-6">
            <h2 className="font-display text-xl text-forest-900">{t('settings.signOutTitle')}</h2>
            <p className="mt-1 text-sm text-muted">{t('settings.signOutBody')}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setConfirmSignOut(true)} data-testid="settings-logout">
              {t('common.signOut')}
            </Button>
          </section>
        </div>
      </div>

      <Modal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title={t('settings.signOutTitle')}
        description={t('settings.signOutBody')}
        testId="signout-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmSignOut(false)} data-testid="signout-cancel">
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleSignOut} data-testid="signout-confirm">
              {t('common.signOut')}
            </Button>
          </>
        }
      />
    </div>
  )
}
