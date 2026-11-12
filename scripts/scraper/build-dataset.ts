import { mkdir, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  ArtifactSetTriage,
  CharacterUsage,
  LocalizedText,
  PrimarySource,
  StatKey,
  UsageTier,
  UsageType,
} from '../../src/types/artifacts'
import { buildSlotRules, buildFlowerAndPlume } from '../../src/lib/triage'
import {
  CACHE_ROOT,
  DATA_OUTPUT,
  GB_CONCURRENCY,
  KQM_CONCURRENCY,
  TARGET_SETS,
  artifactImageUrl,
  characterImageUrl,
  getTargetSets,
  type TargetSetConfig,
} from './config'
import {
  fetchArtifactIndex,
  fetchCharacter,
  type GBArtifactSet,
  type GBCharacterData,
} from './genshin-builds'
import { fetchKqmGuide, formatVersion, parseVersion, type KqmGuide } from './kqm-parser'
import { mapWithConcurrency } from './http'
import { MANUAL_CHARACTER_INCLUSIONS } from './manual-inclusions'

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

const ROLE_ES: Record<string, string> = {
  'Anemo DPS': 'DPS Anemo',
  'Buff Support': 'Soporte de buffs',
  'Buff Support (High-Energy Requirement)': 'Soporte de buffs (altos requisitos de energía)',
  'Buff Support & Off-Field DPS': 'Soporte de buffs y DPS fuera de campo',
  'Cryo DPS': 'DPS Cryo',
  DPS: 'DPS',
  'DPS & Buff Support': 'DPS y soporte de buffs',
  'Elemental Mastery Support': 'Soporte de Maestría Elemental',
  'Freeze DPS': 'DPS de Congelación',
  'Geo Quickswap DPS & Support': 'DPS y soporte de cambio rápido Geo',
  'High Energy Requirement (Off-Field DPS)': 'Altos requisitos de energía (DPS fuera de campo)',
  'High Energy Requirement Off-Field DPS & Buff Support': 'DPS fuera de campo con altos requisitos de energía y soporte de buffs',
  'Lunar-Crystallize DPS': 'DPS de Cristalización Lunar',
  'Off-Field Aggravate DPS': 'DPS fuera de campo de Intensificación',
  'Off-Field DPS': 'DPS fuera de campo',
  'Off-Field DPS & Buff and Heal Support': 'DPS fuera de campo y soporte de buffs y curación',
  'Off-Field Reaction DPS & Heal Support': 'DPS de reacción fuera de campo y soporte de curación',
  'Off-field DPS': 'DPS fuera de campo',
  'Off-field DPS & Buff & Shield Support': 'DPS fuera de campo y soporte de buffs y escudos',
  'On-Field DPS': 'DPS en campo',
  'Physical DPS': 'DPS Físico',
  'Plunge DPS': 'DPS de Caída',
  'Quickbloom DPS': 'DPS Quickbloom',
  'Shield & Buff Support': 'Soporte de escudos y buffs',
  'Spread DPS': 'DPS de Propagación',
  'Stellar Glimmer DPS': 'DPS de Destello Estelar',
  'Stellar Swirl DPS': 'DPS de Torbellino Estelar',
  'Stellar-Conduct DPS': 'DPS de Superconductor Estelar',
  'Stellar-Conduct Off-Field DPS': 'DPS fuera de campo de Superconductor Estelar',
  'Vaporize DPS': 'DPS de Vaporización',
}

function translateRole(role: string, fallback: string): string {
  return ROLE_ES[role] ?? fallback
}

const ARCHETYPE_ES: Record<string, string> = {
  Support: 'Soporte',
  'Bloom DPS': 'DPS Bloom',
  'On-Field Electro DPS': 'DPS Electro On-Field',
  'Off-Field Electro DPS / Support': 'DPS Electro Off-Field / Soporte',
  'On-Field DPS': 'DPS On-Field',
  'Off-Field DPS': 'DPS Off-Field',
  'Reverse Melt': 'Reverse Melt',
  'Reverse Melt DPS': 'DPS Reverse Melt',
  'Freeze / Mono Cryo': 'Freeze / Mono Cryo',
  'Freeze and Mono Cryo': 'Freeze y Mono Cryo',
  'Freeze and Mono Cryo Support': 'Soporte Freeze y Mono Cryo',
  Dendro: 'Dendro (Aggravate)',
  'Dendro (Aggravate)': 'Dendro (Aggravate)',
  Overload: 'Overload',
  'Lunar-Charged': 'Lunar-Charged',
  'Aggravate DPS': 'DPS Aggravate',
  'Quickbloom DPS': 'DPS Quickbloom',
  'Electro DPS': 'DPS Electro',
  'General Support / Damage Dealer': 'Soporte General / Damage Dealer',
  'Transformative Reaction–Focused': 'Enfocado en Transformative Reactions',
  'Transformative Reaction-Focused': 'Enfocado en Transformative Reactions',
}

function translateArchetype(label: string): string {
  if (ARCHETYPE_ES[label]) return ARCHETYPE_ES[label]
  return label
    .replace(/\bSupport\b/g, 'Soporte')
    .replace(/\band\b/g, 'y')
}

function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function normalizeBonusText(value: string): string {
  return value.replace(/\breaction dealt by\b/gi, 'reaction DMG dealt by')
}

function uniqueStats(stats: StatKey[]): StatKey[] {
  return [...new Set(stats)]
}

function compareVersions(kqm: KqmGuide | null, gbVersionRaw: string): number {
  const gb = parseVersion(gbVersionRaw)
  if (!kqm?.version) return -1
  if (!gb) return 1
  return kqm.version.major - gb.major || kqm.version.minor - gb.minor
}

function fitStats(
  preferred: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] },
  fallback: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] },
) {
  return {
    sands: preferred.sands.length ? preferred.sands : fallback.sands,
    goblet: preferred.goblet.length ? preferred.goblet : fallback.goblet,
    circlet: preferred.circlet.length ? preferred.circlet : fallback.circlet,
  }
}

function resolveCharacterBuild(
  character: GBCharacterData,
  kqm: KqmGuide | null,
  targetSets: TargetSetConfig[],
): ResolvedCharacterBuild {
  const bestBuild = character.builds.find((b) => b.isBestRole) ?? character.builds[0]
  if (!bestBuild) {
    return {
      characterId: character.slug,
      name: character.name,
      element: capitalize(character.element),
      primarySource: 'Genshin-Builds',
      gbVersion: '1.0',
      resolutionReason: 'No builds found for character in Genshin-Builds',
      assignments: [],
    }
  }

  const gbVersionRaw = bestBuild.version
  const gb = parseVersion(gbVersionRaw)
  const gbVersion = formatVersion(gb) ?? gbVersionRaw
  const kqmVersion = formatVersion(kqm?.version)
  const comparison = compareVersions(kqm, gbVersionRaw)

  let primarySource: PrimarySource
  let resolutionReason: string

  if (!kqm) {
    primarySource = 'Genshin-Builds'
    resolutionReason = 'Fallback to GB: no KQM guide'
  } else if (!kqm.version || !kqmVersion) {
    primarySource = 'Genshin-Builds'
    resolutionReason = 'Fallback to GB: KQM version missing'
  } else if (comparison < 0) {
    primarySource = 'Genshin-Builds'
    resolutionReason = `Genshin-Builds newer (${gbVersion} > ${kqmVersion})`
  } else if (comparison > 0) {
    primarySource = 'KQM'
    resolutionReason = gb
      ? `KQM newer (${kqmVersion} > ${gbVersion})`
      : 'KQM guide available; GB version unavailable'
  } else {
    primarySource = 'Both (Consensus)'
    resolutionReason = `Versions match (${kqmVersion} = ${gbVersion})`
  }

  const gbStats = bestBuild.mainStats
  const kqmStats = kqm?.mainStats ?? { sands: [], goblet: [], circlet: [] }
  const mainStats = primarySource === 'KQM' ? fitStats(kqmStats, gbStats) : fitStats(gbStats, kqmStats)

  for (const slot of ['sands', 'goblet', 'circlet'] as const) {
    if (!mainStats[slot].length) {
      throw new Error(
        `Missing ${slot} main stats for ${character.name.en}; check the Genshin-Builds row for combined labels such as "CRIT Rate / CRIT DMG".`,
      )
    }
  }

  const kqmSubstats = kqm?.substats ?? []
  const useKqmSubstats =
    primarySource === 'KQM' ? kqmSubstats.length > 0 : !bestBuild.substats.length && kqmSubstats.length > 0
  const substatsPriority = uniqueStats(useKqmSubstats ? kqmSubstats : bestBuild.substats)
  const critTie = useKqmSubstats ? Boolean(kqm?.critTie) : (bestBuild.critTie || Boolean(kqm?.critTie))
  const erUntilRequirement =
    substatsPriority[0] === 'ER%' && (bestBuild.erUntilRequirement || Boolean(kqm?.erUntilRequirement))

  // Extract GB standard sets (both 4pc and 2pc)
  const gbStandardSets: { setId: string; rank: 1 | 2; pieceCount: 2 | 4 }[] = []
  for (const usage of bestBuild.setUsages) {
    if (usage.conditional) continue
    if (usage.pieceCount !== 4 && usage.pieceCount !== 2) continue
    if (usage.rank !== 1 && usage.rank !== 2) continue
    const existing = gbStandardSets.find((s) => s.setId === usage.setId)
    if (existing) {
      if (usage.rank < existing.rank) {
        existing.rank = usage.rank as 1 | 2
        existing.pieceCount = usage.pieceCount
      } else if (usage.rank === existing.rank && usage.pieceCount > existing.pieceCount) {
        existing.pieceCount = usage.pieceCount
      }
    } else {
      gbStandardSets.push({
        setId: usage.setId,
        rank: usage.rank as 1 | 2,
        pieceCount: usage.pieceCount,
      })
    }
  }

  if (primarySource === 'KQM' && kqm && kqm.archetypes && kqm.archetypes.length > 0) {
    const validTargetIds = new Set(targetSets.map((t) => t.id))
    const assignments: CharacterSetAssignment[] = []

    for (const archetype of kqm.archetypes) {
      const archMainStats = fitStats(archetype.mainStats, gbStats)
      const archSubstats = uniqueStats(archetype.substats.length > 0 ? archetype.substats : bestBuild.substats)
      const archCritTie = archetype.substats.length > 0 ? archetype.critTie : (bestBuild.critTie || Boolean(kqm.critTie))
      const archErUntilRequirement =
        archSubstats[0] === 'ER%' && (bestBuild.erUntilRequirement || archetype.erUntilRequirement)

      const archetypeId = `${character.slug}::${archetype.archetypeSlug}`
      const archetypeLabel = {
        en: archetype.archetypeLabel.en,
        es: translateArchetype(archetype.archetypeLabel.en),
      }

      for (const rec of archetype.standardSets) {
        if (!validTargetIds.has(rec.setId)) continue
        if (assignments.some((a) => a.setId === rec.setId && (a.usage.archetypeId ?? a.characterId) === archetypeId)) {
          continue
        }

        const tier: UsageTier = rec.rank === 1 ? 'BiS' : 'Alternative'
        const usageType: UsageType =
          rec.pieceCount === 2
            ? rec.rank === 1
              ? '2pc BiS'
              : '2pc Alternative'
            : rec.rank === 1
              ? '4pc BiS'
              : '4pc Alternative'

        const usage: CharacterUsage = {
          characterId: character.slug,
          archetypeId,
          archetypeLabel,
          name: character.name,
          iconUrl: characterImageUrl(character.slug),
          element: capitalize(character.element),
          role: archetypeLabel,
          usageType,
          tier,
          mainStats: archMainStats,
          substatsPriority: archSubstats,
          critTie: archCritTie,
          erUntilRequirement: archErUntilRequirement,
          sourceValidation: {
            primarySource,
            gbVersion,
            kqmVersion,
            genshinBuildsUpdated: bestBuild.version,
            resolutionReason: `${resolutionReason} [${archetype.archetypeLabel.en}]`,
            kqmUrl: kqm.url,
          },
        }

        assignments.push({
          setId: rec.setId,
          characterId: character.slug,
          tier,
          usageType,
          usage,
        })
      }
    }

    return {
      characterId: character.slug,
      name: character.name,
      element: capitalize(character.element),
      primarySource,
      gbVersion,
      kqmVersion,
      resolutionReason,
      assignments,
    }
  }

  type ResolvedSetRec = { setId: string; rank: 1 | 2; pieceCount: 2 | 4 }
  let chosenSets: ResolvedSetRec[] = []

  if (primarySource === 'KQM') {
    if (kqm && kqm.standardSets.length > 0) {
      chosenSets = kqm.standardSets.map((s) => ({
        setId: s.setId,
        rank: s.rank,
        pieceCount: s.pieceCount,
      }))
    } else {
      resolutionReason += '; fallback to GB sets (no standard sets in KQM)'
      chosenSets = gbStandardSets
    }
  } else {
    chosenSets = gbStandardSets
    if (chosenSets.length === 0 && kqm && kqm.standardSets.length > 0) {
      chosenSets = kqm.standardSets.map((s) => ({
        setId: s.setId,
        rank: s.rank,
        pieceCount: s.pieceCount,
      }))
    }
  }

  const validTargetIds = new Set(targetSets.map((t) => t.id))
  const assignments: CharacterSetAssignment[] = []
  for (const rec of chosenSets) {
    if (!validTargetIds.has(rec.setId)) continue
    if (assignments.some((a) => a.setId === rec.setId)) continue
    const tier: UsageTier = rec.rank === 1 ? 'BiS' : 'Alternative'
    const usageType: UsageType =
      rec.pieceCount === 2
        ? rec.rank === 1
          ? '2pc BiS'
          : '2pc Alternative'
        : rec.rank === 1
          ? '4pc BiS'
          : '4pc Alternative'
    const usage: CharacterUsage = {
      characterId: character.slug,
      archetypeId: character.slug,
      name: character.name,
      iconUrl: characterImageUrl(character.slug),
      element: capitalize(character.element),
      role: {
        en: bestBuild.name || 'DPS',
        es: translateRole(bestBuild.name, bestBuild.nameEs ?? bestBuild.name ?? 'DPS'),
      },
      usageType,
      tier,
      mainStats,
      substatsPriority,
      critTie,
      erUntilRequirement,
      sourceValidation: {
        primarySource,
        gbVersion,
        kqmVersion,
        genshinBuildsUpdated: bestBuild.version,
        resolutionReason,
        kqmUrl: kqm?.url,
      },
    }
    assignments.push({
      setId: rec.setId,
      characterId: character.slug,
      tier,
      usageType,
      usage,
    })
  }

  return {
    characterId: character.slug,
    name: character.name,
    element: capitalize(character.element),
    primarySource,
    gbVersion,
    kqmVersion,
    resolutionReason,
    assignments,
  }
}

function makeSetTriage(
  target: TargetSetConfig,
  en: GBArtifactSet,
  es: GBArtifactSet | undefined,
  characters: CharacterUsage[],
): ArtifactSetTriage {
  const setNames: LocalizedText = { en: en.name, es: es?.name ?? target.es }
  const parsedReleaseVersion = parseVersion(en.versionReleased)
  return {
    id: target.id,
    name: setNames,
    rarity: en.rarity,
    releaseVersion: {
      raw: en.versionReleased,
      major: parsedReleaseVersion?.major ?? 0,
      minor: parsedReleaseVersion?.minor ?? 0,
    },
    imageUrl: artifactImageUrl(target.id),
    bonuses: {
      twoPiece: {
        en: normalizeBonusText(en.twoPiece),
        es: normalizeBonusText(es?.twoPiece ?? en.twoPiece),
      },
      fourPiece: {
        en: normalizeBonusText(en.fourPiece),
        es: normalizeBonusText(es?.fourPiece ?? en.fourPiece),
      },
    },
    flowerAndPlumeRules: buildFlowerAndPlume(characters),
    slotRules: {
      sands: buildSlotRules(characters, 'sands'),
      goblet: buildSlotRules(characters, 'goblet'),
      circlet: buildSlotRules(characters, 'circlet'),
    },
    characters,
  }
}

async function collectAllCharacterSlugs(enIndex: GBArtifactSet[]): Promise<string[]> {
  const indexSlugs = enIndex.flatMap((set) => set.users.map((user) => user.slug))
  const slugsSet = new Set<string>(indexSlugs)

  try {
    const gbCacheDir = path.join(CACHE_ROOT, 'genshin-builds', 'en')
    const files = await readdir(gbCacheDir)
    for (const file of files) {
      const match = file.match(
        /^genshin-impact-helper-team\.github\.io-genshin-builds-en-([a-z0-9-]+)-[a-f0-9]+\.html$/,
      )
      if (match && match[1] !== 'artifacts') {
        slugsSet.add(match[1])
      }
    }
  } catch {
    // Cache directory might not be readable or present
  }

  return [...slugsSet].sort()
}

async function main() {
  const scrapeAll = process.argv.includes('--all')
  const [enIndex, esIndex] = await Promise.all([fetchArtifactIndex('en'), fetchArtifactIndex('es')])
  const esById = new Map(esIndex.map((set) => [set.id, set]))
  const enById = new Map(enIndex.map((set) => [set.id, set]))

  const targets: TargetSetConfig[] = scrapeAll
    ? enIndex.map((set) => ({
        id: set.id,
        en: set.name,
        es: esById.get(set.id)?.name ?? set.name,
        aliases: [],
      }))
    : getTargetSets()

  if (targets.length === 0) {
    throw new Error('No target sets matched the provided filter.')
  }
  console.log(`[build-dataset] target sets (${targets.length}): ${targets.map((set) => set.en).join(' | ')}`)

  const allSlugs = await collectAllCharacterSlugs(enIndex)
  console.log(`[build-dataset] total playable characters to process: ${allSlugs.length}`)

  const characterEntries = await mapWithConcurrency(allSlugs, GB_CONCURRENCY, async (slug) => {
    try {
      const data = await fetchCharacter(slug, TARGET_SETS)
      console.log(`  [gb] ${data.name.en} (${slug})`)
      return [slug, data] as const
    } catch (error) {
      console.warn(`  [gb] failed ${slug}: ${(error as Error).message}`)
      return [slug, null] as const
    }
  })
  const charactersBySlug = new Map(characterEntries)

  const kqmEntries = await mapWithConcurrency(allSlugs, KQM_CONCURRENCY, async (slug) => {
    const character = charactersBySlug.get(slug)
    if (!character) return [slug, null] as const
    try {
      const guide = await fetchKqmGuide(slug, character.name.en, TARGET_SETS)
      const summary = guide
        ? `${guide.slug} ${guide.version?.raw ?? 'no-ver'} sets=[${guide.standardSets.map((s) => `${s.name}(R${s.rank})`).join(',')}]`
        : 'not found'
      console.log(`  [kqm] ${character.name.en}: ${summary}`)
      return [slug, guide] as const
    } catch (error) {
      console.warn(`  [kqm] failed ${slug}: ${(error as Error).message}`)
      return [slug, null] as const
    }
  })
  const kqmBySlug = new Map(kqmEntries)

  const resolvedCharacters: ResolvedCharacterBuild[] = []
  for (const slug of allSlugs) {
    const character = charactersBySlug.get(slug)
    if (!character) continue
    const kqm = kqmBySlug.get(slug) ?? null
    const resolved = resolveCharacterBuild(character, kqm, TARGET_SETS)
    resolvedCharacters.push(resolved)
  }

  // Invert assignments: group by target set
  const assignmentsBySet = new Map<string, CharacterUsage[]>()
  for (const target of targets) {
    assignmentsBySet.set(target.id, [])
  }
  for (const resolved of resolvedCharacters) {
    for (const assignment of resolved.assignments) {
      const list = assignmentsBySet.get(assignment.setId)
      const currentKey = assignment.usage.archetypeId ?? assignment.characterId
      if (list && !list.some((u) => (u.archetypeId ?? u.characterId) === currentKey)) {
        list.push(assignment.usage)
      }
    }
  }

  // Inject manual inclusions & sort characters per set
  for (const target of targets) {
    const list = assignmentsBySet.get(target.id)
    if (!list) continue
    const manualList = MANUAL_CHARACTER_INCLUSIONS[target.id] ?? []
    for (const manualChar of manualList) {
      const manualKey = manualChar.archetypeId ?? manualChar.characterId
      if (!list.some((u) => (u.archetypeId ?? u.characterId) === manualKey)) {
        list.push(manualChar)
      }
    }
    list.sort((a, b) => {
      const order: Record<UsageType, number> = {
        '4pc BiS': 0,
        '2pc BiS': 1,
        '4pc Alternative': 2,
        '2pc Alternative': 3,
        '2pc Combo': 4,
      }
      return (
        order[a.usageType] - order[b.usageType] ||
        a.name.en.localeCompare(b.name.en) ||
        (a.archetypeId ?? '').localeCompare(b.archetypeId ?? '')
      )
    })
  }

  // Assemble sets triage
  const sets: ArtifactSetTriage[] = []
  for (const target of targets) {
    const en = enById.get(target.id)
    if (!en) {
      console.warn(`[build-dataset] ${target.en} not found in EN index, skipping`)
      continue
    }
    const es = esById.get(target.id)
    const characters = assignmentsBySet.get(target.id) ?? []
    console.log(`[build-dataset] ${target.en}: ${characters.length} usable characters`)
    sets.push(makeSetTriage(target, en, es, characters))
  }

  const dataset = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    source: 'Genshin-Builds (EN/ES) + KeqingMains Quickguides',
    sets,
  }

  await mkdir(path.dirname(DATA_OUTPUT), { recursive: true })
  await writeFile(DATA_OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')
  console.log(
    `[build-dataset] wrote ${DATA_OUTPUT} (${sets.length} sets, ${sets.reduce((total, set) => total + set.characters.length, 0)} character usages)`,
  )

  const auditRows = resolvedCharacters.map((char) => ({
    Personaje: char.name.en,
    'Versión GB': char.gbVersion,
    'Versión KQM': char.kqmVersion ?? '—',
    'Fuente Ganadora': char.primarySource,
    Motivo: char.resolutionReason,
    'Sets Asignados': char.assignments.map((a) => `${a.setId} (${a.tier})`).join(', ') || 'Ninguno (2pc/niche)',
  }))
  console.log('\n[build-dataset] source resolution audit')
  console.table(auditRows)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
