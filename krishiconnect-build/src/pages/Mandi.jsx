import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { fetchMandiPrices, filterPrices, MANDI_META } from '../services/mandiService'
import { formatDate, formatINR } from '../utils/format'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { Badge, EmptyState, Spinner } from '../components/ui/Feedback'
import { siteConfig } from '../config/site'

export default function Mandi() {
  const { t, language } = useLanguage()
  useDocumentTitle(t('common.mandi'))

  const [data, setData] = useState({ rows: [], meta: MANDI_META })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    crop: 'All crops',
    district: 'All districts',
    market: 'All markets',
  })

  useEffect(() => {
    let active = true
    fetchMandiPrices()
      .then((result) => active && setData(result))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const crops = useMemo(() => [...new Set(data.rows.map((row) => row.crop))].sort(), [data.rows])
  const districts = useMemo(() => [...new Set(data.rows.map((row) => row.district))].sort(), [data.rows])
  const markets = useMemo(() => {
    const scoped = filters.district === 'All districts' ? data.rows : data.rows.filter((row) => row.district === filters.district)
    return [...new Set(scoped.map((row) => row.market))].sort()
  }, [data.rows, filters.district])

  const rows = useMemo(() => filterPrices(data.rows, filters), [data.rows, filters])
  const locale = language === 'kn' ? 'kn-IN' : 'en-IN'

  const update = (field) => (event) => {
    const value = event.target.value
    setFilters((current) => ({
      ...current,
      [field]: value,
      ...(field === 'district' ? { market: 'All markets' } : {}),
    }))
  }

  const reset = () =>
    setFilters({ search: '', crop: 'All crops', district: 'All districts', market: 'All markets' })

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('mandi.eyebrow')}</p>
        <h1 className="display-lg mt-3 text-forest-950 text-balance">{t('mandi.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('mandi.body')}</p>
      </header>

      <Alert tone="warning" title={t('mandi.sampleTitle')} data-testid="mandi-sample-notice">
        <p>{t('mandi.sampleBody')}</p>
        <a href={siteConfig.agmarknetUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold underline decoration-current/30 underline-offset-4">
          {t('mandi.browseOfficial')} ↗
        </a>
      </Alert>

      <section className="card p-4 sm:p-5" aria-label="Mandi filters">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="field">
            <label htmlFor="mandi-search" className="field-label">{t('mandi.searchLabel')}</label>
            <div className="relative">
              <svg viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                id="mandi-search"
                type="search"
                value={filters.search}
                onChange={update('search')}
                placeholder={t('mandi.searchPlaceholder')}
                className="field-input pl-10"
                data-testid="mandi-search"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="mandi-crop" className="field-label">{t('mandi.cropLabel')}</label>
            <select id="mandi-crop" value={filters.crop} onChange={update('crop')} className="field-input" data-testid="mandi-crop">
              <option value="All crops">{t('mandi.allCrops')}</option>
              {crops.map((crop) => <option key={crop} value={crop}>{crop}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="mandi-district" className="field-label">{t('mandi.districtLabel')}</label>
            <select id="mandi-district" value={filters.district} onChange={update('district')} className="field-input" data-testid="mandi-district">
              <option value="All districts">{t('mandi.allDistricts')}</option>
              {districts.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="mandi-market" className="field-label">{t('mandi.marketLabel')}</label>
            <select id="mandi-market" value={filters.market} onChange={update('market')} className="field-input" data-testid="mandi-market">
              <option value="All markets">{t('mandi.allMarkets')}</option>
              {markets.map((market) => <option key={market} value={market}>{market}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-forest-900/10 pt-3">
          <p className="text-xs text-muted" data-testid="mandi-results-count">
            {rows.length === 1 ? t('mandi.resultsOne') : t('mandi.results', { count: rows.length })}
            <span className="mx-2 text-forest-900/20">|</span>
            {t('mandi.unitNote')}
          </p>
          <button type="button" onClick={reset} className="text-xs font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700" data-testid="mandi-clear">
            {t('mandi.clear')}
          </button>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <Badge tone="ochre">{t('common.sampleData')}</Badge>
            <p className="text-xs text-muted">
              {t('mandi.updated')}: <span className="font-semibold text-forest-900">{formatDate(data.meta.snapshotDate, locale)}</span>
            </p>
          </div>
          <p className="text-xs text-muted">{t('common.dataSource')}: <span className="text-forest-900">{data.meta.dataSource}</span></p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><Spinner /> {t('common.loading')}</div>
        ) : rows.length === 0 ? (
          <EmptyState
            className="m-5 border-0 bg-transparent"
            title={t('mandi.emptyTitle')}
            body={t('mandi.emptyBody')}
            action={<Button variant="outline" size="sm" onClick={reset}>{t('mandi.clear')}</Button>}
            testId="mandi-empty"
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="table-editorial" data-testid="mandi-table">
                <thead>
                  <tr>
                    <th>{t('mandi.tableCrop')}</th>
                    <th>{t('mandi.tableMarket')}</th>
                    <th>{t('mandi.tableDistrict')}</th>
                    <th className="text-right">{t('mandi.tableMin')}</th>
                    <th className="text-right">{t('mandi.tableModal')}</th>
                    <th className="text-right">{t('mandi.tableMax')}</th>
                    <th className="text-right">{t('mandi.tableDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} data-testid="mandi-row">
                      <td>
                        <span className="font-semibold text-forest-900">{language === 'kn' ? row.cropKn : row.crop}</span>
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">{row.unit}</span>
                      </td>
                      <td className="text-forest-900/80">{row.market}</td>
                      <td className="text-muted">{row.district}</td>
                      <td className="text-right text-muted">{formatINR(row.minPrice)}</td>
                      <td className="text-right font-semibold text-forest-900">{formatINR(row.modalPrice)}</td>
                      <td className="text-right text-muted">{formatINR(row.maxPrice)}</td>
                      <td className="text-right text-xs text-muted">{formatDate(row.date, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-forest-900/[0.07] md:hidden">
              {rows.map((row) => (
                <div key={row.id} className="p-4" data-testid="mandi-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-forest-900">{language === 'kn' ? row.cropKn : row.crop}</p>
                      <p className="mt-0.5 text-xs text-muted">{row.market} · {row.district}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl text-forest-900">{formatINR(row.modalPrice)}</p>
                      <p className="text-[10px] text-muted">{row.unit}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg bg-sage-50 px-3 py-2 text-[11px] text-muted">
                    <span>{t('mandi.min')} {formatINR(row.minPrice)}</span>
                    <span>{t('mandi.max')} {formatINR(row.maxPrice)}</span>
                    <span>{formatDate(row.date, locale)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-forest-900/10 bg-sage-50/50 px-5 py-3 text-[11px] text-muted">
          <p>{t('mandi.disclaimer')}</p>
          <a href={siteConfig.dataGovUrl} target="_blank" rel="noreferrer" className="font-semibold text-forest-700 hover:underline">
            data.gov.in ↗
          </a>
        </div>
      </section>
    </div>
  )
}
