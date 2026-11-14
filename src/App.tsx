import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronsUp, Settings } from 'lucide-react'
import type { ArtifactSetTriage, TriageDataset } from './types/artifacts'
import type { Lang } from './lib/i18n'
import { FOOTER_ATTRIBUTION, t } from './lib/i18n'
import { filterSetAlternativeBuilds } from './lib/triage'
import { resolveAssetUrl } from './lib/assets'
import { ExcludeAlternativeToggle } from './components/ExcludeAlternativeToggle'
import { CriteriaPopover } from './components/CriteriaPopover'
import { LanguageToggle } from './components/LanguageToggle'
import { ReverseOrderToggle } from './components/ReverseOrderToggle'
import { CompactMatrixToggle } from './components/CompactMatrixToggle'
import { SetDetail } from './components/SetDetail'
import { SetSidebar } from './components/SetSidebar'

const LANG_KEY = 'genshin-artifact-triage:lang'
const SETTINGS_OPEN_KEY = 'genshin-artifact-triage:settings-open'
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

function getInitialSettingsOpen(): boolean {
  try {
    const stored = localStorage.getItem(SETTINGS_OPEN_KEY)
    if (stored !== null) return stored === 'true'
  } catch {
    // ignore unavailable storage
  }
  return true
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
  const [excludeAlternative, setExcludeAlternative] = useState(false)
  const [reverseOrder, setReverseOrder] = useState(false)
  const [compactMatrix, setCompactMatrix] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(getInitialSettingsOpen)
  const [sidebarExpanded, setSidebarExpanded] = useState(
    () => window.matchMedia('(min-width: 1536px)').matches,
  )
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_OPEN_KEY, String(settingsOpen))
    } catch {
      // ignore unavailable storage
    }
  }, [settingsOpen])

  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`)
    }
    updateHeaderHeight()
    const observer = new ResizeObserver(updateHeaderHeight)
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!settingsOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settingsOpen])

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

  const processedSets = useMemo(() => {
    if (!dataset) return []
    if (!excludeAlternative) return dataset.sets
    return dataset.sets.map(filterSetAlternativeBuilds)
  }, [dataset, excludeAlternative])

  const filteredSets = useMemo(() => {
    return processedSets.filter((set) => matchesQuery(set, query))
  }, [processedSets, query])

  const effectiveSelectedId =
    selectedId && filteredSets.some((set) => set.id === selectedId) ? selectedId : filteredSets[0]?.id ?? null
  const selectedSet = processedSets.find((set) => set.id === effectiveSelectedId) ?? null

  return (
    <div className="min-h-screen overflow-x-clip bg-abyss text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(211,188,142,0.13),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(78,120,180,0.12),transparent_30%)]" aria-hidden />
      <header
        ref={headerRef}
        className="sticky top-0 z-20 border-b border-gold/15 bg-abyss/90 backdrop-blur-xl"
      >
        <div className={`${SHELL_WIDTH} flex flex-wrap items-center justify-between gap-3 py-3`}>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-gold/25 shadow-glow">
              <img src={resolveAssetUrl('/favicon.png')} alt="" className="h-7 w-7 object-contain" aria-hidden />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-lg leading-tight text-goldSoft sm:text-xl">{t('appTitle', lang)}</h1>
                <CriteriaPopover lang={lang} />
              </div>
              <p className="text-xs text-slate-400">{t('appSubtitle', lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <LanguageToggle lang={lang} onChange={setLang} />
            <button
              type="button"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-expanded={settingsOpen}
              aria-label={t('settings', lang)}
              title={t('settings', lang)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                settingsOpen
                  ? 'border-gold/40 bg-gold/25 text-gold shadow-glow'
                  : 'border-gold/25 bg-abyssSoft/80 text-gold/70 hover:border-gold/35 hover:bg-gold/15 hover:text-gold'
              }`}
            >
              <Settings
                className={`h-5 w-5 transition-transform duration-300 ${
                  settingsOpen ? 'rotate-90 text-gold' : ''
                }`}
                aria-hidden
              />
            </button>
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows,border-color] duration-200 ease-out border-t ${
            settingsOpen
              ? 'grid-rows-[1fr] border-gold/10'
              : 'grid-rows-[0fr] border-transparent'
          }`}
          inert={!settingsOpen}
        >
          <div className="overflow-hidden bg-abyssSoft/50 backdrop-blur-md">
            <div className={`${SHELL_WIDTH} flex flex-wrap items-center justify-end gap-2.5 py-2.5 sm:gap-3 sm:py-3`}>
              <ExcludeAlternativeToggle
                lang={lang}
                checked={excludeAlternative}
                onChange={setExcludeAlternative}
              />
              <ReverseOrderToggle lang={lang} checked={reverseOrder} onChange={setReverseOrder} />
              <CompactMatrixToggle lang={lang} checked={compactMatrix} onChange={setCompactMatrix} />
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-abyssSoft/70 px-3.5 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-gold/30 hover:bg-gold/10 hover:text-goldSoft sm:px-4 sm:py-2 sm:text-sm"
              >
                <ChevronsUp className="h-4 w-4" aria-hidden />
                <span>{t('hide', lang)}</span>
              </button>
            </div>
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
            <div className="min-w-0 lg:sticky lg:top-[calc(var(--header-height)+12px)] lg:h-[calc(100vh-var(--header-height)-32px)]">
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
                <SetDetail
                  set={selectedSet}
                  lang={lang}
                  reverseOrder={reverseOrder}
                  compactMatrix={compactMatrix}
                />
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