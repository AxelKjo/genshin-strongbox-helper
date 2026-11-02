import { ChevronsLeft, ChevronsRight, Search, Star } from 'lucide-react'
import type { ArtifactSetTriage } from '../types/artifacts'
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'
import { Avatar } from './Avatar'
import { SearchBar } from './SearchBar'

interface SetSidebarProps {
  sets: ArtifactSetTriage[]
  selectedId: string | null
  onSelect: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  lang: Lang
  expanded: boolean
  onExpand: () => void
  onToggle: () => void
}

export function SetSidebar({
  sets,
  selectedId,
  onSelect,
  query,
  onQueryChange,
  lang,
  expanded,
  onExpand,
  onToggle,
}: SetSidebarProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col gap-4">
      {expanded ? (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <SearchBar value={query} onChange={onQueryChange} lang={lang} autoFocus />
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-abyssSoft/90 text-slate-400 transition hover:border-gold/30 hover:text-goldSoft lg:flex"
            aria-label={t('collapseSidebar', lang)}
            aria-expanded={expanded}
            title={t('collapseSidebar', lang)}
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <>
          <div className="hidden grid-cols-2 gap-1.5 lg:grid">
            <button
              type="button"
              onClick={onExpand}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-abyssSoft/90 py-2.5 text-gold/70 transition hover:border-gold/30 hover:text-goldSoft"
              aria-label={t('searchSets', lang)}
              title={t('searchSets', lang)}
            >
              <Search className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center justify-center rounded-xl border border-white/10 bg-abyssSoft/90 py-2.5 text-slate-400 transition hover:border-gold/30 hover:text-goldSoft"
              aria-label={t('expandSidebar', lang)}
              aria-expanded={expanded}
              title={t('expandSidebar', lang)}
            >
              <ChevronsRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="lg:hidden">
            <SearchBar value={query} onChange={onQueryChange} lang={lang} />
          </div>
        </>
      )}
      <div className={`flex items-center justify-between px-1 ${expanded ? '' : 'lg:hidden'}`}>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gold/80">{t('sets', lang)}</h2>
        <span className="text-xs text-slate-500">{sets.length}</span>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {sets.length === 0 && (
          <p className={`rounded-xl border border-white/10 bg-abyssSoft/60 p-4 text-sm text-slate-400 ${expanded ? '' : 'lg:hidden'}`}>
            {t('noResults', lang)}
          </p>
        )}
        {sets.map((set) => {
          const active = set.id === selectedId
          return (
            <button
              key={set.id}
              type="button"
              onClick={() => onSelect(set.id)}
              title={expanded ? undefined : set.name[lang]}
              aria-label={set.name[lang]}
              className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                expanded ? '' : 'lg:justify-center lg:gap-0 lg:p-2'
              } ${
                active
                  ? 'border-gold/60 bg-gold/10 shadow-glow'
                  : 'border-white/10 bg-abyssSoft/60 hover:border-gold/30 hover:bg-abyssCard'
              }`}
            >
              <Avatar src={set.imageUrl || set.iconUrl} alt={set.name[lang]} size="md" />
              <span className={`min-w-0 flex-1 ${expanded ? '' : 'lg:hidden'}`}>
                <span className={`line-clamp-2 block text-base font-semibold leading-snug ${active ? 'text-goldSoft' : 'text-slate-100'}`}>{set.name[lang]}</span>
                <span className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Star className="h-3 w-3 text-gold/80" aria-hidden /> {set.rarity}★
                  <span className="text-slate-600">•</span>
                  {set.characters.length} {t('characters', lang)}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
