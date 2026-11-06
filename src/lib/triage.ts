import type {
  ArtifactSetTriage,
  CharacterUsage,
  LocalizedText,
  SlotKey,
  SlotTriageRule,
  StatKey,
  Verdict,
} from '../types/artifacts'
import { SLOT_MAIN_STATS, isFlatStat, statLabel } from './stats'

function joinLocalized(values: LocalizedText[], lang: 'en' | 'es'): string {
  return values.map((value) => value[lang]).join(', ')
}

function uniqueStats(stats: StatKey[]): StatKey[] {
  return [...new Set(stats)]
}

export function buildSlotRules(
  characters: CharacterUsage[],
  slot: SlotKey,
): SlotTriageRule[] {
  return SLOT_MAIN_STATS[slot].map((mainStat) => {
    const users = characters.filter((character) => character.mainStats[slot].includes(mainStat))
    const usedBy = users.map((character) => character.characterId)
    let verdict: Verdict = 'SAFE_DISCARD'
    if (users.length > 0) {
      verdict = users.some((character) => character.usageType === '4pc BiS') || users.length >= 3
        ? 'MUST_KEEP'
        : 'SITUATIONAL_KEEP'
    }

    const substatUsers = new Map<StatKey, string[]>()
    for (const character of users) {
      for (const stat of character.substatsPriority) {
        if (stat === mainStat || isFlatStat(stat)) continue
        const owners = substatUsers.get(stat)
        if (owners) {
          if (!owners.includes(character.characterId)) owners.push(character.characterId)
        } else {
          substatUsers.set(stat, [character.characterId])
        }
      }
    }
    const substats = [...substatUsers.entries()]
      .map(([name, characterIds], index) => ({ name, characters: characterIds, index }))
      .sort((a, b) => b.characters.length - a.characters.length || a.index - b.index)
      .map(({ name, characters: characterIds }) => ({ name, characters: characterIds }))

    return { mainStat, verdict, substats, usedBy }
  })
}

export function buildFlowerAndPlume(characters: CharacterUsage[]) {
  const combos = new Map<string, { substats: StatKey[]; usedBy: string[]; names: LocalizedText[] }>()
  for (const character of characters) {
    const stats = uniqueStats(
      character.substatsPriority.filter((stat) => !isFlatStat(stat)),
    )
    if (stats.length === 0) continue
    const key = stats.join('|')
    const existing = combos.get(key)
    if (existing) {
      if (!existing.usedBy.includes(character.characterId)) {
        existing.usedBy.push(character.characterId)
        existing.names.push(character.name)
      }
    } else {
      combos.set(key, { substats: stats, usedBy: [character.characterId], names: [character.name] })
    }
  }
  return {
    keepCombinations: [...combos.values()].slice(0, 8).map((combo) => ({
      substats: combo.substats,
      usedBy: combo.usedBy,
      reasoning: {
        en: `${joinLocalized(combo.names, 'en')} can use ${combo.substats.map((stat) => statLabel(stat, 'en')).join(' + ')} on this set's Flower and Plume.`,
        es: `${joinLocalized(combo.names, 'es')} busca(n) ${combo.substats.map((stat) => statLabel(stat, 'es')).join(' + ')} en la Flor y la Pluma de este set.`,
      },
    })),
  }
}

export function filterSetAlternativeBuilds(set: ArtifactSetTriage): ArtifactSetTriage {
  const bisCharacters = set.characters.filter((character) => character.tier !== 'Alternative')
  if (bisCharacters.length === set.characters.length) {
    return set
  }
  return {
    ...set,
    characters: bisCharacters,
    slotRules: {
      sands: buildSlotRules(bisCharacters, 'sands'),
      goblet: buildSlotRules(bisCharacters, 'goblet'),
      circlet: buildSlotRules(bisCharacters, 'circlet'),
    },
    flowerAndPlumeRules: buildFlowerAndPlume(bisCharacters),
  }
}
