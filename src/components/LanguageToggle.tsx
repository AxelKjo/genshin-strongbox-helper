import { Languages } from 'lucide-react'
import type { Lang } from '../lib/i18n'

interface LanguageToggleProps {
  lang: Lang
  onChange: (lang: Lang) => void
}

export function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-abyssSoft/80 p-1" aria-label="Language">
      <Languages className="ml-2 h-4 w-4 text-gold/70" aria-hidden />
      {(['es', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest transition ${
            lang === option ? 'bg-gold text-abyss shadow-glow' : 'text-gold/70 hover:text-gold'
          }`}
          aria-pressed={lang === option}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
