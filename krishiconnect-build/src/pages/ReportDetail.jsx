import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { getReport, deleteReport } from '../services/reportService'
import { formatDate, formatINR, formatNumber, formatDateTime } from '../utils/format'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Alert from '../components/ui/Alert'
import { Badge, Spinner } from '../components/ui/Feedback'
import { useToast } from '../context/ToastContext'

const statusTone = { PROFIT: 'sage', LOSS: 'clay', BREAK_EVEN: 'ochre' }
const statusKey = { PROFIT: 'statusProfit', LOSS: 'statusLoss', BREAK_EVEN: 'statusBreakEven' }

function Row({ label, value, testId, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-forest-900/[0.07] py-2.5 last:border-b-0" data-testid={testId}>
      <span className="text-[13px] text-muted">{label}</span>
      <span className={strong ? 'font-display text-[17px] text-forest-900' : 'text-[14px] font-semibold text-forest-900'}>{value}</span>
    </div>
  )
}

export default function ReportDetail() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { reportId } = useParams()
  const navigate = useNavigate()
  const { pushToast } = useToast()
  useDocumentTitle(t('reports.detailTitle'))

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const locale = language === 'kn' ? 'kn-IN' : 'en-IN'

  useEffect(() => {
    let active = true
    if (!user || !reportId) return undefined
    getReport(user.uid, reportId)
      .then((found) => {
        if (!active) return
        if (found) setReport(found)
        else setNotFound(true)
      })
      .catch(() => active && setNotFound(true))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user, reportId])

  const inputs = useMemo(() => {
    if (!report) return []
    if (report.type === 'profit') {
      return [
        { label: t('reports.crop'), value: report.crop },
        { label: t('reports.landArea'), value: `${formatNumber(report.inputs?.landArea)} ${t('common.acres')}`, testId: 'report-input-landArea' },
        { label: t('reports.yield'), value: `${formatNumber(report.inputs?.yieldPerAcre)} ${t('common.quintals')}`, testId: 'report-input-yieldPerAcre' },
        { label: t('reports.price'), value: formatINR(report.inputs?.sellingPrice), testId: 'report-input-sellingPrice' },
        { label: t('reports.cost'), value: formatINR(report.inputs?.cultivationCost), testId: 'report-input-cultivationCost' },
      ]
    }
    return [
      { label: t('reports.crop'), value: report.crop },
      { label: t('reports.landArea'), value: `${formatNumber(report.inputs?.landArea)} ${t('common.acres')}`, testId: 'report-input-landArea' },
    ]
  }, [report, t, language])

  const results = useMemo(() => {
    if (!report) return []
    if (report.type === 'profit') {
      const profit = report.result?.profit
      return [
        { label: t('reports.totalYield'), value: `${formatNumber(report.result?.totalYield)} ${t('common.quintals')}`, testId: 'report-result-totalYield' },
        { label: t('reports.revenue'), value: formatINR(report.result?.revenue), testId: 'report-result-revenue' },
        { label: t('reports.expenditure'), value: formatINR(report.result?.cost), testId: 'report-result-expenditure' },
        {
          label: profit >= 0 ? t('reports.profit') : t('reports.loss'),
          value: formatINR(Math.abs(profit ?? 0)),
          strong: true,
          testId: 'report-result-profit',
        },
        { label: t('reports.margin'), value: `${report.result?.marginPercent ?? 0}%`, testId: 'report-result-margin' },
        { label: t('reports.breakEvenPrice'), value: formatINR(report.result?.breakEvenPrice, { decimals: true }), testId: 'report-result-breakEvenPrice' },
      ]
    }
    const products = report.result?.products || {}
    return [
      { label: t('fertilizer.hectares'), value: formatNumber(report.result?.hectares), testId: 'report-result-hectares' },
      { label: t('reports.targetN'), value: `${formatNumber(report.result?.target?.n)} ${t('fertilizer.kg')}`, testId: 'report-result-targetN' },
      { label: t('reports.targetP'), value: `${formatNumber(report.result?.target?.p)} ${t('fertilizer.kg')}`, testId: 'report-result-targetP' },
      { label: t('reports.targetK'), value: `${formatNumber(report.result?.target?.k)} ${t('fertilizer.kg')}`, testId: 'report-result-targetK' },
      { label: t('reports.dap'), value: `${formatNumber(products.dap?.quantityKg)} ${t('fertilizer.kg')}`, strong: true, testId: 'report-result-dap' },
      { label: t('reports.urea'), value: `${formatNumber(products.urea?.quantityKg)} ${t('fertilizer.kg')}`, strong: true, testId: 'report-result-urea' },
      { label: t('reports.mop'), value: `${formatNumber(products.mop?.quantityKg)} ${t('fertilizer.kg')}`, strong: true, testId: 'report-result-mop' },
    ]
  }, [report, t, language])

  const confirmDelete = async () => {
    if (!user || !report) return
    setDeleting(true)
    try {
      await deleteReport(user.uid, report.id)
      pushToast(t('reports.deleted'))
      setConfirmOpen(false)
      navigate('/reports', { replace: true })
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted">
        <Spinner className="h-5 w-5" /> {t('common.loading')}
      </div>
    )
  }

  if (notFound || !report) {
    return (
      <div className="mx-auto max-w-xl py-10" data-testid="report-missing">
        <Alert tone="warning" title={t('reports.deletedTitle')} className="items-start justify-start">
          <p>{t('reports.deletedBody', { name: '' })}</p>
        </Alert>
        <div className="mt-6 text-center">
          <Button to="/reports" variant="outline" data-testid="report-missing-back">{t('reports.backToReports')}</Button>
        </div>
      </div>
    )
  }

  const status = report.type === 'profit' ? report.result?.status : null

  return (
    <div className="space-y-6">
      <div>
        <Link to="/reports" className="text-xs font-semibold text-forest-700 hover:underline" data-testid="report-back">
          ← {t('reports.backToReports')}
        </Link>
        <header className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{t('reports.detailTitle')}</p>
            <h1 className="display-lg mt-3 text-forest-950 text-balance" data-testid="report-heading">{report.name}</h1>
            <p className="mt-2 text-xs text-muted">
              {t('reports.savedTo')} · {formatDateTime(report.createdAt, locale)} · {t('reports.reportId')}: <span className="font-semibold text-forest-900">{report.id}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {status ? (
              <Badge tone={statusTone[status]} data-testid="report-status-badge">
                {t(`profit.${statusKey[status]}`)}
              </Badge>
            ) : (
              <Badge tone="forest">{t('reports.typeFertilizer')}</Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)} data-testid="report-detail-delete">
              {t('common.delete')}
            </Button>
          </div>
        </header>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <section className="card px-5 py-4 sm:px-6" >
          <h2 className="font-display text-xl text-forest-900">{t('reports.inputs')}</h2>
          <div className="mt-3" data-testid="report-inputs">
            {inputs.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} testId={row.testId} />
            ))}
          </div>
        </section>

        <section className="card px-5 py-4 sm:px-6">
          <h2 className="font-display text-xl text-forest-900">{t('reports.results')}</h2>
          <div className="mt-3" data-testid="report-results">
            {results.map((row) => (
              <Row key={row.label} label={row.label} value={row.value} testId={row.testId} strong={row.strong} />
            ))}
          </div>
        </section>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => (deleting ? null : setConfirmOpen(false))}
        title={t('reports.deleteTitle')}
        description={t('reports.deleteBody', { name: report.name })}
        testId="delete-report-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={deleting} data-testid="delete-report-cancel">
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting} data-testid="delete-report-confirm">
              {t('common.delete')}
            </Button>
          </>
        }
      />
    </div>
  )
}
