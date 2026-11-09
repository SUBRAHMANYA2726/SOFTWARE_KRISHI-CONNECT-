import { useState } from 'react'
import { IRRIGATION_SOURCES, KARNATAKA_DISTRICTS, PRIMARY_CROPS, taluksForDistrict } from '../../data/karnataka'
import { useLanguage } from '../../i18n/LanguageContext'
import { validateProfile } from '../../validation/profile'
import { cn } from '../../utils/cn'
import { SelectField, TextField } from '../ui/Field'
import Button from '../ui/Button'

export default function ProfileForm({ initialValues = {}, onSubmit, submitLabel, busy = false, testPrefix = 'profile', showLanguage = true }) {
  const { t, language, setLanguage } = useLanguage()
  const [form, setForm] = useState(() => ({
    fullName: initialValues.fullName || '',
    village: initialValues.village || '',
    district: initialValues.district || '',
    taluk: initialValues.taluk || '',
    language: initialValues.language || language,
    farmArea: initialValues.farmArea ?? '',
    irrigation: initialValues.irrigation || '',
    primaryCrops: Array.isArray(initialValues.primaryCrops) ? initialValues.primaryCrops : [],
  }))
  const [errors, setErrors] = useState({})
  const taluks = taluksForDistrict(form.district)

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleDistrict = (event) => {
    setForm((current) => ({ ...current, district: event.target.value, taluk: '' }))
    setErrors((current) => ({ ...current, district: undefined, taluk: undefined }))
  }

  const toggleCrop = (crop) => {
    setForm((current) => {
      const selected = current.primaryCrops.includes(crop)
      if (selected) {
        return { ...current, primaryCrops: current.primaryCrops.filter((entry) => entry !== crop) }
      }
      if (current.primaryCrops.length >= 5) {
        setErrors((errorsCurrent) => ({ ...errorsCurrent, primaryCrops: { code: 'TOO_MANY', params: { max: 5 } } }))
        return current
      }
      return { ...current, primaryCrops: [...current.primaryCrops, crop] }
    })
    setErrors((current) => ({ ...current, primaryCrops: undefined }))
  }

  const chooseLanguage = (next) => {
    update('language', next)
    setLanguage(next)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateProfile(form)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    await onSubmit(result.values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate data-testid={`${testPrefix}-form`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${testPrefix}-name`}
          label={t('onboarding.fullName')}
          value={form.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          error={errors.fullName}
          autoComplete="name"
          placeholder={t('auth.fullNamePlaceholder')}
          data-testid={`${testPrefix}-name`}
        />
        <TextField
          id={`${testPrefix}-village`}
          label={t('onboarding.village')}
          value={form.village}
          onChange={(event) => update('village', event.target.value)}
          error={errors.village}
          required={false}
          placeholder={t('onboarding.villagePlaceholder')}
          data-testid={`${testPrefix}-village`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id={`${testPrefix}-district`}
          label={t('onboarding.district')}
          value={form.district}
          onChange={handleDistrict}
          error={errors.district}
          placeholder={t('onboarding.districtPlaceholder')}
          data-testid={`${testPrefix}-district`}
        >
          {KARNATAKA_DISTRICTS.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          id={`${testPrefix}-taluk`}
          label={t('onboarding.taluk')}
          value={form.taluk}
          onChange={(event) => update('taluk', event.target.value)}
          error={errors.taluk}
          disabled={!form.district}
          placeholder={form.district ? t('onboarding.talukPlaceholder') : t('onboarding.talukHint')}
          hint={form.district ? undefined : t('onboarding.talukHint')}
          data-testid={`${testPrefix}-taluk`}
        >
          {taluks.map((taluk) => (
            <option key={taluk} value={taluk}>
              {taluk}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={`${testPrefix}-farmArea`}
          label={t('onboarding.farmArea')}
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0.1"
          max="1000"
          value={form.farmArea}
          onChange={(event) => update('farmArea', event.target.value)}
          error={errors.farmArea}
          hint={t('onboarding.farmAreaHint')}
          data-testid={`${testPrefix}-farmArea`}
        />
        <SelectField
          id={`${testPrefix}-irrigation`}
          label={t('onboarding.irrigation')}
          value={form.irrigation}
          onChange={(event) => update('irrigation', event.target.value)}
          error={errors.irrigation}
          placeholder={t('onboarding.irrigationPlaceholder')}
          data-testid={`${testPrefix}-irrigation`}
        >
          {IRRIGATION_SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </SelectField>
      </div>

      {showLanguage && (
      <div className="field">
        <span className="field-label">{t('onboarding.language')}</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'en', label: t('common.english'), sample: 'English' },
            { value: 'kn', label: t('common.kannada'), sample: 'ಕನ್ನಡ' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => chooseLanguage(option.value)}
              aria-pressed={form.language === option.value}
              data-testid={`${testPrefix}-language-${option.value}`}
              className={cn(
                'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                form.language === option.value
                  ? 'border-forest-700 bg-sage-50 ring-2 ring-forest-700/10'
                  : 'border-forest-900/15 bg-paper hover:border-forest-900/30',
              )}
            >
              <span>
                <span className="block text-sm font-semibold text-forest-900">{option.label}</span>
                <span className="block text-xs text-muted">{option.sample}</span>
              </span>
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border',
                  form.language === option.value ? 'border-forest-900 bg-forest-900' : 'border-forest-900/30',
                )}
              >
                {form.language === option.value && <span className="h-1.5 w-1.5 rounded-full bg-ivory" />}
              </span>
            </button>
          ))}
        </div>
        <p className="field-hint">{t('onboarding.languageHint')}</p>
        {errors.language && (
          <p className="field-error" data-testid={`error-${testPrefix}-language`}>
            {t(`errors.${errors.language.code}`, errors.language.params)}
          </p>
        )}
      </div>
      )}

      <div className="field">
        <div className="field-label">
          <span>{t('onboarding.primaryCrops')}</span>
          <span className="text-[11px] font-medium text-muted">{form.primaryCrops.length}/5</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRIMARY_CROPS.map((crop) => {
            const selected = form.primaryCrops.includes(crop)
            return (
              <button
                key={crop}
                type="button"
                onClick={() => toggleCrop(crop)}
                aria-pressed={selected}
                data-testid={`crop-${crop.toLowerCase()}`}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[13px] font-medium transition',
                  selected
                    ? 'border-forest-900 bg-forest-900 text-ivory'
                    : 'border-forest-900/15 bg-paper text-forest-900 hover:border-forest-900/35',
                )}
              >
                {crop}
              </button>
            )
          })}
        </div>
        <p className="field-hint">{t('onboarding.primaryCropsHint')}</p>
        {errors.primaryCrops && (
          <p className="field-error" role="alert" data-testid={`error-${testPrefix}-crops`} data-error-code={errors.primaryCrops.code}>
            {t(`errors.${errors.primaryCrops.code}`, errors.primaryCrops.params)}
          </p>
        )}
      </div>

      <div className="pt-1">
        <Button type="submit" className="w-full sm:w-auto" loading={busy} data-testid={`${testPrefix}-submit`}>
          {submitLabel || t('onboarding.submit')}
        </Button>
      </div>
    </form>
  )
}
