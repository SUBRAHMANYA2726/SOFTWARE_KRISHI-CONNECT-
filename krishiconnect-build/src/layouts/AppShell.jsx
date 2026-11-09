import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { isDemoMode } from '../services/backend'
import LanguageToggle from '../components/i18n/LanguageToggle'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'
import { cn } from '../utils/cn'

const icons = {
  dashboard: 'M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5',
  mandi: 'M4 20V9m5 11V5m5 15v-6m5 6V8',
  calculator: 'M6 3h12v18H6V3Zm2.5 4h7M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01',
  reports: 'M7 3h7l4 4v14H7V3Zm6 1.5V8h3.5M9.5 12h5M9.5 15.5h5',
}

function initials(name, email) {
  const source = (name || email || 'K').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return source.slice(0, 2).toUpperCase()
}

export default function AppShell() {
  const { t } = useLanguage()
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const items = [
    { to: '/dashboard', key: 'common.dashboard', icon: 'dashboard', authOnly: true },
    { to: '/mandi', key: 'common.mandi', icon: 'mandi' },
    { to: '/calculator/profit', key: 'common.calculators', icon: 'calculator' },
    { to: '/reports', key: 'common.reports', icon: 'reports', authOnly: true },
  ].filter((item) => !item.authOnly || user)

  const mobileItems = user
    ? items
    : [
        { to: '/mandi', key: 'common.mandi', icon: 'mandi' },
        { to: '/calculator/profit', key: 'dashboard.profitTitle', icon: 'calculator' },
        { to: '/calculator/fertilizer', key: 'dashboard.fertilizerTitle', icon: 'calculator' },
        { to: '/login', key: 'common.signIn', icon: 'dashboard' },
      ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-ivory/95 backdrop-blur-md">
        <div className="wrap flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="App navigation">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`appnav-${item.icon}`}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-[13px] font-semibold transition',
                    isActive ? 'bg-forest-900 text-ivory' : 'text-forest-900/70 hover:bg-forest-900/5 hover:text-forest-900',
                  )
                }
              >
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle className="hidden sm:inline-flex" />
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-200 text-xs font-bold text-forest-900 transition hover:bg-sage-300"
                  title={profile?.fullName || user.email}
                  data-testid="header-avatar"
                >
                  {initials(profile?.fullName, user.email)}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="header-logout"
                  className="hidden rounded-full border border-forest-900/15 px-4 py-2 text-[13px] font-semibold text-forest-900 transition hover:bg-forest-900/5 sm:inline-flex"
                >
                  {t('common.signOut')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden px-2 text-[13px] font-semibold text-forest-900 sm:block" data-testid="app-signin">
                  {t('common.signIn')}
                </Link>
                <Button to="/register" size="sm" className="hidden sm:inline-flex">
                  {t('common.register')}
                </Button>
              </>
            )}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-forest-900/15 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((value) => !value)}
              data-testid="app-menu-toggle"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-forest-900/10 bg-ivory md:hidden" data-testid="app-mobile-menu">
            <div className="wrap flex flex-col gap-1 py-3">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn('rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-forest-900 text-ivory' : 'text-forest-900 hover:bg-forest-900/5')
                  }
                >
                  {t(item.key)}
                </NavLink>
              ))}
              {user && (
                <>
                  <NavLink to="/settings" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-forest-900 hover:bg-forest-900/5">
                    {t('common.settings')}
                  </NavLink>
                  <button type="button" onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-clay-600 hover:bg-clay-500/5">
                    {t('common.signOut')}
                  </button>
                </>
              )}
              <div className="px-3 pt-3">
                <LanguageToggle />
              </div>
            </div>
          </div>
        )}
      </header>

      {isDemoMode && (
        <div className="border-b border-ochre/20 bg-ochre/[0.07]" data-testid="demo-mode-banner">
          <div className="wrap flex items-start gap-2.5 py-2.5 text-[12px] leading-relaxed text-[#6f4e12]">
            <span className="mt-px font-semibold uppercase tracking-wide">{t('common.demoMode')}</span>
            <span>{t('common.demoBanner')}</span>
          </div>
        </div>
      )}

      <main id="main" className="wrap flex-1 pb-28 pt-7 sm:pt-9 md:pb-14">
        <Outlet />
      </main>

      <footer className="hidden border-t border-forest-900/10 py-6 md:block">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <p>{t('landing.footerNote')}</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-forest-900">{t('common.goHome')}</Link>
            <a href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="hover:text-forest-900">Agmarknet ↗</a>
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-900/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Mobile navigation">
        <div className={cn('grid', mobileItems.length === 4 ? 'grid-cols-4' : 'grid-cols-3')}>
          {mobileItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={`bottomnav-${item.icon}`}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-semibold transition',
                  isActive ? 'text-forest-900' : 'text-muted',
                )
              }
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d={icons[item.icon]} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="max-w-[76px] truncate">{t(item.key)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
