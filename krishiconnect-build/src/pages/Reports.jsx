import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { listReports } from '../services/reportService'
import { formatDate, formatINR, formatQuantity } from '../utils/format'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { Badge, EmptyState, Spinner } from '../components/ui/Feedback'
import { useToast } from '../context/ToastContext'

const statusTone = { PROFIT: 'sage', LOSS: 'clay', BREAK_EVEN: 'ochre' }
const statusKey = { PROFIT: 'statusProfit', LOSS: 'statusLoss', BREAK_EVEN: 'statusBreakEven' }

function reportSummary(report) {
  if (report.type === 'profit') {
    const profit = report.result?.profit
    if (typeof profit !== 'number') return '—'
    return `${profit >= 0 ? '+' : '−'} ₹${Math.abs(profit).toLocaleString('en-IN')}`
  }
  return null
}

export default function Reports() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { pushToast } = useToast()
  useDocumentTitle(t('reports.eyebrow'))

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const locale = language === 'kn' ? 'kn-IN' : 'en-IN'

  useEffect(() => {
    let active = true
    if (!user) return undefined
    listReports(user.uid)
      .then((rows) => active && setReports(rows))
      .catch(() => active && setReports([]))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  const confirmDelete = async () => {
    if (!pendingDelete || !user) return
    setDeleting(true)
    try {
      await (await import('../services/reportService')).deleteReport(user.uid, pendingDelete.id)
      setReports((current) => current.filter((report) => report.id !== pendingDelete.id))
      pushToast(t('reports.deleted'))
      setPendingDelete(null)
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('reports.eyebrow')}</p>
        <h1 className="display-lg mt-3 text-forest-950 text-balance" data-testid="reports-heading">{t('reports.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('reports.body')}</p>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl card px-6 py-10 text-sm text-muted">
          <Spinner className="h-4 w-4" /> {t('common.loading')}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          testId="reports-empty"
          title={t('reports.emptyTitle')}
          body={t('reports.emptyBody')}
          action={
            <Button to="/calculator/profit" size="sm" data-testid="reports-empty-cta">
              {t('reports.goToCalculators')}
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2" data-testid="reports-list">
          {reports.map((report) => {
            const status = report.type === 'profit' ? report.result?.status : null
            const fertilizerLabel = report.type === 'fertilizer'
              ? formatQuantity(report.result?.products?.urea?.quantityKg, `${t('fertilizer.kg')} ${t('fertilizer.urea').toLowerCase()}`)
              : null
            return (
              <li key={report.id} className="card flex flex-col p-5" data-testid="report-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/reports/${report.id}`} className="block truncate font-display text-[19px] text-forest-900 hover:underline" data-testid="report-link">
                      {report.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">
                      {t('reports.savedOn')} {formatDate(report.createdAt, locale)}
                    </p>
                  </div>
                  {status ? (
                    <Badge tone={statusTone[status]}>{t(`profit.${statusKey[status]}`)}</Badge>
                  ) : (
                    <Badge tone="sage">{report.crop}</Badge>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-forest-900/[0.07] pt-4">
                  <p className="text-sm text-muted">
                    {report.type === 'profit' ? t('reports.typeProfit') : t('reports.typeFertilizer')}
                    {' · '}
                    {report.type === 'profit' ? reportSummary(report) : fertilizerLabel}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link to={`/reports/${report.id}`} className="text-xs font-semibold text-forest-700 underline decoration-forest-700/30 underline-offset-4 hover:decoration-forest-700" data-testid="report-open">
                      {t('reports.open')}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(report)}
                      className="text-xs font-semibold text-clay-600 hover:underline"
                      data-testid="report-delete"
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title={t('reports.deleteTitle')}
        description={t('reports.deleteBody', { name: pendingDelete?.name || '' })}
        testId="delete-report-modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDelete(null)} disabled={deleting} data-testid="delete-report-cancel">
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
