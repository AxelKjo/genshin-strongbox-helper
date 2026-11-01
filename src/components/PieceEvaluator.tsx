import { useMemo, useState } from 'react'
import { Sparkles, Trash2 } from 'lucide-react'
import type { ArtifactSetTriage, SlotKey, StatKey } from '../types/artifacts'
import type { Lang } from '../lib/i18n'
import { UI, t } from '../lib/i18n'
import { STAT_LABELS, statLabel } from '../lib/stats'
import { Avatar } from './Avatar'

const SLOTS: SlotKey[] = ['sands', 'goblet', 'circlet']
const ALL_STATS = Object.keys(STAT_LABELS) as StatKey[]
const SUBSTAT_ORDER: StatKey[] = [
  'CRIT Rate', 'CRIT DMG', 'ER%', 'EM', 'ATK%', 'HP%', 'DEF%',
  'ATK', 'HP', 'DEF', 'Healing Bonus', 'Pyro DMG%', 'Hydro DMG%', 'Cryo DMG%',
  'Electro DMG%', 'Anemo DMG%', 'Geo DMG%', 'Dendro DMG%', 'Physical DMG%',
]
const SUBSTAT_OPTIONS = SUBSTAT_ORDER.filter((stat) => ALL_STATS.includes(stat))

interface PieceEvaluatorProps {
  set: ArtifactSetTriage
  lang: Lang
}

export function PieceEvaluator({ set, lang }: PieceEvaluatorProps) {
  const [slot, setSlot] = useState<SlotKey>('sands')
  const [mainStat, setMainStat] = useState<StatKey | ''>('')
  const [substats, setSubstats] = useState<StatKey[]>([])

  const rules = set.slotRules[slot]
  const availableMainStats = rules.map((rule) => rule.mainStat)
  const substatOptions = mainStat ? SUBSTAT_OPTIONS.filter((stat) => stat !== mainStat) : SUBSTAT_OPTIONS

  const results = useMemo(() => {
    if (!mainStat) return []
    return set.characters
      .filter((character) => character.mainStats[slot].includes(mainStat))
      .map((character) => ({
        character,
        score: substats.filter((stat) => character.substatsPriority.includes(stat)).length,
      }))
      .sort((a, b) => b.score - a.score || a.character.name[lang].localeCompare(b.character.name[lang]))
  }, [mainStat, set.characters, slot, substats, lang])

  const usefulResults = substats.length > 0 ? results.filter((result) => result.score > 0) : results
  const rule = rules.find((entry) => entry.mainStat === mainStat)

  function toggleSubstat(stat: StatKey) {
    setSubstats((current) => {
      if (current.includes(stat)) return current.filter((value) => value !== stat)
      if (current.length >= 3) return [...current.slice(1), stat]
      return [...current, stat]
    })
  }

  return (
    <section className="rounded-3xl border border-gold/20 bg-abyssCard/70 p-5 shadow-glow">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl text-goldSoft">
            <Sparkles className="h-5 w-5 text-gold" aria-hidden />
            {t('evaluator', lang)}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">{t('evaluatorHelp', lang)}</p>
        </div>
        {rule && (
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
              rule.verdict === 'MUST_KEEP'
                ? 'border-emeraldKeep/40 bg-emeraldKeep/10 text-emeraldKeep'
                : rule.verdict === 'SITUATIONAL_KEEP'
                  ? 'border-amberNiche/40 bg-amberNiche/10 text-amberNiche'
                  : 'border-coralDiscard/40 bg-coralDiscard/10 text-coralDiscard'
            }`}
          >
            {UI.verdict[rule.verdict][lang]}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('slot', lang)}</p>
          <div className="flex rounded-xl border border-white/10 bg-abyss/50 p-1">
            {SLOTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSlot(option)
                  setMainStat('')
                  setSubstats([])
                }}
                className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-semibold transition ${
                  slot === option ? 'bg-gold text-abyss' : 'text-slate-300 hover:text-gold'
                }`}
              >
                {t(option, lang)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('mainStat', lang)}</p>
          <select
            value={mainStat}
            onChange={(event) => {
              const next = event.target.value as StatKey | ''
              setMainStat(next)
              if (next) setSubstats((current) => current.filter((stat) => stat !== next))
            }}
            className="w-full rounded-xl border border-white/10 bg-abyss/50 px-3 py-2 text-sm text-slate-100 outline-none focus:border-gold/60"
          >
            <option value="">—</option>
            {availableMainStats.map((stat) => (
              <option key={stat} value={stat}>
                {statLabel(stat, lang)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('pickSubstats', lang)} ({substats.length}/3)</p>
          <div className="flex max-h-28 flex-wrap gap-1 overflow-y-auto pr-1">
            {substatOptions.map((stat) => {
              const active = substats.includes(stat)
              return (
                <button
                  key={stat}
                  type="button"
                  onClick={() => toggleSubstat(stat)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                    active
                      ? 'border-gold/60 bg-gold/15 text-goldSoft'
                      : 'border-white/10 bg-abyss/40 text-slate-400 hover:border-gold/30 hover:text-slate-200'
                  }`}
                >
                  {statLabel(stat, lang)}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-abyss/40 p-4">
        {!mainStat && <p className="text-base text-slate-400">{t('evaluatorEmpty', lang)}</p>}
        {mainStat && usefulResults.length === 0 && (
          <p className="flex items-start gap-2 text-base text-coralDiscard">
            <Trash2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {t('evaluatorNone', lang)}
          </p>
        )}
        {mainStat && usefulResults.length > 0 && (
          <>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emeraldKeep">{t('evaluatorGood', lang)}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {usefulResults.map(({ character, score }) => (
                <div key={character.characterId} className="flex items-center gap-2 rounded-xl border border-white/10 bg-abyssSoft/80 p-2">
                  <Avatar src={character.iconUrl} alt={character.name[lang]} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">{character.name[lang]}</p>
                    <p className="truncate text-[11px] text-slate-400">{character.role[lang]}</p>
                  </div>
                  {substats.length > 0 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        score > 0 ? 'bg-emeraldKeep/15 text-emeraldKeep' : 'bg-slate-700/60 text-slate-300'
                      }`}
                    >
                      {score}/{substats.length}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
