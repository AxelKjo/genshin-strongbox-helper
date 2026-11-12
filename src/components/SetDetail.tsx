import { useState } from 'react'
import { Asterisk, CheckCircle2, ChevronDown, Info, Trash2 } from 'lucide-react'
import type { ArtifactSetTriage } from '../types/artifacts'
import type { Lang } from '../lib/i18n'
import { t, UI } from '../lib/i18n'
import { isFlatStat, statLabel } from '../lib/stats'
import { Avatar } from './Avatar'
import { CharacterCard } from './CharacterCard'
import { SlotRuleCard } from './SlotRuleCard'

const VERDICT_ORDER = { MUST_KEEP: 0, SITUATIONAL_KEEP: 1, SAFE_DISCARD: 2 } as const

interface SetDetailProps {
  set: ArtifactSetTriage
  lang: Lang
  reverseOrder: boolean
  compactMatrix: boolean
}

export function SetDetail({ set, lang, reverseOrder, compactMatrix }: SetDetailProps) {
  const [showDescription, setShowDescription] = useState(false)
  const [artworkFailed, setArtworkFailed] = useState(false)
  const isFourStar = set.rarity === 4

  return (
    <div className="space-y-5">
      <header
        className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br from-abyssCard via-abyssSoft to-abyss ${
          isFourStar
            ? 'border-purple-400/30 shadow-glow-purple'
            : 'border-gold/20 shadow-glow'
        }`}
      >
        {!artworkFailed && (
          <img
            src={set.imageUrl}
            alt=""
            aria-hidden
            onError={() => setArtworkFailed(true)}
            className={`pointer-events-none absolute -right-5 top-1/2 h-36 w-36 max-w-none -translate-y-1/2 object-contain opacity-95 sm:-right-6 sm:h-52 sm:w-52 lg:-right-8 lg:h-60 lg:w-60 ${
              isFourStar
                ? 'drop-shadow-[0_0_28px_rgba(168,85,247,0.22)]'
                : 'drop-shadow-[0_0_28px_rgba(211,188,142,0.22)]'
            }`}
          />
        )}
        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6">
          <div className="min-w-0 flex-1 pr-24 sm:pr-40 lg:pr-48">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl text-goldSoft sm:text-3xl">{set.name[lang]}</h1>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${
                  isFourStar
                    ? 'border-purple-400/30 bg-purple-500/15 text-purple-300'
                    : 'border-gold/30 bg-gold/10 text-gold'
                }`}
              >
                {set.rarity}★
              </span>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowDescription((current) => !current)}
                aria-expanded={showDescription}
                aria-controls="set-description"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-abyss/40 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:border-gold/30 hover:text-goldSoft"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showDescription ? 'rotate-180' : ''}`}
                  aria-hidden
                />
                {t('description', lang)}
              </button>

              {showDescription && (
                <div id="set-description" className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-abyss/40 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">{t('twoPiece', lang)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-100 sm:text-base">{set.bonuses.twoPiece[lang]}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-abyss/40 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold">{t('fourPiece', lang)}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-100 sm:text-base">{set.bonuses.fourPiece[lang]}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(['sands', 'goblet', 'circlet'] as const).map((slot) => {
            const orderedRules = [...set.slotRules[slot]].sort(
              (a, b) => (VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict]) * (reverseOrder ? 1 : -1),
            )
            const keepRules = orderedRules.filter((rule) => rule.verdict !== 'SAFE_DISCARD')
            const discardRules = orderedRules.filter((rule) => rule.verdict === 'SAFE_DISCARD')
            const discardBlock = discardRules.length > 0 ? (
              <article className="rounded-2xl border border-coralDiscard/30 bg-coralDiscard/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-coralDiscard">
                  <Trash2 className="h-3.5 w-3.5" aria-hidden /> {t('safeDiscard', lang)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {discardRules.map((rule) => (
                    <span key={rule.mainStat} className="inline-flex items-center rounded-lg border border-coralDiscard/25 bg-abyss/50 px-3 py-1.5 text-xl font-medium text-coralDiscard/90">
                      {statLabel(rule.mainStat, lang)}
                    </span>
                  ))}
                </div>
                {!compactMatrix && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {lang === 'en'
                      ? 'No current user of this set wants these main stats on this slot. Recycle them unless the substats make them a solid off-piece.'
                      : 'Ningún personaje actual de este set quiere estas estadísticas principales en esta pieza. Recíclalas salvo que las subestadísticas las conviertan en una buena pieza externa.'}
                  </p>
                )}
              </article>
            ) : null
            const keepBlock = keepRules.length > 0 ? (
              <article className="rounded-2xl border border-emeraldKeep/30 bg-emeraldKeep/5 p-4">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emeraldKeep">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t('mustKeep', lang)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {keepRules.map((rule) => {
                    const users = rule.usedBy
                      .map((id) => set.characters.find((c) => (c.archetypeId ?? c.characterId) === id))
                      .filter((c): c is NonNullable<typeof c> => Boolean(c))
                    const isSituationalOnly =
                      users.length > 0 && users.every((c) => c.tier === 'Alternative')

                    return (
                      <span
                        key={rule.mainStat}
                        title={
                          isSituationalOnly
                            ? users.map((u) => `${u.name[lang]}${u.archetypeLabel ? ` (${u.archetypeLabel[lang]})` : ''} (${UI.usage[u.usageType][lang]})`).join(', ')
                            : undefined
                        }
                        className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xl font-medium ${
                          isSituationalOnly
                            ? 'border-amberNiche/30 bg-[#1b1d1e] text-amberNiche/75'
                            : 'border-emeraldKeep/25 bg-abyss/50 text-emeraldKeep/90'
                        }`}
                      >
                        {statLabel(rule.mainStat, lang)}
                      </span>
                    )
                  })}
                </div>
              </article>
            ) : null
            const keepContent = compactMatrix
              ? keepBlock
              : keepRules.map((rule) => (
                  <SlotRuleCard key={rule.mainStat} set={set} rule={rule} lang={lang} />
                ))
            return (
              <div key={slot} className="space-y-3">
                <h3 className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                  <img src={`/icons/slots/${slot}.svg`} alt={t(slot, lang)} className="h-6 w-6 object-contain" />
                  {t(slot, lang)}
                </h3>
                {!reverseOrder && discardBlock}
                {keepContent}
                {reverseOrder && discardBlock}
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-abyssSoft/60 p-5">
        <h2 className="flex items-center gap-2 font-display text-xl text-goldSoft">
          <span className="inline-flex items-center gap-1.5" aria-hidden>
            <img src="/icons/slots/flower.svg" alt="" className="h-6 w-6 object-contain" />
            <img src="/icons/slots/plume.svg" alt="" className="h-6 w-6 object-contain" />
          </span>
          {t('flowerPlume', lang)}
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {set.flowerAndPlumeRules.keepCombinations.map((combo, index) => {
            const users = combo.usedBy
              .map((id) => set.characters.find((character) => (character.archetypeId ?? character.characterId) === id))
              .filter((character): character is NonNullable<typeof character> => Boolean(character))
            return (
              <article key={`${combo.substats.join('-')}-${index}`} className="rounded-2xl border border-emeraldKeep/25 bg-emeraldKeep/5 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emeraldKeep">{t('keepCombinations', lang)}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {combo.substats.filter((stat) => !isFlatStat(stat)).map((stat) => (
                    <span key={stat} className="inline-flex items-center rounded-md border border-emeraldKeep/25 bg-abyss/50 px-2 py-1 text-sm text-emeraldKeep">
                      {statLabel(stat, lang)}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {users.map((character) => (
                    <span
                      key={character.archetypeId ?? character.characterId}
                      title={`${character.name[lang]}${character.archetypeLabel ? ` (${character.archetypeLabel[lang]})` : ''} (${UI.usage[character.usageType][lang]})`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-abyss/60 py-0.5 pl-0.5 pr-2 text-xs text-slate-200"
                    >
                      <Avatar src={character.iconUrl} alt={character.name[lang]} />
                      <span className="max-w-28 truncate">{character.name[lang]}</span>
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">{combo.reasoning[lang]}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl text-goldSoft">{t('characterBreakdown', lang)}</h2>
            <span className="text-xs text-slate-500">{set.characters.length} {t('characters', lang)}</span>
          </div>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-slate-400">
            <Asterisk className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span>{t('characterBreakdownNote', lang)}</span>
          </p>

          <div className="mt-3 space-y-2 rounded-xl border border-white/5 bg-abyssSoft/50 p-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-goldSoft">
                {UI.tier.BiS[lang]}
              </span>
              <p className="pt-0.5 leading-relaxed text-slate-300">
                {t('bisLegend', lang)}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
                {UI.tier.Alternative[lang]}
              </span>
              <p className="pt-0.5 leading-relaxed text-slate-300">
                {t('alternativeLegend', lang)}{' '}
                <span className="relative inline-flex items-center align-middle group/info">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full p-0.5 text-slate-400 transition hover:bg-white/10 hover:text-goldSoft focus:outline-none focus:ring-1 focus:ring-gold/40 cursor-help"
                    aria-label={lang === 'es' ? 'Más información sobre sets alternativos' : 'More information about alternative sets'}
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto mb-2 w-72 sm:w-80 rounded-xl border border-white/15 bg-abyssCard/95 p-3 text-xs leading-relaxed text-slate-200 shadow-2xl backdrop-blur-md opacity-0 transition-all duration-200 group-hover/info:opacity-100 group-hover/info:pointer-events-auto group-focus-within/info:opacity-100 group-focus-within/info:pointer-events-auto z-50 text-left font-normal"
                  >
                    {t('alternativeLegendTooltip', lang)}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {set.characters.map((character) => (
            <CharacterCard key={character.archetypeId ?? character.characterId} character={character} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  )
}
