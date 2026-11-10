import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
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
}

export function SetDetail({ set, lang, reverseOrder }: SetDetailProps) {
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
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {lang === 'en'
                    ? 'No current user of this set wants these main stats on this slot. Recycle them unless the substats make them a solid off-piece.'
                    : 'Ningún personaje actual de este set quiere estas estadísticas principales en esta pieza. Recíclalas salvo que las subestadísticas las conviertan en una buena pieza externa.'}
                </p>
              </article>
            ) : null
            return (
              <div key={slot} className="space-y-3">
                <h3 className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                  <img src={`/icons/slots/${slot}.svg`} alt={t(slot, lang)} className="h-6 w-6 object-contain" />
                  {t(slot, lang)}
                </h3>
                {!reverseOrder && discardBlock}
                {keepRules.map((rule) => (
                  <SlotRuleCard key={rule.mainStat} set={set} rule={rule} lang={lang} />
                ))}
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
              .map((id) => set.characters.find((character) => character.characterId === id))
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
                      key={character.characterId}
                      title={`${character.name[lang]} (${UI.usage[character.usageType][lang]})`}
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
        <div className="mb-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-xl text-goldSoft">{t('characterBreakdown', lang)}</h2>
            <span className="text-xs text-slate-500">{set.characters.length} {t('characters', lang)}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            * {t('characterBreakdownNote', lang)}
          </p>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {set.characters.map((character) => (
            <CharacterCard key={character.characterId} character={character} lang={lang} />
          ))}
        </div>
      </section>
    </div>
  )
}
