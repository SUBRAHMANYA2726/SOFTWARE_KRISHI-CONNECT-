import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import LanguageToggle from '../components/i18n/LanguageToggle'
import Logo from '../components/ui/Logo'

export default function AuthLayout({ sideTitle, sideBody, children, eyebrow }) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative hidden overflow-hidden bg-forest-900 px-14 py-12 text-ivory lg:flex lg:flex-col">
        <div className="grain absolute inset-0" aria-hidden="true" />
        <div
          className="absolute -right-40 bottom-[-18%] h-[620px] w-[620px] rounded-full border border-sage-300/15"
          aria-hidden="true"
        />
        <div
          className="absolute -right-24 bottom-[-6%] h-[420px] w-[420px] rounded-full border border-sage-300/10"
          aria-hidden="true"
        />
        <div className="relative">
          <Logo light />
        </div>

        <div className="relative mt-auto max-w-md">
          <p className="eyebrow-light mb-5">{eyebrow || t('landing.eyebrow')}</p>
          <h2 className="font-display text-[2.7rem] leading-[1.08] text-ivory text-balance">{sideTitle}</h2>
          <p className="mt-6 text-[15px] leading-relaxed text-sage-200/85">{sideBody}</p>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ivory/15 pt-6">
            <div>
              <p className="font-display text-2xl">30</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-sage-300/80">{t('landing.statsDistricts')}</p>
            </div>
            <div>
              <p className="font-display text-2xl">₹</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-sage-300/80">INR</p>
            </div>
            <div>
              <p className="font-display text-2xl">2</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-sage-300/80">{t('common.language')}</p>
            </div>
          </div>
        </div>

        <p className="relative mt-12 text-xs leading-relaxed text-sage-300/50">
          {t('landing.footerNote')}
        </p>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-5 py-5 sm:px-10">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-forest-900/70 transition hover:text-forest-900">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                <path d="M13 8H3m0 0 4-4M3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t('common.goHome')}
            </Link>
          </div>
          <LanguageToggle />
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-14 sm:px-10">
          <div className="w-full max-w-[430px] animate-rise">{children}</div>
        </main>

        <footer className="px-5 pb-6 text-center text-xs text-muted sm:px-10">
          <p>{t('landing.rights')}</p>
        </footer>
      </div>
    </div>
  )
}
