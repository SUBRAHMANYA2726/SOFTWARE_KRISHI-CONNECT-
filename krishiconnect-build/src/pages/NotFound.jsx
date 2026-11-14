import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { useDocumentTitle } from '../hooks/usePage'
import Button from '../components/ui/Button'

export default function NotFound() {
  const { t } = useLanguage()
  useDocumentTitle(t('notFound.title'))

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-clay-600">
        {t('notFound.eyebrow')}
      </p>
      <h1 className="display-lg mt-4 text-forest-950 text-balance" data-testid="not-found-heading">
        {t('notFound.title')}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-forest-900/80">
        {t('notFound.body')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button to="/" data-testid="not-found-home">
          {t('common.goHome')}
        </Button>
        <Link
          to="/mandi"
          className="text-sm font-semibold text-forest-900 underline decoration-forest-900/30 underline-offset-4"
        >
          {t('nav.mandi')}
        </Link>
      </div>
    </main>
  )
}
