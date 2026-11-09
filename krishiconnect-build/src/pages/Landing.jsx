import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import PublicNav from '../layouts/PublicNav'
import Footer from '../layouts/Footer'
import Button from '../components/ui/Button'
import { Badge } from '../components/ui/Feedback'
import { SAMPLE_MANDI_PRICES, SAMPLE_PRICE_DATE } from '../data/mandi'
import { formatINR, formatDate } from '../utils/format'

const boardRows = ['sample-001', 'sample-013', 'sample-021']
  .map((id) => SAMPLE_MANDI_PRICES.find((row) => row.id === id))
  .filter(Boolean)

function FieldLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 900 700" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <g stroke="#9AAB88" strokeOpacity="0.28">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <path
            key={index}
            d={`M-80 ${120 + index * 72} C 180 ${40 + index * 62}, 430 ${210 + index * 40}, 980 ${60 + index * 78}`}
            strokeWidth="1"
          />
        ))}
      </g>
      <g stroke="#B4623F" strokeOpacity="0.14">
        <path d="M120 -40 C 260 180, 210 420, 380 760" strokeWidth="1" />
        <path d="M680 -60 C 540 180, 620 420, 470 760" strokeWidth="1" />
      </g>
    </svg>
  )
}

function FeatureIcon({ type }) {
  if (type === 'mandi') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M5 27V13m7 14V7m7 20v-9m7 9V10" strokeLinecap="round" />
        <path d="M3 27h26" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'profit') {
    return (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <circle cx="16" cy="16" r="11.5" />
        <path d="M20 11.5h-5.5a3 3 0 0 0 0 6h3a3 3 0 0 1 0 6H11M16 8v3m0 11v3" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M16 28c0-8 2.5-13.5 9.5-17C25 19 21.5 24.5 16 28Z" />
      <path d="M16 28c0-8-2.5-13.5-9.5-17C7 19 10.5 24.5 16 28Z" opacity="0.55" />
      <path d="M16 29V16" strokeLinecap="round" />
    </svg>
  )
}

export default function Landing() {
  const { t } = useLanguage()
  const { user } = useAuth()
  useDocumentTitle()

  return (
    <div className="bg-ivory">
      <a href="#main" className="skip-link">Skip to content</a>
      <PublicNav />

      <main id="main">
        <section className="relative overflow-hidden border-b border-forest-900/10">
          <div className="absolute inset-0">
            <FieldLines />
          </div>
          <div className="wrap relative grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow animate-fade">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-clay-500" />
                {t('landing.eyebrow')}
              </p>
              <h1 className="display-xl mt-6 text-balance text-forest-950 animate-rise">{t('landing.heroTitle')}</h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px] animate-rise reveal-2">
                {t('landing.heroBody')}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3 animate-rise reveal-3">
                <Button to={user ? '/dashboard' : '/register'} data-testid="hero-primary">
                  {user ? t('common.dashboard') : t('landing.heroPrimary')}
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
                    <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
                <Button to="/mandi" variant="outline" data-testid="hero-secondary">
                  {t('landing.heroSecondary')}
                </Button>
              </div>
              <p className="mt-5 text-[13px] text-muted animate-rise reveal-3">{t('landing.heroNote')}</p>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-forest-900/15 pt-6 animate-rise reveal-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{t('landing.statsDistricts')}</dt>
                  <dd className="mt-1 font-display text-2xl text-forest-900">30</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{t('landing.statsLanguages')}</dt>
                  <dd className="mt-1 font-display text-2xl text-forest-900">EN Â· à²•</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{t('landing.statsTools')}</dt>
                  <dd className="mt-1 font-display text-2xl text-forest-900">03</dd>
                </div>
              </dl>
            </div>

            <div className="relative animate-rise reveal-2">
              <div className="absolute -inset-4 rounded-[28px] border border-forest-900/[0.07]" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-2xl border border-forest-900/15 bg-paper shadow-panel">
                <div className="flex items-start justify-between gap-4 border-b border-forest-900/10 px-5 py-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-forest-600">{t('landing.boardTitle')}</p>
                    <h2 className="mt-1 font-display text-xl text-forest-900">{t('landing.boardSubtitle')}</h2>
                  </div>
                  <Badge tone="ochre">{t('common.sampleData')}</Badge>
                </div>

                <div className="divide-y divide-forest-900/[0.07]">
                  {boardRows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-forest-900">{row.crop}</p>
                        <p className="mt-0.5 truncate text-xs text-muted">{row.market} Â· {row.district}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-forest-900">{formatINR(row.modalPrice)}</p>
                        <p className="text-[10px] text-muted">{formatINR(row.minPrice)} â€“ {formatINR(row.maxPrice)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-forest-900/10 bg-sage-50/70 px-5 py-3">
                  <p className="text-[11px] leading-snug text-muted">{t('landing.boardNote')}</p>
                  <Link to="/mandi" className="shrink-0 text-[11px] font-semibold text-forest-800 underline decoration-forest-800/30 underline-offset-4 hover:decoration-forest-800">
                    {t('landing.peek')} â†’
                  </Link>
                </div>
              </div>
              <p className="mt-4 text-right text-[11px] uppercase tracking-[0.14em] text-muted">
                {t('mandi.updated')} Â· {formatDate(SAMPLE_PRICE_DATE)}
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-b border-forest-900/10 py-16 sm:py-20">
          <div className="wrap">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="eyebrow">{t('landing.featuresEyebrow')}</p>
                <h2 className="display-lg mt-4 text-forest-950 text-balance">{t('landing.featuresTitle')}</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted">{t('landing.featuresBody')}</p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                {
                  n: '01',
                  type: 'mandi',
                  title: t('landing.feature1Title'),
                  body: t('landing.feature1Body'),
                  link: t('landing.feature1Link'),
                  to: '/mandi',
                  tag: t('landing.featureTagData'),
                },
                {
                  n: '02',
                  type: 'profit',
                  title: t('landing.feature2Title'),
                  body: t('landing.feature2Body'),
                  link: t('landing.feature2Link'),
                  to: '/calculator/profit',
                  tag: t('landing.featureTagMath'),
                },
                {
                  n: '03',
                  type: 'fertilizer',
                  title: t('landing.feature3Title'),
                  body: t('landing.feature3Body'),
                  link: t('landing.feature3Link'),
                  to: '/calculator/fertilizer',
                  tag: t('landing.featureTagAssumptions'),
                },
              ].map((feature) => (
                <Link
                  key={feature.n}
                  to={feature.to}
                  className="group relative flex flex-col rounded-2xl border border-forest-900/10 bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-forest-900/25 hover:shadow-lift"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage-100 text-forest-700">
                      <FeatureIcon type={feature.type} />
                    </span>
                    <span className="font-display text-sm text-muted/60">{feature.n}</span>
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-forest-900">{feature.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{feature.body}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-forest-900/10 pt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-forest-600">{feature.tag}</span>
                    <span className="flex items-center gap-1.5 text-[13px] font-semibold text-forest-900">
                      {feature.link}
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" aria-hidden="true">
                        <path d="M3 8h10m0 0L9 4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden bg-forest-900 py-16 text-ivory sm:py-20">
          <div className="grain absolute inset-0" aria-hidden="true" />
          <div className="wrap relative">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="eyebrow-light">{t('landing.howEyebrow')}</p>
                <h2 className="display-lg mt-4 text-ivory text-balance">{t('landing.howTitle')}</h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-sage-200/80">{t('landing.how2Body')}</p>
              </div>

              <ol className="space-y-0">
                {[
                  { n: '01', title: t('landing.how1Title'), body: t('landing.how1Body') },
                  { n: '02', title: t('landing.how2Title'), body: t('landing.heroNote') },
                  { n: '03', title: t('landing.how3Title'), body: t('landing.how3Body') },
                ].map((step) => (
                  <li key={step.n} className="group grid grid-cols-[auto_1fr] gap-5 border-t border-ivory/15 py-6 first:border-t-0 first:pt-0">
                    <span className="font-display text-sm text-sage-300/70">{step.n}</span>
                    <div>
                      <h3 className="font-display text-xl text-ivory">{step.title}</h3>
                      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-sage-200/70">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="why" className="scroll-mt-24 border-b border-forest-900/10 py-16 sm:py-20">
          <div className="wrap grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl border border-forest-900/10 bg-sage-100 p-8 sm:p-10">
                <svg viewBox="0 0 400 320" className="h-auto w-full" fill="none" aria-hidden="true">
                  <rect width="400" height="320" fill="#EDF1E6" />
                  <path d="M0 250 C 80 210, 140 265, 220 225 S 340 215, 400 240 V320 H0Z" fill="#D6DECB" />
                  <path d="M0 275 C 90 240, 160 290, 240 255 S 350 245, 400 268 V320 H0Z" fill="#BAC7AC" />
                  <g stroke="#617352" strokeOpacity="0.4" strokeWidth="1">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <path key={i} d={`M-20 ${225 + i * 14} C 80 ${190 + i * 13}, 170 ${255 + i * 10}, 420 ${205 + i * 12}`} />
                    ))}
                  </g>
                  <circle cx="300" cy="95" r="46" fill="#C08A2E" fillOpacity="0.18" />
                  <circle cx="300" cy="95" r="30" fill="#C08A2E" fillOpacity="0.25" />
                  <g transform="translate(120 118)">
                    <path d="M60 100c0-52 20-88 62-108-3 51-24 88-62 108Z" fill="#2C5738" />
                    <path d="M60 100C60 48 40 12-2-8c3 51 24 88 62 108Z" fill="#5F8B67" />
                    <path d="M60 103V42" stroke="#11281A" strokeWidth="3" strokeLinecap="round" />
                  </g>
                  <text x="34" y="48" fill="#617352" fontSize="10" letterSpacing="3" fontFamily="Inter, sans-serif">KARNATAKA Â· 2026</text>
                </svg>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 rounded-xl border border-forest-900/10 bg-paper/95 px-4 py-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted">{t('dashboard.season')}</p>
                    <p className="font-display text-lg text-forest-900">Kharif Â· 2026</p>
                  </div>
                  <Badge tone="sage">â‚¹ Â· qt Â· acre</Badge>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="eyebrow">{t('landing.whyEyebrow')}</p>
              <h2 className="display-lg mt-4 text-forest-950 text-balance">{t('landing.whyTitle')}</h2>
              <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">{t('landing.whyBody')}</p>
              <ul className="mt-8 space-y-4">
                {[t('landing.whyPoint1'), t('landing.whyPoint2'), t('landing.whyPoint3'), t('landing.whyPoint4')].map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-relaxed text-forest-900">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-900 text-ivory">
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                        <path d="m4 8.5 2.5 2.5L12 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="wrap">
            <div className="relative overflow-hidden rounded-3xl border border-forest-900/10 bg-paper px-6 py-12 sm:px-12 sm:py-16">
              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sage-100/70" aria-hidden="true" />
              <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full border border-clay-500/10" aria-hidden="true" />
              <div className="relative max-w-2xl">
                <p className="eyebrow">{t('landing.ctaEyebrow')}</p>
                <h2 className="display-lg mt-4 text-forest-950 text-balance">{t('landing.ctaTitle')}</h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">{t('landing.ctaBody')}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button to={user ? '/dashboard' : '/register'} data-testid="cta-register">
                    {user ? t('common.dashboard') : t('landing.ctaButton')}
                  </Button>
                  <Button to="/login" variant="outline">
                    {t('common.signIn')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
