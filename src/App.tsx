import { useEffect, useMemo, useState } from 'react'
import type { ArtifactSetTriage, TriageDataset } from './types/artifacts'
import type { Lang } from './lib/i18n'
import { t } from './lib/i18n'
import { LanguageToggle } from './components/LanguageToggle'
import { SetDetail } from './components/SetDetail'
import { SetSidebar } from './components/SetSidebar'

const LANG_KEY = 'genshin-artifact-triage:lang'

function getInitialLang(): Lang {
  const queryLang = new URLSearchParams(window.location.search).get('lang')
  if (queryLang === 'en' || queryLang === 'es') return queryLang
  try {
    const stored = localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    // ignore unavailable storage
  }
  return 'es'
}

function matchesQuery(set: ArtifactSetTriage, query: string): boolean {
  const term = query.trim().toLowerCase()
  if (!term) return true
  const haystack = [
    set.id,
    set.name.en,
    set.name.es,
    ...set.characters.flatMap((character) => [
      character.name.en,
      character.name.es,
      character.role.en,
      character.role.es,
      character.element,
    ]),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

export default function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang)
  const [dataset, setDataset] = useState<TriageDataset | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // ignore unavailable storage
    }
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/artifacts-triage.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<TriageDataset>
      })
      .then((data) => {
        if (cancelled) return
        setDataset(data)
        setSelectedId((current) => current ?? data.sets[0]?.id ?? null)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSets = useMemo(() => {
    if (!dataset) return []
    return dataset.sets.filter((set) => matchesQuery(set, query))
  }, [dataset, query])

  const effectiveSelectedId =
    selectedId && filteredSets.some((set) => set.id === selectedId) ? selectedId : filteredSets[0]?.id ?? null
  const selectedSet = dataset?.sets.find((set) => set.id === effectiveSelectedId) ?? null

  return (
    <div className="min-h-screen bg-abyss text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(211,188,142,0.13),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(78,120,180,0.12),transparent_30%)]" aria-hidden />
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-abyss/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 shadow-glow">
              <img src="/favicon.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-lg leading-tight text-goldSoft sm:text-xl">{t('appTitle', lang)}</h1>
              <p className="text-xs text-slate-400">{t('appSubtitle', lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-white/10 bg-abyssSoft/70 px-3 py-1 text-[11px] text-slate-400 md:inline-flex">{t('mvpNote', lang)}</span>
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
        {!dataset && !error && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="animate-pulse rounded-2xl border border-gold/20 bg-abyssSoft/70 px-5 py-3 text-sm text-goldSoft">{t('loading', lang)}</p>
          </div>
        )}
        {error && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="rounded-2xl border border-coralDiscard/30 bg-coralDiscard/10 px-5 py-3 text-sm text-coralDiscard">{t('loadError', lang)}</p>
          </div>
        )}
        {dataset && (
          <div className={`grid gap-5 ${sidebarExpanded ? 'lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]' : 'lg:grid-cols-[88px_minmax(0,1fr)] xl:grid-cols-[96px_minmax(0,1fr)]'}`}>
            <div className="min-w-0 lg:sticky lg:top-[76px] lg:h-[calc(100vh-96px)]">
              <SetSidebar
                sets={filteredSets}
                selectedId={effectiveSelectedId}
                onSelect={(id) => {
                  setSelectedId(id)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                query={query}
                onQueryChange={setQuery}
                lang={lang}
                expanded={sidebarExpanded}
                onExpand={() => setSidebarExpanded(true)}
                onToggle={() => setSidebarExpanded((current) => !current)}
              />
            </div>
            <div className="min-w-0">
              {selectedSet ? (
                <SetDetail set={selectedSet} lang={lang} />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-abyssSoft/60 p-6 text-sm text-slate-400">{t('noResults', lang)}</p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="relative border-t border-white/5 px-4 py-5 text-xs text-slate-400 sm:px-6">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p>
            {t('footerDataFrom', lang)}{' '}
            <a
              href="https://genshin-impact-helper-team.github.io/genshin-builds/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-goldSoft hover:decoration-gold/40"
            >
              Genshin-Builds
            </a>{' '}
            {t('footerAnd', lang)}{' '}
            <a
              href="https://keqingmains.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-goldSoft hover:decoration-gold/40"
            >
              KeqingMains
            </a>
            .
          </p>
          <p className="text-slate-500">{t('footerDisclaimer', lang)}</p>
        </div>
      </footer>
    </div>
  )
}
