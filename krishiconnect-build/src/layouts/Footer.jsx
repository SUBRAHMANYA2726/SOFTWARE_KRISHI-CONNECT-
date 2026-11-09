import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { siteConfig } from '../config/site'
import Logo from '../components/ui/Logo'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-forest-950 text-ivory">
      <div className="wrap py-14 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div className="space-y-4">
            <Logo light />
            <p className="max-w-xs text-sm leading-relaxed text-sage-200/80">{t('landing.footerNote')}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-sage-300/70">{t('landing.builtIn')}</p>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-300">{t('landing.footerProduct')}</h3>
            <ul className="space-y-2.5 text-sm text-ivory/80">
              <li><Link to="/mandi" className="transition hover:text-ivory">{t('common.mandi')}</Link></li>
              <li><Link to="/calculator/profit" className="transition hover:text-ivory">{t('dashboard.profitTitle')}</Link></li>
              <li><Link to="/calculator/fertilizer" className="transition hover:text-ivory">{t('dashboard.fertilizerTitle')}</Link></li>
              <li><Link to="/reports" className="transition hover:text-ivory">{t('common.reports')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-300">{t('landing.footerTrust')}</h3>
            <ul className="space-y-2.5 text-sm text-ivory/80">
              <li>
                <a href={siteConfig.agmarknetUrl} target="_blank" rel="noreferrer" className="transition hover:text-ivory">
                  Agmarknet ↗
                </a>
              </li>
              <li>
                <a href={siteConfig.dataGovUrl} target="_blank" rel="noreferrer" className="transition hover:text-ivory">
                  data.gov.in ↗
                </a>
              </li>
              <li><Link to="/#data-disclaimer" className="transition hover:text-ivory">{t('landing.footerDisclaimer')}</Link></li>
              <li><Link to="/register" className="transition hover:text-ivory">{t('common.register')}</Link></li>
            </ul>
          </div>

          <div id="data-disclaimer" className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-300">{t('landing.contact')}</h3>
            <p className="text-sm text-ivory/80">{siteConfig.location}</p>
            <a href={`mailto:${siteConfig.contactEmail}`} className="block break-all text-sm text-sage-200 underline decoration-sage-200/30 underline-offset-4 hover:text-ivory">
              {siteConfig.contactEmail}
            </a>
            <p className="text-xs leading-relaxed text-sage-200/60">{t('landing.footerDisclaimerBody')}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ivory/10 pt-6 text-xs text-sage-200/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} KrishiConnect · {t('landing.rights')}</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sage-300" />
            INR · English · ಕನ್ನಡ
          </p>
        </div>
      </div>
    </footer>
  )
}
