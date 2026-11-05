import { useEffect, useMemo, useState } from 'react'
import type { ArtifactSetTriage, TriageDataset } from './types/artifacts'
import type { Lang } from './lib/i18n'
import { FOOTER_ATTRIBUTION, t } from './lib/i18n'
import { LanguageToggle } from './components/LanguageToggle'
import { ReverseOrderToggle } from './components/ReverseOrderToggle'
import { SetDetail } from './components/SetDetail'
import { SetSidebar } from './components/SetSidebar'

const LANG_KEY = 'genshin-artifact-triage:lang'
const SHELL_WIDTH = 'mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8'

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

function compareSetsByRelease(a: ArtifactSetTriage, b: ArtifactSetTriage): number {
  return b.releaseVersion.major - a.releaseVersion.major || b.releaseVersion.minor - a.releaseVersion.minor
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
  const [reverseOrder, setReverseOrder] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => window.matchMedia('(min-width: 1536px)').matches,
  )

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
        const sets = [...data.sets].sort(compareSetsByRelease)
        setDataset({ ...data, sets })
        setSelectedId((current) => current ?? sets[0]?.id ?? null)
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
    <div className="min-h-screen overflow-x-clip bg-abyss text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(211,188,142,0.13),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(78,120,180,0.12),transparent_30%)]" aria-hidden />
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-abyss/90 backdrop-blur-xl">
        <div className={`${SHELL_WIDTH} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/25 shadow-glow">
              <img src="/favicon.png" alt="" className="h-7 w-7 object-contain" aria-hidden />
            </span>
            <div>
              <h1 className="font-display text-lg leading-tight text-goldSoft sm:text-xl">{t('appTitle', lang)}</h1>
              <p className="text-xs text-slate-400">{t('appSubtitle', lang)}</p>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <ReverseOrderToggle lang={lang} checked={reverseOrder} onChange={setReverseOrder} />
            <LanguageToggle lang={lang} onChange={setLang} />
          </div>
        </div>
      </header>

      <main className={`relative ${SHELL_WIDTH} py-5`}>
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
          <div
            className={`grid gap-5 xl:gap-6 ${
              sidebarExpanded
                ? 'lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)]'
                : 'lg:grid-cols-[96px_minmax(0,1fr)] xl:grid-cols-[104px_minmax(0,1fr)]'
            }`}
          >
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
                <SetDetail set={selectedSet} lang={lang} reverseOrder={reverseOrder} />
              ) : (
                <p className="rounded-2xl border border-white/10 bg-abyssSoft/60 p-6 text-sm text-slate-400">{t('noResults', lang)}</p>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="relative border-t border-white/5 py-5 text-xs text-slate-400">
        <div className={`${SHELL_WIDTH} flex flex-col items-center gap-3 text-center`}>
          <p className="max-w-4xl leading-relaxed">
            {FOOTER_ATTRIBUTION[lang].before}
            <a
              href="https://genshin-impact-helper-team.github.io/genshin-builds/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-goldSoft hover:decoration-gold/40"
            >
              Genshin-Builds (Genshin Impact Helper Team)
            </a>
            {FOOTER_ATTRIBUTION[lang].between}
            <a
              href="https://keqingmains.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-300 underline decoration-white/20 underline-offset-2 transition-colors hover:text-goldSoft hover:decoration-gold/40"
            >
              KeqingMains (KQM)
            </a>
            {FOOTER_ATTRIBUTION[lang].after}
          </p>
          <p className="text-slate-500">{t('footerDisclaimer', lang)}</p>
        </div>
      </footer>
    </div>
  )
}
