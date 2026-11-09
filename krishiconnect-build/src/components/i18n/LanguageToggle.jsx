import { useLanguage } from '../../i18n/LanguageContext'
import { cn } from '../../utils/cn'

export default function LanguageToggle({ light = false, className, onChange }) {
  const { language, setLanguage } = useLanguage()

  const choose = (next) => {
    setLanguage(next)
    onChange?.(next)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border p-0.5 text-[12px] font-semibold',
        light ? 'border-ivory/25 text-ivory' : 'border-forest-900/15 text-forest-900',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => choose('en')}
        aria-pressed={language === 'en'}
        data-testid="language-en"
        className={cn(
          'rounded-full px-3 py-1.5 transition',
          language === 'en' ? (light ? 'bg-ivory text-forest-900' : 'bg-forest-900 text-ivory') : 'opacity-70 hover:opacity-100',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => choose('kn')}
        aria-pressed={language === 'kn'}
        data-testid="language-kn"
        className={cn(
          'lang-kn rounded-full px-3 py-1.5 transition',
          language === 'kn' ? (light ? 'bg-ivory text-forest-900' : 'bg-forest-900 text-ivory') : 'opacity-70 hover:opacity-100',
        )}
      >
        ಕನ್ನಡ
      </button>
    </div>
  )
}
