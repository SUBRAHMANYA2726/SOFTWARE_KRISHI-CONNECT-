import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { PageLoader } from '../components/ui/Feedback'

export default function ProtectedRoute({ requireProfile = true }) {
  const { user, profile, initializing, profileLoading, authPending } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  if (initializing || authPending || (user && profileLoading)) {
    return <PageLoader label={t('common.loading')} />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  if (requireProfile && !profile) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
