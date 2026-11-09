import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { TextField } from '../ui/Field'
import { useLanguage } from '../../i18n/LanguageContext'

export default function SaveReportDialog({ open, onClose, defaultName, onSave, title, description }) {
  const { t } = useLanguage()
  const [name, setName] = useState(defaultName || '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName(defaultName || '')
      setError(null)
      setBusy(false)
    }
  }, [open, defaultName])

  const submit = async (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError({ code: 'REPORT_REQUIRED' })
      return
    }
    if (trimmed.length > 80) {
      setError({ code: 'REPORT_TOO_LONG' })
      return
    }
    setBusy(true)
    try {
      await onSave(trimmed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t('profit.saveTitle')}
      description={description || t('profit.saveBody')}
      testId="save-report-modal"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>{t('common.cancel')}</Button>
          <Button type="submit" form="save-report-form" loading={busy} data-testid="save-report-submit">
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form id="save-report-form" onSubmit={submit} noValidate>
        <TextField
          id="report-name"
          label={t('profit.reportName')}
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(null)
          }}
          error={error}
          placeholder={t('profit.reportNamePlaceholder')}
          maxLength={100}
          autoFocus
          data-testid="report-name"
        />
      </form>
    </Modal>
  )
}
