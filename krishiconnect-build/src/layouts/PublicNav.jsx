import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/i18n/LanguageToggle'
import Logo from '../components/ui/Logo'
import Button from '../components/ui/Button'

const links = [
  { to: '/#features', labelKey: 'nav.features' },
  { to: '/#how-it-works', labelKey: 'nav.howItWorks' },
  { to: '/#why', labelKey: 'nav.about' },
]

export default function PublicNav() {
  const { t } = useLanguage()
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  return (
    <header className="sticky top-0 z-40 border-b border-forest-900/10 bg-ivory/90 backdrop-blur-md">
      <nav className="wrap flex h-[72px] items-center justify-between gap-6" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {t(link.labelKey)}
            </Link>
          ))}
          <NavLink to="/mandi" className="nav-link">
            {t('nav.mandi')}
          </NavLink>
          <NavLink to="/calculator/profit" className="nav-link">
            {t('nav.calculators')}
          </NavLink>
        </div>

        <div className="flex items-center gap-2.5">
          <LanguageToggle className="hidden sm:inline-flex" />
          {user ? (
            <Button to="/dashboard" size="sm" data-testid="nav-dashboard">
              {profile?.fullName?.split(' ')[0] || t('common.dashboard')}
            </Button>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-semibold text-forest-900 hover:underline sm:block" data-testid="nav-signin">
                {t('common.signIn')}
              </Link>
              <Button to="/register" size="sm" className="hidden sm:inline-flex" data-testid="nav-register">
                {t('common.getStarted')}
              </Button>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-forest-900/15 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-testid="nav-mobile-toggle"
          >
            {open ? (
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-forest-900/10 bg-ivory lg:hidden" data-testid="mobile-menu">
          <div className="wrap flex flex-col gap-1 py-4">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-lg px-2 py-3 text-sm font-medium text-forest-900 hover:bg-forest-900/5">
                {t(link.labelKey)}
              </Link>
            ))}
            <Link to="/mandi" className="rounded-lg px-2 py-3 text-sm font-medium text-forest-900 hover:bg-forest-900/5">
              {t('common.mandi')}
            </Link>
            <Link to="/calculator/profit" className="rounded-lg px-2 py-3 text-sm font-medium text-forest-900 hover:bg-forest-900/5">
              {t('common.calculators')}
            </Link>
            <div className="my-2 rule" />
            <div className="flex items-center justify-between gap-3 px-2">
              <LanguageToggle />
              {user ? (
                <Button to="/dashboard" size="sm">
                  {t('common.dashboard')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button to="/login" variant="outline" size="sm">
                    {t('common.signIn')}
                  </Button>
                  <Button to="/register" size="sm">
                    {t('common.getStarted')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
