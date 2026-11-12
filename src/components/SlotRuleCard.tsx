import { CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react'
import type { ArtifactSetTriage, SlotTriageRule, Verdict } from '../types/artifacts'
import type { Lang } from '../lib/i18n'
import { UI, t } from '../lib/i18n'
import { isFlatStat, statLabel } from '../lib/stats'
import { Avatar } from './Avatar'

const VERDICT_STYLES: Record<Verdict, { border: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  MUST_KEEP: { border: 'border-emeraldKeep/40', bg: 'bg-emeraldKeep/10', text: 'text-emeraldKeep', icon: CheckCircle2 },
  SITUATIONAL_KEEP: { border: 'border-amberNiche/40', bg: 'bg-amberNiche/10', text: 'text-amberNiche', icon: AlertTriangle },
  SAFE_DISCARD: { border: 'border-coralDiscard/40', bg: 'bg-coralDiscard/10', text: 'text-coralDiscard', icon: Trash2 },
}

interface SlotRuleCardProps {
  set: ArtifactSetTriage
  rule: SlotTriageRule
  lang: Lang
}

export function SlotRuleCard({ set, rule, lang }: SlotRuleCardProps) {
  const style = VERDICT_STYLES[rule.verdict]
  const Icon = style.icon
  const users = rule.usedBy
    .map((id) => set.characters.find((character) => (character.archetypeId ?? character.characterId) === id))
    .filter((character): character is NonNullable<typeof character> => Boolean(character))
  const singleUser = users.length === 1
  const visibleSubstats = rule.substats.filter((stat) => stat.name !== rule.mainStat && !isFlatStat(stat.name))

  return (
    <article className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold text-slate-100">{statLabel(rule.mainStat, lang)}</h4>
          <p className={`mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest ${style.text}`}>
            <Icon className="h-4 w-4" aria-hidden />
            {UI.verdict[rule.verdict][lang]}
          </p>
        </div>
      </div>

      {users.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('usedBy', lang)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {users.map((character, index) => (
              <span
                key={character.archetypeId ?? character.characterId}
                className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 text-sm text-slate-200 ${
                  character.tier === 'Alternative'
                    ? 'border-amberNiche/40 bg-abyss/50'
                    : 'border-white/10 bg-abyss/60'
                }`}
                title={`${character.name[lang]}${character.archetypeLabel ? ` (${character.archetypeLabel[lang]})` : ''} (${UI.usage[character.usageType][lang]})`}
              >
                <Avatar src={character.iconUrl} alt={character.name[lang]} />
                {!singleUser && <span className="text-xs font-bold tabular-nums text-gold/80">{index + 1}.</span>}
                <span className="max-w-28 truncate">{character.name[lang]}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {visibleSubstats.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{t('targetSubstats', lang)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleSubstats.map((stat) => {
              const indices = stat.characters
                .map((id) => rule.usedBy.indexOf(id) + 1)
                .filter((index) => index > 0)
              const owners = stat.characters
                .map((id) => {
                  const u = users.find((character) => (character.archetypeId ?? character.characterId) === id)
                  return u ? (u.archetypeLabel ? `${u.name[lang]} (${u.archetypeLabel[lang]})` : u.name[lang]) : null
                })
                .filter((name): name is string => Boolean(name))
              const usedByAll = users.length > 1 && users.every((user) => stat.characters.includes(user.archetypeId ?? user.characterId))
              const numericBadge = indices.join(', ')
              let badge = usedByAll ? t('allUsers', lang) : numericBadge
              if (!usedByAll && indices.length > 6) {
                const missing = users
                  .map((user, index) => ({ user, index: index + 1 }))
                  .filter(({ user }) => !stat.characters.includes(user.archetypeId ?? user.characterId))
                const alternative =
                  missing.length === 1
                    ? `${t('allBut', lang)} ${missing[0].user.name[lang]}${missing[0].user.archetypeLabel ? ` (${missing[0].user.archetypeLabel[lang]})` : ''}`
                    : missing.length > 1
                      ? `${t('allBut', lang)} ${missing.map(({ index }) => index).join(', ')}`
                      : ''
                if (alternative && alternative.length < numericBadge.length) {
                  badge = alternative
                }
              }
              return (
                <span key={stat.name} className="inline-flex items-center gap-2 rounded-lg border border-gold/20 bg-abyss/50 px-3 py-1.5 text-xl font-medium text-goldSoft">
                  {!singleUser && indices.length > 0 && (
                    <span
                      className="inline-flex min-w-7 items-center justify-center rounded-md border border-gold/25 bg-gold/15 px-1.5 py-0.5 text-sm font-bold leading-none text-goldSoft"
                      title={owners.join(', ')}
                    >
                      {badge}
                    </span>
                  )}
                  {statLabel(stat.name, lang)}
                </span>
              )
            })}
          </div>
        </div>
      )}

    </article>
  )
}
