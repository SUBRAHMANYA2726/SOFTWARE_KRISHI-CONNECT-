import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { calculateProfit } from '../validation/profit'
import { saveProfitReport } from '../services/reportService'
import { isDemoMode } from '../services/backend'
import { formatINR, formatNumber } from '../utils/format'
import { DISCLAIMERS } from '../config/site'
import { TextField } from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Badge } from '../components/ui/Feedback'
import SaveReportDialog from '../components/reports/SaveReportDialog'
import { useToast } from '../context/ToastContext'

const statusTone = { PROFIT: 'sage', LOSS: 'clay', BREAK_EVEN: 'ochre' }
const statusKey = { PROFIT: 'statusProfit', LOSS: 'statusLoss', BREAK_EVEN: 'statusBreakEven' }

const EMPTY_FORM = { label: '', landArea: '', yieldPerAcre: '', sellingPrice: '', cultivationCost: '' }

export default function ProfitCalculator() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { pushToast } = useToast()
  useDocumentTitle(t('profit.eyebrow'))

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [showFormError, setShowFormError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setShowFormError(false)
  }

  const handleCalculate = (event) => {
    event.preventDefault()
    const outcome = calculateProfit(form)
    if (!outcome.ok) {
      setErrors(outcome.errors)
      setShowFormError(true)
      setResult(null)
      return
    }
    setErrors({})
    setShowFormError(false)
    setResult(outcome)
  }

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setResult(null)
    setShowFormError(false)
  }

  const handleSave = async (name) => {
    if (!user || !result) throw new Error('Save requires a signed-in user with a result')
    try {
      await saveProfitReport(user.uid, {
        name,
        crop: form.label || '—',
        inputs: { ...result.values },
        result,
      })
      setDialogOpen(false)
      pushToast(t('profit.saved'))
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
      throw new Error('Save failed')
    }
  }

  const statusLabel = result ? t(`profit.${statusKey[result.status]}`) : ''
  const statusToneValue = result ? statusTone[result.status] : 'sage'
  const isProfit = result ? result.profit > 0 : false

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('profit.eyebrow')}</p>
        <h1 className="display-lg mt-3 text-forest-950 text-balance" data-testid="profit-heading">{t('profit.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('profit.body')}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-start">
        <section className="card-pad">
          <h2 className="font-display text-xl text-forest-900">{t('profit.formTitle')}</h2>

          {showFormError && (
            <div className="mt-4">
              <Alert tone="error" data-testid="profit-error-summary">{t('profit.errorSummary')}</Alert>
            </div>
          )}

          <form onSubmit={handleCalculate} className="mt-5 space-y-4" noValidate data-testid="profit-form">
            <TextField
              id="profit-label"
              label={t('profit.cropLabel')}
              hint={t('profit.cropHint')}
              required={false}
              value={form.label}
              onChange={update('label')}
              placeholder={t('profit.reportNamePlaceholder')}
              data-testid="profit-label"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="profit-landArea"
                label={t('profit.landArea')}
                hint={t('profit.landAreaHint')}
                type="number"
                inputMode="decimal"
                step="any"
                value={form.landArea}
                onChange={update('landArea')}
                error={errors.landArea}
                data-testid="profit-landArea"
              />
              <TextField
                id="profit-yieldPerAcre"
                label={t('profit.yieldPerAcre')}
                hint={t('profit.yieldPerAcreHint')}
                type="number"
                inputMode="decimal"
                step="any"
                value={form.yieldPerAcre}
                onChange={update('yieldPerAcre')}
                error={errors.yieldPerAcre}
                data-testid="profit-yieldPerAcre"
              />
              <TextField
                id="profit-sellingPrice"
                label={t('profit.sellingPrice')}
                hint={t('profit.sellingPriceHint')}
                type="number"
                inputMode="decimal"
                step="any"
                value={form.sellingPrice}
                onChange={update('sellingPrice')}
                error={errors.sellingPrice}
                data-testid="profit-sellingPrice"
              />
              <TextField
                id="profit-cultivationCost"
                label={t('profit.cultivationCost')}
                hint={t('profit.cultivationCostHint')}
                type="number"
                inputMode="decimal"
                step="any"
                value={form.cultivationCost}
                onChange={update('cultivationCost')}
                error={errors.cultivationCost}
                data-testid="profit-cultivationCost"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" data-testid="profit-calculate">{t('profit.calculate')}</Button>
              <Button variant="outline" onClick={handleReset} data-testid="profit-reset">{t('profit.reset')}</Button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {result ? (
            <div className="card overflow-hidden" data-testid="profit-result">
              <div className="flex items-center justify-between gap-3 border-b border-forest-900/10 px-5 py-4 sm:px-6">
                <h2 className="font-display text-xl text-forest-900">{t('profit.resultsTitle')}</h2>
                <Badge tone={statusToneValue} data-testid="profit-result-status">{statusLabel}</Badge>
              </div>

              <div className="grid grid-cols-1 gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
                <div className="rounded-xl border border-forest-900/10 bg-sage-50/60 px-4 py-4 sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {isProfit ? t('profit.netProfit') : result.profit < 0 ? t('profit.netLoss') : t('profit.breakEven')}
                  </p>
                  <p
                    className={`mt-1 font-display text-[2.1rem] leading-tight ${result.profit > 0 ? 'text-forest-700' : result.profit < 0 ? 'text-clay-600' : 'text-forest-900'}`}
                    data-testid="profit-net-result"
                  >
                    {formatINR(result.profit)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('profit.revenue')}</p>
                  <p className="mt-1 font-display text-2xl text-forest-900" data-testid="profit-revenue">{formatINR(result.revenue)}</p>
                  <p className="mt-1 text-xs text-muted">{t('profit.revenueHint')}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('profit.expenditure')}</p>
                  <p className="mt-1 font-display text-2xl text-forest-900" data-testid="profit-expenditure">{formatINR(result.cost)}</p>
                  <p className="mt-1 text-xs text-muted">{t('profit.expenditureHint')}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('profit.totalYield')}</p>
                  <p className="mt-1 font-display text-2xl text-forest-900" data-testid="profit-total-yield">{formatNumber(result.totalYield)} {t('common.quintals')}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('profit.margin')}</p>
                  <p className="mt-1 font-display text-2xl text-forest-900" data-testid="profit-margin">{result.marginPercent}%</p>
                </div>

                <div className="sm:col-span-2 rounded-xl border border-forest-900/10 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('profit.breakEvenPrice')}</p>
                  <p className="mt-1 font-display text-2xl text-forest-900" data-testid="profit-break-even">{formatINR(result.breakEvenPrice, { decimals: true })}</p>
                  <p className="mt-1 text-xs text-muted">{t('profit.breakEvenHint')}</p>
                </div>
              </div>

              <div className="border-t border-forest-900/10 bg-sage-50/50 px-5 py-4 sm:px-6">
                <p className="text-[13px] text-forest-900/85" data-testid="profit-summary">
                  {t('profit.summaryRevenue', {
                    yield: formatNumber(result.totalYield),
                    price: formatINR(result.values.sellingPrice),
                    revenue: formatINR(result.revenue),
                  })}
                </p>
                <p className="mt-1 text-xs text-muted">{t('profit.statusNote')}</p>
              </div>
            </div>
          ) : (
            <div className="card px-6 py-10">
              <p className="font-display text-2xl text-forest-900">{t('profit.resultsEmpty')}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('profit.resultsEmptyBody')}</p>
            </div>
          )}

          {result && (user ? (
            <Button onClick={() => setDialogOpen(true)} className="w-full" data-testid="profit-save">
              {t('profit.save')}
            </Button>
          ) : (
            <Button to="/login" variant="outline" className="w-full" title={t('common.firebaseOnly')} data-testid="profit-save-login">
              {t('profit.saveRequiresLogin')}
            </Button>
          ))}

          <Alert tone="warning">{DISCLAIMERS.calculators}</Alert>
        </section>
      </div>

      <section className="card">
        <details className="px-5 py-4 sm:px-6" data-testid="profit-assumptions">
          <summary className="cursor-pointer text-[13px] font-semibold text-forest-900">{t('profit.unitsTitle')}</summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('profit.unitsBody')}</p>
          {isDemoMode && <p className="mt-2 text-xs text-muted">{t('auth.demoNotice')}</p>}
        </details>
      </section>

      <SaveReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        title={t('profit.saveTitle')}
        description={t('profit.saveBody')}
      />
    </div>
  )
}
