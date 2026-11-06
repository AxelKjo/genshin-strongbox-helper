import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'

interface ExcludeAlternativeToggleProps {
  lang: Lang
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ExcludeAlternativeToggle({ lang, checked, onChange }: ExcludeAlternativeToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-abyssSoft/70 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-gold/30 hover:text-goldSoft sm:px-4 sm:py-2 sm:text-sm"
    >
      <span
        className={`relative h-5 w-9 rounded-full border transition ${
          checked ? 'border-gold/40 bg-gold/25' : 'border-white/15 bg-abyss'
        }`}
        aria-hidden
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition ${
            checked ? 'translate-x-4 bg-gold' : 'bg-slate-400'
          }`}
        />
      </span>
      {t('excludeAlternative', lang)}
    </button>
  )
}
