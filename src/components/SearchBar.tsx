import { Search } from 'lucide-react'
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  lang: Lang
  autoFocus?: boolean
}

export function SearchBar({ value, onChange, lang, autoFocus = false }: SearchBarProps) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" aria-hidden />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('searchPlaceholder', lang)}
        autoFocus={autoFocus}
        className="w-full rounded-xl border border-white/10 bg-abyssSoft/90 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-gold/60 focus:ring-2 focus:ring-gold/15"
        type="search"
      />
    </label>
  )
}
