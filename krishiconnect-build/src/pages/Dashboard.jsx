import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { backend } from '../services/backend'
import { fetchMandiPrices } from '../services/mandiService'
import { formatDate, formatINR, formatNumber } from '../utils/format'
import Button from '../components/ui/Button'
import { Badge, EmptyState, Spinner, Stat } from '../components/ui/Feedback'

const statusTone = { PROFIT: 'sage', LOSS: 'clay', BREAK_EVEN: 'ochre' }

export default function Dashboard() {
  const { t, language } = useLanguage()
  const { user, profile } = useAuth()
  useDocumentTitle(t('common.dashboard'))

  const [reports, setReports] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!user) return undefined
    Promise.all([backend.listReports(user.uid), fetchMandiPrices()])
      .then(([savedReports, priceData]) => {
        if (!active) return
        setReports(savedReports)
        const districtRows = priceData.rows.filter((row) => row.district === profile?.district)
        setRows(districtRows.length ? districtRows : priceData.rows)
      })
      .catch(() => {
        if (active) {
          setReports([])
          setRows([])
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user, profile?.district])

  const firstName = (profile?.fullName || '').trim().split(/\s+/)[0]
  const locale = language === 'kn' ? 'kn-IN' : 'en-IN'
  const today = formatDate(new Date(), locale)
  const averagePrice = rows.length
    ? Math.round(rows.reduce((total, row) => total + row.modalPrice, 0) / rows.length)
    : 0

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">{t('common.dashboard')} · {today}</p>
          <h1 className="display-lg mt-3 text-forest-950" data-testid="dashboard-heading">
            {t('dashboard.greeting', { name: firstName || t('dashboard.fallbackName') })}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {t('dashboard.subtitle')} {profile?.district} · {profile?.taluk}.
          </p>
        </div>
        <Button to="/settings" variant="outline" size="sm">{t('dashboard.editProfile')}</Button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <section className="panel-dark relative overflow-hidden p-6 sm:p-8" data-testid="dashboard-profile">
          <div className="grain absolute inset-0" aria-hidden="true" />
          <svg className="absolute -right-6 -top-8 h-48 w-48 text-sage-300/10" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M50 95c0-40 15-70 45-85-2 40-17 70-45 85Z" fill="currentColor" />
            <path d="M50 95C50 55 35 25 5 10c2 40 17 70 45 85Z" fill="currentColor" />
          </svg>
          <div className="relative">
            <p className="eyebrow-light">{t('dashboard.profileTitle')}</p>
            <h2 className="mt-3 font-display text-3xl text-ivory">{profile?.fullName}</h2>
            <p className="mt-1 text-sm text-sage-200/80">{profile?.district} · {profile?.taluk}{profile?.village ? ` · ${profile.village}` : ''}</p>

            <div className="mt-7 grid grid-cols-2 gap-5 border-t border-ivory/15 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-300/70">{t('dashboard.farmArea')}</p>
                <p className="mt-1 font-display text-xl text-ivory">{formatNumber(profile?.farmArea)} <span className="font-sans text-xs text-sage-200/70">{t('common.acres')}</span></p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-300/70">{t('dashboard.irrigation')}</p>
                <p className="mt-1 text-sm text-ivory">{profile?.irrigation}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sage-300/70">{t('dashboard.crops')}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(profile?.primaryCrops || []).map((crop) => (
                    <span key={crop} className="rounded-full border border-ivory/20 px-2.5 py-1 text-[11px] text-sage-100">{crop}</span>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/settings"
              className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-sage-200 underline decoration-sage-200/30 underline-offset-4 hover:text-ivory"
            >
              {t('dashboard.editProfile')} →
            </Link>
          </div>
        </section>

        <section className="card-pad">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{t('dashboard.quickStart')}</p>
            <Badge tone="sage">{t('dashboard.season')} · Kharif</Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Stat label={t('dashboard.farmArea')} value={`${formatNumber(profile?.farmArea)} ac`} />
            <Stat label={t('dashboard.statsCrops')} value={String(profile?.primaryCrops?.length || 0)} />
            <Stat label={t('dashboard.statsReports')} value={String(reports.length)} />
            <Stat label={t('dashboard.statsYield')} value={averagePrice ? formatINR(averagePrice) : '—'} hint={t('common.sampleData')} />
          </div>
          <div className="mt-6 grid gap-2">
            <Button to="/calculator/profit" size="sm" className="w-full">{t('dashboard.profitTitle')}</Button>
            <Button to="/calculator/fertilizer" variant="outline" size="sm" className="w-full">{t('dashboard.fertilizerTitle')}</Button>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <section className="card overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-forest-900/10 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-xl text-forest-900">{t('dashboard.mandiTitle')}</h2>
              <p className="mt-0.5 text-xs text-muted">{profile?.district} · {t('dashboard.mandiSubtitle')}</p>
            </div>
            <Badge tone="ochre">{t('common.sampleData')}</Badge>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 px-6 py-8 text-sm text-muted"><Spinner className="h-4 w-4" /> {t('common.loading')}</div>
          ) : rows.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted">{t('dashboard.mandiEmpty')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-editorial">
                <thead>
                  <tr>
                    <th>{t('mandi.tableCrop')}</th>
                    <th>{t('mandi.tableMarket')}</th>
                    <th className="text-right">{t('mandi.tableModal')}</th>
                    <th className="text-right">{t('mandi.tableDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 4).map((row) => (
                    <tr key={row.id} data-testid="dashboard-mandi-row">
                      <td className="font-semibold text-forest-900">{language === 'kn' ? row.cropKn : row.crop}</td>
                      <td className="text-muted">{row.market}</td>
                      <td className="text-right font-semibold text-forest-900">{formatINR(row.modalPrice)}</td>
                      <td className="text-right text-xs text-muted">{formatDate(row.date, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-forest-900/10 px-5 py-3">
            <p className="text-[11px] text-muted">{t('mandi.unitNote')}</p>
            <Link to="/mandi" className="text-xs font-semibold text-forest-800 hover:underline">{t('dashboard.mandiCta')} →</Link>
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-forest-900">{t('dashboard.reportsTitle')}</h2>
            {reports.length > 0 && <Link to="/reports" className="text-xs font-semibold text-forest-800 hover:underline">{t('common.viewAll')}</Link>}
          </div>

          {loading ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted"><Spinner className="h-4 w-4" /> {t('common.loading')}</div>
          ) : reports.length === 0 ? (
            <div className="mt-4" data-testid="dashboard-reports-empty">
              <EmptyState
                title={t('dashboard.reportsEmpty')}
                body={t('dashboard.reportsEmptyBody')}
                action={<Button to="/calculator/profit" size="sm">{t('dashboard.openCalculator')}</Button>}
                className="border-0 bg-transparent px-2 py-6"
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-forest-900/[0.07]">
              {reports.slice(0, 3).map((report) => {
                const status = report.type === 'profit' ? report.result?.status : null
                return (
                  <li key={report.id}>
                    <Link to={`/reports/${report.id}`} className="flex items-center justify-between gap-3 py-3.5 transition hover:opacity-80" data-testid="dashboard-report-link">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-forest-900">{report.name}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {report.type === 'profit' ? t('reports.typeProfit') : t('reports.typeFertilizer')} · {formatDate(report.createdAt, locale)}
                        </p>
                      </div>
                      {status ? (
                        <Badge tone={statusTone[status]}>{t(`profit.status${status === 'BREAK_EVEN' ? 'BreakEven' : status === 'PROFIT' ? 'Profit' : 'Loss'}`)}</Badge>
                      ) : (
                        <Badge tone="sage">{report.crop}</Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {reports.length > 0 && (
            <Button to="/reports" variant="outline" size="sm" className="mt-4 w-full">{t('dashboard.reportsCta')}</Button>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-forest-900/10 bg-sage-50/70 p-5 sm:flex-row sm:items-start sm:p-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-ivory">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" aria-hidden="true">
            <path d="M10 2.5v15M2.5 10h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest-600">{t('dashboard.tipTitle')}</p>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-forest-900/80">{t('dashboard.tipBody')}</p>
        </div>
      </section>
    </div>
  )
}
