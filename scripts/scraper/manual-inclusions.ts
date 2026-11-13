import type {
  CharacterUsage,
  SlotKey,
  StatKey,
  UsageTier,
  UsageType,
} from '../../src/types/artifacts'
import { characterImageUrl } from './config'

export interface CharacterSetAssignment {
  setId: string
  characterId: string
  tier: 'BiS' | 'Alternative'
  usageType: UsageType
  usage: CharacterUsage
}

export interface ResolvedCharacterBuild {
  characterId: string
  name: { en: string; es: string }
  element: string
  primarySource: 'KQM' | 'Genshin-Builds' | 'Both (Consensus)'
  gbVersion: string
  kqmVersion?: string
  resolutionReason: string
  assignments: CharacterSetAssignment[]
}

const AINO_USAGE: CharacterUsage = {
  characterId: 'aino',
  archetypeId: 'aino',
  name: {
    en: 'Aino',
    es: 'Aino',
  },
  iconUrl: '/images/characters/aino.png',
  element: 'Hydro',
  role: {
    en: 'Reaction Support',
    es: 'Soporte de reacciones',
  },
  usageType: '4pc BiS',
  tier: 'BiS',
  mainStats: {
    sands: ['ER%', 'EM'],
    goblet: ['EM'],
    circlet: ['EM', 'CRIT Rate'],
  },
  substatsPriority: ['ER%', 'EM', 'CRIT Rate'],
  critTie: false,
  erUntilRequirement: false,
  sourceValidation: {
    primarySource: 'Genshin-Builds',
    gbVersion: '7.1',
    kqmVersion: '6.0',
    resolutionReason: 'Genshin-Builds newer (7.1 > 6.0)',
    genshinBuildsUpdated: '7.1',
    kqmUrl: 'https://keqingmains.com/q/aino-quickguide/',
  },
}

/**
 * Whitelist for manually preserved standalone character builds (e.g. unindexed in external scrapers).
 */
export const MANUAL_CHARACTER_INCLUSIONS: Record<string, CharacterUsage[]> = {
  'silken-moons-serenade': [AINO_USAGE],
  'noblesse-oblige': [AINO_USAGE],
}

/**
 * Full Character-Level Build Overrides (executed BEFORE set inversion).
 * Used for deep re-architecting of character builds / archetypes (Ganyu, Keqing, Lynette).
 */
export const CHARACTER_BUILD_OVERRIDES: Record<
  string,
  (base: ResolvedCharacterBuild) => ResolvedCharacterBuild
> = {
  ganyu: (base) => {
    const assignments: CharacterSetAssignment[] = [
      // Freeze and Mono Cryo
      {
        setId: 'blizzard-strayer',
        characterId: 'ganyu',
        tier: 'BiS',
        usageType: '4pc BiS',
        usage: {
          characterId: 'ganyu',
          archetypeId: 'ganyu::freeze-mono-cryo',
          archetypeLabel: { en: 'Freeze and Mono Cryo', es: 'Freeze y Mono Cryo' },
          name: base.name,
          iconUrl: characterImageUrl('ganyu'),
          element: 'Cryo',
          role: { en: 'Freeze and Mono Cryo', es: 'Freeze y Mono Cryo' },
          usageType: '4pc BiS',
          tier: 'BiS',
          mainStats: {
            sands: ['ATK%'],
            goblet: ['Cryo DMG%'],
            circlet: ['CRIT DMG', 'ATK%'],
          },
          substatsPriority: ['ER%', 'CRIT DMG', 'CRIT Rate', 'ATK%'],
          critTie: true,
          erUntilRequirement: true,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype split: Freeze and Mono Cryo',
          },
        },
      },
      {
        setId: 'marechaussee-hunter',
        characterId: 'ganyu',
        tier: 'Alternative',
        usageType: '4pc Alternative',
        usage: {
          characterId: 'ganyu',
          archetypeId: 'ganyu::freeze-mono-cryo',
          archetypeLabel: { en: 'Freeze and Mono Cryo', es: 'Freeze y Mono Cryo' },
          name: base.name,
          iconUrl: characterImageUrl('ganyu'),
          element: 'Cryo',
          role: { en: 'Freeze and Mono Cryo', es: 'Freeze y Mono Cryo' },
          usageType: '4pc Alternative',
          tier: 'Alternative',
          mainStats: {
            sands: ['ATK%'],
            goblet: ['Cryo DMG%'],
            circlet: ['CRIT DMG', 'ATK%'],
          },
          substatsPriority: ['ER%', 'CRIT DMG', 'CRIT Rate', 'ATK%'],
          critTie: true,
          erUntilRequirement: true,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype split: Freeze and Mono Cryo',
          },
        },
      },
      // Melt
      {
        setId: 'unfinished-reverie',
        characterId: 'ganyu',
        tier: 'BiS',
        usageType: '4pc BiS',
        usage: {
          characterId: 'ganyu',
          archetypeId: 'ganyu::melt',
          archetypeLabel: { en: 'Melt', es: 'Melt' },
          name: base.name,
          iconUrl: characterImageUrl('ganyu'),
          element: 'Cryo',
          role: { en: 'Melt', es: 'Melt' },
          usageType: '4pc BiS',
          tier: 'BiS',
          mainStats: {
            sands: ['EM', 'ATK%'],
            goblet: ['Cryo DMG%'],
            circlet: ['CRIT Rate', 'CRIT DMG'],
          },
          substatsPriority: ['CRIT Rate', 'CRIT DMG', 'EM', 'ATK%'],
          critTie: true,
          erUntilRequirement: false,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype split: Melt',
          },
        },
      },
      {
        setId: 'wanderers-troupe',
        characterId: 'ganyu',
        tier: 'Alternative',
        usageType: '4pc Alternative',
        usage: {
          characterId: 'ganyu',
          archetypeId: 'ganyu::melt',
          archetypeLabel: { en: 'Melt', es: 'Melt' },
          name: base.name,
          iconUrl: characterImageUrl('ganyu'),
          element: 'Cryo',
          role: { en: 'Melt', es: 'Melt' },
          usageType: '4pc Alternative',
          tier: 'Alternative',
          mainStats: {
            sands: ['EM', 'ATK%'],
            goblet: ['Cryo DMG%'],
            circlet: ['CRIT Rate', 'CRIT DMG'],
          },
          substatsPriority: ['CRIT Rate', 'CRIT DMG', 'EM', 'ATK%'],
          critTie: true,
          erUntilRequirement: false,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype split: Melt',
          },
        },
      },
    ]

    return { ...base, assignments }
  },

  keqing: (base) => {
    const aggravateSets: { setId: string; usageType: UsageType; tier: UsageTier }[] = [
      { setId: 'thundering-fury', usageType: '4pc BiS', tier: 'BiS' },
      { setId: 'thundersoother', usageType: '4pc Alternative', tier: 'Alternative' },
      { setId: 'gladiators-finale', usageType: '2pc Alternative', tier: 'Alternative' },
      { setId: 'shimenawas-reminiscence', usageType: '2pc Alternative', tier: 'Alternative' },
      { setId: 'gilded-dreams', usageType: '2pc Alternative', tier: 'Alternative' },
      { setId: 'wanderers-troupe', usageType: '2pc Alternative', tier: 'Alternative' },
    ]

    const quickbloomSets: { setId: string; usageType: UsageType; tier: UsageTier }[] = [
      { setId: 'thundering-fury', usageType: '4pc BiS', tier: 'BiS' },
      { setId: 'gilded-dreams', usageType: '4pc Alternative', tier: 'Alternative' },
      { setId: 'flower-of-paradise-lost', usageType: '4pc Alternative', tier: 'Alternative' },
    ]

    const electroSets: { setId: string; usageType: UsageType; tier: UsageTier }[] = [
      { setId: 'thundersoother', usageType: '4pc BiS', tier: 'BiS' },
      { setId: 'night-of-the-skys-unveiling', usageType: '4pc Alternative', tier: 'Alternative' },
      { setId: 'gladiators-finale', usageType: '2pc Alternative', tier: 'Alternative' },
      { setId: 'shimenawas-reminiscence', usageType: '2pc Alternative', tier: 'Alternative' },
    ]

    const assignments: CharacterSetAssignment[] = []

    for (const s of aggravateSets) {
      assignments.push({
        setId: s.setId,
        characterId: 'keqing',
        tier: s.tier,
        usageType: s.usageType,
        usage: {
          characterId: 'keqing',
          archetypeId: 'keqing::aggravate-dps',
          archetypeLabel: { en: 'Aggravate DPS', es: 'DPS Aggravate' },
          name: base.name,
          iconUrl: characterImageUrl('keqing'),
          element: 'Electro',
          role: { en: 'Aggravate DPS', es: 'DPS Aggravate' },
          usageType: s.usageType,
          tier: s.tier,
          mainStats: {
            sands: ['ATK%', 'EM'],
            goblet: ['Electro DMG%'],
            circlet: ['CRIT Rate', 'CRIT DMG'],
          },
          substatsPriority: ['CRIT Rate', 'CRIT DMG', 'ATK%', 'EM'],
          critTie: true,
          erUntilRequirement: false,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype: Aggravate DPS',
          },
        },
      })
    }

    for (const s of quickbloomSets) {
      assignments.push({
        setId: s.setId,
        characterId: 'keqing',
        tier: s.tier,
        usageType: s.usageType,
        usage: {
          characterId: 'keqing',
          archetypeId: 'keqing::quickbloom-dps',
          archetypeLabel: { en: 'Quickbloom DPS', es: 'DPS Quickbloom' },
          name: base.name,
          iconUrl: characterImageUrl('keqing'),
          element: 'Electro',
          role: { en: 'Quickbloom DPS', es: 'DPS Quickbloom' },
          usageType: s.usageType,
          tier: s.tier,
          mainStats: {
            sands: ['EM', 'ATK%'],
            goblet: ['Electro DMG%'],
            circlet: ['CRIT Rate', 'CRIT DMG'],
          },
          substatsPriority: ['CRIT Rate', 'CRIT DMG', 'EM', 'ATK%'],
          critTie: true,
          erUntilRequirement: false,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype: Quickbloom DPS',
          },
        },
      })
    }

    for (const s of electroSets) {
      assignments.push({
        setId: s.setId,
        characterId: 'keqing',
        tier: s.tier,
        usageType: s.usageType,
        usage: {
          characterId: 'keqing',
          archetypeId: 'keqing::electro-dps',
          archetypeLabel: { en: 'Electro DPS', es: 'DPS Electro' },
          name: base.name,
          iconUrl: characterImageUrl('keqing'),
          element: 'Electro',
          role: { en: 'Electro DPS', es: 'DPS Electro' },
          usageType: s.usageType,
          tier: s.tier,
          mainStats: {
            sands: ['ATK%'],
            goblet: ['Electro DMG%'],
            circlet: ['CRIT Rate', 'CRIT DMG'],
          },
          substatsPriority: ['CRIT Rate', 'CRIT DMG', 'ATK%'],
          critTie: true,
          erUntilRequirement: false,
          sourceValidation: {
            primarySource: base.primarySource,
            gbVersion: base.gbVersion,
            kqmVersion: base.kqmVersion,
            resolutionReason: 'Manual archetype: Electro DPS',
          },
        },
      })
    }

    return { ...base, assignments }
  },

  lynette: (base) => {
    const usageBase: CharacterUsage = {
      characterId: 'lynette',
      archetypeId: 'lynette',
      archetypeLabel: undefined,
      name: base.name,
      iconUrl: characterImageUrl('lynette'),
      element: 'Anemo',
      role: { en: 'General Support / Damage Dealer', es: 'Soporte General / Damage Dealer' },
      usageType: '4pc BiS',
      tier: 'BiS',
      mainStats: {
        sands: ['ER%', 'ATK%'],
        goblet: ['Anemo DMG%'],
        circlet: ['CRIT Rate', 'CRIT DMG'],
      },
      substatsPriority: ['ER%', 'CRIT Rate', 'CRIT DMG', 'ATK%'],
      critTie: true,
      erUntilRequirement: true,
      sourceValidation: {
        primarySource: base.primarySource,
        gbVersion: base.gbVersion,
        kqmVersion: base.kqmVersion,
        resolutionReason: 'Manual unification: General Support without EM substats',
      },
    }

    const assignments: CharacterSetAssignment[] = [
      {
        setId: 'viridescent-venerer',
        characterId: 'lynette',
        tier: 'BiS',
        usageType: '4pc BiS',
        usage: { ...usageBase, usageType: '4pc BiS', tier: 'BiS' },
      },
      {
        setId: 'emblem-of-severed-fate',
        characterId: 'lynette',
        tier: 'Alternative',
        usageType: '4pc Alternative',
        usage: { ...usageBase, usageType: '4pc Alternative', tier: 'Alternative' },
      },
    ]

    return { ...base, assignments }
  },
}

export interface SetRemoval {
  setId: string
  characterId: string
  archetypeId?: string
}

export interface SetTierOverride {
  setId: string
  characterId: string
  archetypeId?: string
  usageType: UsageType
  tier: UsageTier
}

export interface SetAddition {
  setId: string
  characterId: string
  archetypeId?: string
  usageType: UsageType
  tier: UsageTier
  statOverrides?: Partial<Record<SlotKey, StatKey[]>>
  substatOverrides?: StatKey[]
}

export interface SetStatPatch {
  setIds: string[]
  characterId: string
  archetypeId?: string
  removeMainStats?: Partial<Record<SlotKey, StatKey[]>>
  removeSubstats?: StatKey[]
}

export const SET_REMOVALS: SetRemoval[] = [
  { setId: 'night-of-the-skys-unveiling', characterId: 'neuvillette' },
  { setId: 'scroll-of-the-hero-of-cinder-city', characterId: 'sucrose' },
]

export const SET_TIER_OVERRIDES: SetTierOverride[] = [
  {
    setId: 'gilded-dreams',
    characterId: 'aloy',
    archetypeId: 'aloy::reverse-melt-dps',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'aubade-of-morningstar-and-moon',
    characterId: 'columbina',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'golden-troupe',
    characterId: 'escoffier',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'silken-moons-serenade',
    characterId: 'nilou',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'noblesse-oblige',
    characterId: 'candace',
    archetypeId: 'candace::support',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'gladiators-finale',
    characterId: 'kamisato-ayato',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'tenacity-of-the-millelith',
    characterId: 'zhongli',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'noblesse-oblige',
    characterId: 'beidou',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
]

export const SET_ADDITIONS: SetAddition[] = [
  {
    setId: 'noblesse-oblige',
    characterId: 'baizhu',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'heart-of-the-furnace',
    characterId: 'beidou',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'emblem-of-severed-fate',
    characterId: 'candace',
    archetypeId: 'candace::support',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'noblesse-oblige',
    characterId: 'escoffier',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'scroll-of-the-hero-of-cinder-city',
    characterId: 'escoffier',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'marechaussee-hunter',
    characterId: 'freminet',
    archetypeId: 'freminet::physical-dps',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'marechaussee-hunter',
    characterId: 'freminet',
    archetypeId: 'freminet::cryo-dps',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'instructor',
    characterId: 'gorou',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'marechaussee-hunter',
    characterId: 'hu-tao',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'nymphs-dream',
    characterId: 'kamisato-ayato',
    usageType: '4pc BiS',
    tier: 'BiS',
  },
  {
    setId: 'echoes-of-an-offering',
    characterId: 'kamisato-ayato',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'noblesse-oblige',
    characterId: 'lisa',
    archetypeId: 'lisa::off-field-electro-dps-support',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'emblem-of-severed-fate',
    characterId: 'rosaria',
    archetypeId: 'rosaria::reverse-melt',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'blizzard-strayer',
    characterId: 'xingqiu',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'archaic-petra',
    characterId: 'zhongli',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
  {
    setId: 'instructor',
    characterId: 'zhongli',
    usageType: '4pc Alternative',
    tier: 'Alternative',
  },
]

export const SET_STAT_PATCHES: SetStatPatch[] = [
  {
    setIds: ['noblesse-oblige', 'celestial-gift'],
    characterId: 'durin',
    removeMainStats: { sands: ['EM'] },
  },
  {
    setIds: ['blizzard-strayer', 'noblesse-oblige'],
    characterId: 'kaeya',
    removeMainStats: { sands: ['EM', 'ER%'] },
    removeSubstats: ['EM', 'ER%'],
  },
]

/**
 * Apply character-level build overrides before inverting into sets.
 */
export function applyCharacterBuildOverrides(resolvedCharacters: ResolvedCharacterBuild[]): void {
  for (let i = 0; i < resolvedCharacters.length; i++) {
    const overrideFn = CHARACTER_BUILD_OVERRIDES[resolvedCharacters[i].characterId]
    if (overrideFn) {
      resolvedCharacters[i] = overrideFn(resolvedCharacters[i])
    }
  }
}

/**
 * Apply post-inversion set-level operations (removals, tier overrides, additions, stat patches, manual injections).
 */
export function applySetLevelOverrides(
  assignmentsBySet: Map<string, CharacterUsage[]>,
  resolvedCharacters: ResolvedCharacterBuild[],
): void {
  const resolvedBySlug = new Map<string, ResolvedCharacterBuild>(
    resolvedCharacters.map((c) => [c.characterId, c]),
  )

  // 1. Removals
  for (const removal of SET_REMOVALS) {
    const list = assignmentsBySet.get(removal.setId)
    if (!list) continue
    const key = removal.archetypeId ?? removal.characterId
    const filtered = list.filter((u) => (u.archetypeId ?? u.characterId) !== key)
    assignmentsBySet.set(removal.setId, filtered)
  }

  // 2. Tier Overrides
  for (const tierOv of SET_TIER_OVERRIDES) {
    const list = assignmentsBySet.get(tierOv.setId)
    if (!list) continue
    const key = tierOv.archetypeId ?? tierOv.characterId
    const charIndex = list.findIndex((u) => (u.archetypeId ?? u.characterId) === key)
    if (charIndex >= 0) {
      list[charIndex] = {
        ...list[charIndex],
        usageType: tierOv.usageType,
        tier: tierOv.tier,
      }
    }
  }

  // 3. Additions
  for (const addition of SET_ADDITIONS) {
    const list = assignmentsBySet.get(addition.setId)
    if (!list) continue

    const resolved = resolvedBySlug.get(addition.characterId)
    if (!resolved || resolved.assignments.length === 0) {
      console.warn(`[manual-overrides] Resolved character not found for addition: ${addition.characterId}`)
      continue
    }

    const baseUsage =
      resolved.assignments.find((a) =>
        addition.archetypeId
          ? (a.usage.archetypeId ?? a.characterId) === addition.archetypeId
          : a.characterId === addition.characterId,
      )?.usage ?? resolved.assignments[0]?.usage

    if (!baseUsage) {
      console.warn(`[manual-overrides] Base usage not found for ${addition.characterId}`)
      continue
    }

    const newUsage: CharacterUsage = {
      ...baseUsage,
      usageType: addition.usageType,
      tier: addition.tier,
      mainStats: {
        sands: [...(addition.statOverrides?.sands ?? baseUsage.mainStats.sands)],
        goblet: [...(addition.statOverrides?.goblet ?? baseUsage.mainStats.goblet)],
        circlet: [...(addition.statOverrides?.circlet ?? baseUsage.mainStats.circlet)],
      },
      substatsPriority: [...(addition.substatOverrides ?? baseUsage.substatsPriority)],
    }

    const key = newUsage.archetypeId ?? newUsage.characterId
    const existingIdx = list.findIndex((u) => (u.archetypeId ?? u.characterId) === key)
    if (existingIdx >= 0) {
      list[existingIdx] = newUsage
    } else {
      list.push(newUsage)
    }
  }

  // 4. Inject manual standalone inclusions (like Aino)
  for (const [setId, manualList] of Object.entries(MANUAL_CHARACTER_INCLUSIONS)) {
    const list = assignmentsBySet.get(setId)
    if (!list) continue
    for (const manualChar of manualList) {
      const manualKey = manualChar.archetypeId ?? manualChar.characterId
      const existingIdx = list.findIndex((u) => (u.archetypeId ?? u.characterId) === manualKey)
      if (existingIdx >= 0) {
        list[existingIdx] = manualChar
      } else {
        list.push(manualChar)
      }
    }
  }

  // 5. Stat Patches
  for (const patch of SET_STAT_PATCHES) {
    for (const setId of patch.setIds) {
      const list = assignmentsBySet.get(setId)
      if (!list) continue
      const key = patch.archetypeId ?? patch.characterId
      const charIndex = list.findIndex((u) => (u.archetypeId ?? u.characterId) === key)
      if (charIndex < 0) continue

      const baseChar = list[charIndex]
      const char: CharacterUsage = {
        ...baseChar,
        mainStats: {
          sands: [...baseChar.mainStats.sands],
          goblet: [...baseChar.mainStats.goblet],
          circlet: [...baseChar.mainStats.circlet],
        },
        substatsPriority: [...baseChar.substatsPriority],
      }
      list[charIndex] = char

      if (patch.removeMainStats) {
        if (patch.removeMainStats.sands) {
          char.mainStats.sands = char.mainStats.sands.filter(
            (s) => !patch.removeMainStats!.sands!.includes(s),
          )
        }
        if (patch.removeMainStats.goblet) {
          char.mainStats.goblet = char.mainStats.goblet.filter(
            (s) => !patch.removeMainStats!.goblet!.includes(s),
          )
        }
        if (patch.removeMainStats.circlet) {
          char.mainStats.circlet = char.mainStats.circlet.filter(
            (s) => !patch.removeMainStats!.circlet!.includes(s),
          )
        }
      }
      if (patch.removeSubstats) {
        char.substatsPriority = char.substatsPriority.filter(
          (s) => !patch.removeSubstats!.includes(s),
        )
      }
    }
  }
}
