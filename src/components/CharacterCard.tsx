import { ExternalLink } from 'lucide-react'
import type { CharacterUsage } from '../types/artifacts'
import type { Lang } from '../lib/i18n'
import { UI, t } from '../lib/i18n'
import { statLabel } from '../lib/stats'
import { Avatar } from './Avatar'

const TIER_STYLES = {
  BiS: 'border-gold/40 bg-gold/10 text-goldSoft',
  Alternative: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
} as const

interface CharacterCardProps {
  character: CharacterUsage
  lang: Lang
}

export function CharacterCard({ character, lang }: CharacterCardProps) {
  const source = character.sourceValidation
  const genshinBuildsUrl = `https://genshin-impact-helper-team.github.io/genshin-builds/${lang}/${character.characterId}`
  const substatsText = character.substatsPriority
    .map((stat, index, stats) => {
      const next = stats[index + 1]
      const critTie =
        character.critTie &&
        ((stat === 'CRIT Rate' && next === 'CRIT DMG') || (stat === 'CRIT DMG' && next === 'CRIT Rate'))
      const label =
        stat === 'ER%' && character.erUntilRequirement
          ? `${statLabel(stat, lang)} (${UI.erUntilRequirement[lang]})`
          : statLabel(stat, lang)
      return `${label}${next ? (critTie ? ' ≈ ' : ' > ') : ''}`
    })
    .join('')

  return (
    <article className="rounded-2xl border border-white/10 bg-abyssSoft/70 p-4 transition hover:border-gold/30">
      <div className="flex items-start gap-3">
        <Avatar src={character.iconUrl} alt={character.name[lang]} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-100">{character.name[lang]}</h3>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TIER_STYLES[character.tier]}`}>
              {UI.tier[character.tier][lang]}
            </span>
            <span className="text-[11px] font-medium text-slate-500">{UI.usage[character.usageType][lang]}</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">{character.element}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        {(['sands', 'goblet', 'circlet'] as const).map((slot) => (
          <div key={slot} className="rounded-lg border border-white/5 bg-abyss/50 p-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t(slot, lang)}</p>
            <p className="mt-1 text-slate-200">{character.mainStats[slot].map((stat) => statLabel(stat, lang)).join(' / ') || '—'}</p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{t('substats', lang)}</p>
        <p className="mt-1 text-sm text-goldSoft">{substatsText}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 border-t border-white/5 pt-3">
        <a
          href={genshinBuildsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Genshin Impact Helper Team (GitHub Pages)"
          className="inline-flex items-center gap-1 text-[11px] text-gold/70 hover:text-gold"
        >
          Genshin-Builds (Genshin Impact Helper Team) <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
        {source.kqmUrl && (
          <a
            href={source.kqmUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="KeqingMains Quickguide"
            className="inline-flex items-center gap-1 text-[11px] text-gold/70 hover:text-gold"
          >
            KQM Quickguide <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        )}
      </div>
    </article>
  )
}
