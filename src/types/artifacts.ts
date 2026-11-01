export interface LocalizedText {
  en: string
  es: string
}

export type StatKey =
  | 'HP' | 'HP%' | 'ATK' | 'ATK%' | 'DEF' | 'DEF%'
  | 'ER%' | 'EM' | 'CRIT Rate' | 'CRIT DMG' | 'Healing Bonus'
  | 'Pyro DMG%' | 'Hydro DMG%' | 'Cryo DMG%' | 'Electro DMG%'
  | 'Anemo DMG%' | 'Geo DMG%' | 'Dendro DMG%' | 'Physical DMG%'

export type UsageType = '4pc BiS' | '4pc Alternative' | '2pc Combo'
export type UsageTier = 'BiS' | 'Alternative'
export type PrimarySource = 'KQM' | 'Genshin-Builds' | 'Both (Consensus)'
export type SlotKey = 'sands' | 'goblet' | 'circlet'
export type Verdict = 'MUST_KEEP' | 'SITUATIONAL_KEEP' | 'SAFE_DISCARD'

export interface CharacterUsage {
  characterId: string
  name: LocalizedText
  iconUrl: string
  element: string
  role: LocalizedText
  usageType: UsageType
  tier: UsageTier
  mainStats: {
    sands: StatKey[]
    goblet: StatKey[]
    circlet: StatKey[]
  }
  substatsPriority: StatKey[]
  notes: LocalizedText
  sourceValidation: {
    primarySource: PrimarySource
    kqmVersion?: string
    genshinBuildsUpdated?: string
    kqmUrl?: string
  }
}

export interface SlotSubstat {
  name: StatKey
  characters: string[]
}

export interface SlotTriageRule {
  mainStat: StatKey
  verdict: Verdict
  substats: SlotSubstat[]
  usedBy: string[]
  reasoning: LocalizedText
}

export interface ArtifactSetTriage {
  id: string
  name: LocalizedText
  rarity: number
  iconUrl: string
  imageUrl: string
  bonuses: {
    twoPiece: LocalizedText
    fourPiece: LocalizedText
  }
  summaryVerdict: LocalizedText
  flowerAndPlumeRules: {
    keepCombinations: {
      substats: StatKey[]
      usedBy: string[]
      reasoning: LocalizedText
    }[]
    discardRule: LocalizedText
  }
  slotRules: {
    sands: SlotTriageRule[]
    goblet: SlotTriageRule[]
    circlet: SlotTriageRule[]
  }
  characters: CharacterUsage[]
}

export interface TriageDataset {
  generatedAt: string
  version: string
  source: string
  sets: ArtifactSetTriage[]
}
