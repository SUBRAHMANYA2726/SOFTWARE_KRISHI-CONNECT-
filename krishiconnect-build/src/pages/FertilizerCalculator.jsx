import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import { calculateFertilizer, FERTILIZER_LIMITS } from '../validation/fertilizer'
import { FERTILIZER_CROPS, FERTILIZER_SOURCES, NUTRIENT_PLAN } from '../data/fertilizer'
import { saveFertilizerReport } from '../services/reportService'
import { formatNumber } from '../utils/format'
import { DISCLAIMERS } from '../config/site'
import { SelectField, TextField } from '../components/ui/Field'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import { Badge } from '../components/ui/Feedback'
import SaveReportDialog from '../components/reports/SaveReportDialog'
import { useToast } from '../context/ToastContext'

export default function FertilizerCalculator() {
  const { t, language } = useLanguage()
  const { user, profile } = useAuth()
  const { pushToast } = useToast()
  useDocumentTitle(t('fertilizer.eyebrow'))

  const [form, setForm] = useState({ cropId: '', landArea: '' })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const own = (profile?.primaryCrops || [])
      .map((crop) => crop.toLowerCase())
      .find((name) => FERTILIZER_CROPS.find((crop) => crop.id === name))
    if (own) setForm((current) => ({ ...current, cropId: current.cropId || own }))
  }, [profile?.primaryCrops])

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleCalculate = (event) => {
    event.preventDefault()
    const outcome = calculateFertilizer(form)
    if (!outcome.ok) {
      setErrors(outcome.errors)
      setResult(null)
      return
    }
    setErrors({})
    setResult(outcome)
  }

  const handleReset = () => {
    setForm({ cropId: '', landArea: '' })
    setErrors({})
    setResult(null)
  }

  const handleSave = async (name) => {
    if (!user || !result) throw new Error('Save requires a signed-in user with a result')
    try {
      await saveFertilizerReport(user.uid, {
        name,
        crop: result.crop.name,
        cropId: result.crop.id,
        inputs: { landArea: result.landArea, cropId: result.crop.id },
        result,
      })
      setDialogOpen(false)
      pushToast(t('fertilizer.saved'))
    } catch {
      pushToast(t('errors.UNKNOWN'), 'error')
      throw new Error('Save failed')
    }
  }

  const products = [
    { id: 'dap', label: t('fertilizer.dap'), quantity: result?.products.dap.quantityKg },
    { id: 'urea', label: t('fertilizer.urea'), quantity: result?.products.urea.quantityKg },
    { id: 'mop', label: t('fertilizer.mop'), quantity: result?.products.mop.quantityKg },
  ]

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">{t('fertilizer.eyebrow')}</p>
        <h1 className="display-lg mt-3 text-forest-950 text-balance" data-testid="fertilizer-heading">{t('fertilizer.title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{t('fertilizer.body')}</p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-start">
        <section className="card-pad">
          <h2 className="font-display text-xl text-forest-900">{t('fertilizer.formTitle')}</h2>

          <form onSubmit={handleCalculate} className="mt-5 space-y-4" noValidate data-testid="fertilizer-form">
            <SelectField
              id="fertilizer-crop"
              label={t('fertilizer.cropLabel')}
              value={form.cropId}
              onChange={update('cropId')}
              error={errors.cropId}
              placeholder={t('fertilizer.cropPlaceholder')}
              data-testid="fertilizer-crop"
            >
              {FERTILIZER_CROPS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {language === 'kn' ? crop.nameKn : crop.name}
                </option>
              ))}
            </SelectField>

            <TextField
              id="fertilizer-landArea"
              label={t('fertilizer.landArea')}
              hint={t('fertilizer.landAreaHint')}
              type="number"
              inputMode="decimal"
              step="any"
              min={FERTILIZER_LIMITS.landArea.min}
              max={FERTILIZER_LIMITS.landArea.max}
              value={form.landArea}
              onChange={update('landArea')}
              error={errors.landArea}
              data-testid="fertilizer-landArea"
            />

            {form.cropId && !errors.cropId && (
              <p className="rounded-xl bg-sage-50 px-4 py-3 text-[13px] text-forest-900/85" data-testid="fertilizer-dose-hint">
                <span className="font-semibold">{t('fertilizer.dose')}:</span>{' '}
                {t('fertilizer.doseValue', {
                  n: FERTILIZER_CROPS.find((crop) => crop.id === form.cropId)?.npkPerHectare.n ?? '—',
                  p: FERTILIZER_CROPS.find((crop) => crop.id === form.cropId)?.npkPerHectare.p ?? '—',
                  k: FERTILIZER_CROPS.find((crop) => crop.id === form.cropId)?.npkPerHectare.k ?? '—',
                })}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" data-testid="fertilizer-calculate">{t('fertilizer.calculate')}</Button>
              <Button variant="outline" onClick={handleReset} data-testid="fertilizer-reset">{t('fertilizer.reset')}</Button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          {result ? (
            <div className="card overflow-hidden" data-testid="fertilizer-result">
              <div className="flex items-start justify-between gap-3 border-b border-forest-900/10 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="font-display text-xl text-forest-900">{result.crop.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {result.hectares} {t('fertilizer.hectares').toLowerCase()} · {result.crop.season}
                  </p>
                </div>
                <Badge tone="ochre">{t('fertilizer.dose')}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 px-5 py-5 sm:px-6">
                <div className="rounded-xl border border-forest-900/10 bg-sage-50/60 px-3 py-3 text-center" data-testid="fertilizer-target-n">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">N</p>
                  <p className="mt-1 font-display text-xl text-forest-900">{result.target.n}</p>
                  <p className="text-[10px] text-muted">{t('fertilizer.kg')}</p>
                </div>
                <div className="rounded-xl border border-forest-900/10 bg-sage-50/60 px-3 py-3 text-center" data-testid="fertilizer-target-p">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">P₂O₅</p>
                  <p className="mt-1 font-display text-xl text-forest-900">{result.target.p}</p>
                  <p className="text-[10px] text-muted">{t('fertilizer.kg')}</p>
                </div>
                <div className="rounded-xl border border-forest-900/10 bg-sage-50/60 px-3 py-3 text-center" data-testid="fertilizer-target-k">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">K₂O</p>
                  <p className="mt-1 font-display text-xl text-forest-900">{result.target.k}</p>
                  <p className="text-[10px] text-muted">{t('fertilizer.kg')}</p>
                </div>
              </div>

              <div className="border-t border-forest-900/10 px-5 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('fertilizer.products')}</p>
                <ul className="mt-3 space-y-2.5">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-forest-900/10 px-4 py-3"
                      data-testid={`fertilizer-product-${product.id}`}
                    >
                      <span className="text-sm font-semibold text-forest-900">{product.label}</span>
                      <span className="font-display text-xl text-forest-900">
                        {formatNumber(product.quantity)} {t('fertilizer.kg')}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted">{NUTRIENT_PLAN}</p>
              </div>
            </div>
          ) : (
            <div className="card px-6 py-10">
              <p className="font-display text-2xl text-forest-900">{t('fertilizer.resultsEmpty')}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t('fertilizer.resultsEmptyBody')}</p>
            </div>
          )}

          {result && (user ? (
            <Button onClick={() => setDialogOpen(true)} className="w-full" data-testid="fertilizer-save">
              {t('fertilizer.save')}
            </Button>
          ) : (
            <Button to="/login" variant="outline" className="w-full" title={t('common.firebaseOnly')} data-testid="fertilizer-save-login">
              {t('profit.saveRequiresLogin')}
            </Button>
          ))}

          <Alert tone="warning">{DISCLAIMERS.fertilizer}</Alert>
        </section>
      </div>

      <section className="card">
        <details className="px-5 py-4 sm:px-6" data-testid="fertilizer-explanation" open>
          <summary className="cursor-pointer text-[13px] font-semibold text-forest-900">{t('fertilizer.explanation')}</summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t('fertilizer.explanationBody')}</p>
          <p className="mt-2 text-xs text-muted">{t('fertilizer.conversion')} · {t('fertilizer.sourceNote')}</p>

          <div className="mt-4 border-t border-forest-900/10 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t('fertilizer.sources')}</p>
            <ul className="mt-2 space-y-2">
              {FERTILIZER_SOURCES.map((source) => (
                <li key={source.url} className="text-[13px] leading-relaxed text-muted">
                  <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold text-forest-800 hover:underline">
                    {source.label} ↗
                  </a>{' '}
                  — {source.note}
                </li>
              ))}
            </ul>
          </div>
        </details>
      </section>

      <SaveReportDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        title={t('fertilizer.saveTitle')}
        description={t('fertilizer.saveBody')}
      />
    </div>
  )
}
