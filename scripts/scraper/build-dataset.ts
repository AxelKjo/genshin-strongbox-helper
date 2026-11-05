import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type {
  ArtifactSetTriage,
  CharacterUsage,
  LocalizedText,
  SlotKey,
  SlotTriageRule,
  StatKey,
  UsageTier,
  UsageType,
  Verdict,
} from '../../src/types/artifacts'
import { SLOT_MAIN_STATS, statLabel } from '../../src/lib/stats'
import {
  DATA_OUTPUT,
  GB_CONCURRENCY,
  KQM_CONCURRENCY,
  artifactImageUrl,
  getTargetSets,
  type TargetSetConfig,
} from './config'
import {
  fetchArtifactIndex,
  fetchCharacter,
  pickSetUsage,
  type GBArtifactSet,
  type GBCharacterData,
} from './genshin-builds'
import { fetchKqmGuide, formatVersion, parseVersion, type KqmGuide } from './kqm-parser'
import { mapWithConcurrency } from './http'

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

const SLOT_LABELS: Record<SlotKey, LocalizedText> = {
  sands: { en: 'Sands', es: 'Arenas' },
  goblet: { en: 'Goblet', es: 'Cáliz' },
  circlet: { en: 'Circlet', es: 'Tiara' },
}


function capitalize(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function normalizeBonusText(value: string): string {
  return value.replace(/\breaction dealt by\b/gi, 'reaction DMG dealt by')
}

function joinLocalized(values: LocalizedText[], lang: 'en' | 'es'): string {
  return values.map((value) => value[lang]).join(', ')
}

function uniqueStats(stats: StatKey[]): StatKey[] {
  return [...new Set(stats)]
}

function compareVersions(kqm: KqmGuide | null, gbVersion: string): number {
  const gb = parseVersion(gbVersion)
  if (!kqm?.version) return -1
  if (!gb) return 1
  return kqm.version.major - gb.major || kqm.version.minor - gb.minor
}

function resolvePrimarySource(
  kqm: KqmGuide | null,
  gbVersionRaw: string,
  recommendedForThisSet: boolean,
): Pick<CharacterUsage['sourceValidation'], 'primarySource' | 'gbVersion' | 'kqmVersion' | 'resolutionReason'> {
  const gbVersion = formatVersion(parseVersion(gbVersionRaw)) ?? gbVersionRaw
  const kqmVersion = formatVersion(kqm?.version)
  if (!kqm) {
    return { primarySource: 'Genshin-Builds', gbVersion, resolutionReason: 'Fallback to GB: no KQM guide' }
  }
  if (!kqm.version || !kqmVersion) {
    return { primarySource: 'Genshin-Builds', gbVersion, resolutionReason: 'Fallback to GB: KQM version missing' }
  }
  if (!recommendedForThisSet) {
    return {
      primarySource: 'Genshin-Builds',
      gbVersion,
      kqmVersion,
      resolutionReason: 'Fallback to GB: set not in KQM standard recommendations',
    }
  }
  const comparison = compareVersions(kqm, gbVersionRaw)
  if (comparison > 0) {
    return {
      primarySource: 'KQM',
      gbVersion,
      kqmVersion,
      resolutionReason: parseVersion(gbVersionRaw)
        ? `KQM newer (${kqmVersion} > ${gbVersion}) and recommends set`
        : 'KQM recommends set; GB version unavailable',
    }
  }
  if (comparison < 0) {
    return {
      primarySource: 'Genshin-Builds',
      gbVersion,
      kqmVersion,
      resolutionReason: `Genshin-Builds newer (${gbVersion} > ${kqmVersion})`,
    }
  }
  return {
    primarySource: 'Both (Consensus)',
    gbVersion,
    kqmVersion,
    resolutionReason: `Versions match (${kqmVersion} = ${gbVersion}) and KQM recommends set`,
  }
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

interface ResolvedCharacter {
  usage: CharacterUsage
  kqm: KqmGuide | null
}

function resolveCharacter(
  character: GBCharacterData,
  target: TargetSetConfig,
  preferredBuildId: string,
  indexRank: string,
  kqm: KqmGuide | null,
): ResolvedCharacter | null {
  const picked = pickSetUsage(character, preferredBuildId, target.id)
  if (!picked) return null
  const { build, usage } = picked
  const targetNames = [target.en, target.es, ...target.aliases]
  const recommendedForThisSet = kqm?.recommendedSets.some((name) => targetNames.includes(name)) ?? false
  const numericIndexRank = /^\d+$/.test(indexRank) ? Number.parseInt(indexRank, 10) : Number.POSITIVE_INFINITY
  const effectiveRank = usage.rank !== Number.POSITIVE_INFINITY ? usage.rank : numericIndexRank
  const usageType: UsageType =
    usage.pieceCount === 4
      ? effectiveRank === 1
        ? '4pc BiS'
        : '4pc Alternative'
      : '2pc Combo'
  const tier: UsageTier = usageType === '4pc BiS' ? 'BiS' : 'Alternative'

  const sourceResolution = resolvePrimarySource(kqm, build.version, recommendedForThisSet)
  const { primarySource } = sourceResolution

  const gbStats = build.mainStats
  const kqmStats = kqm?.mainStats ?? { sands: [], goblet: [], circlet: [] }
  const mainStats = primarySource === 'KQM' ? fitStats(kqmStats, gbStats) : fitStats(gbStats, kqmStats)
  for (const slot of ['sands', 'goblet', 'circlet'] as const) {
    if (!mainStats[slot].length) {
      throw new Error(
        `Missing ${slot} main stats for ${character.name.en} (${target.en}); check the Genshin-Builds row for combined labels such as "CRIT Rate / CRIT DMG".`,
      )
    }
  }
  const kqmSubstats = kqm?.substats ?? []
  const useKqmSubstats =
    primarySource === 'KQM' ? kqmSubstats.length > 0 : !build.substats.length && kqmSubstats.length > 0
  const substatsPriority = uniqueStats(useKqmSubstats ? kqmSubstats : build.substats)
  const critTie = useKqmSubstats ? Boolean(kqm?.critTie) : build.critTie
  const erUntilRequirement =
    substatsPriority[0] === 'ER%' && (build.erUntilRequirement || Boolean(kqm?.erUntilRequirement))

  const matchedContextName = kqm?.recommendedSets.find((name) => targetNames.includes(name))
  const kqmContext = matchedContextName ? kqm?.setContexts[matchedContextName] ?? '' : ''
  const notesEn = [build.notes, primarySource === 'KQM' ? kqmContext : ''].filter(Boolean).join(' ')
  const notesEs = build.notesEs ?? build.notes

  return {
    kqm,
    usage: {
      characterId: character.slug,
      name: character.name,
      iconUrl: character.iconUrl,
      element: capitalize(character.element),
      role: {
        en: build.name || usage.label,
        es: translateRole(build.name, build.nameEs ?? build.name ?? usage.label),
      },
      usageType,
      tier,
      mainStats,
      substatsPriority,
      critTie,
      erUntilRequirement,
      notes: {
        en: notesEn.slice(0, 1200),
        es: notesEs.slice(0, 1200),
      },
      sourceValidation: {
        ...sourceResolution,
        genshinBuildsUpdated: build.version,
        kqmUrl: kqm?.url,
      },
    },
  }
}

function buildSlotRules(
  set: GBArtifactSet,
  setNames: LocalizedText,
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
        if (stat === mainStat) continue
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

    const names = users.map((character) => character.name)
    const stat = statLabel(mainStat, 'en')
    const statEs = statLabel(mainStat, 'es')
    const slotEn = SLOT_LABELS[slot].en
    const slotEs = SLOT_LABELS[slot].es
    const subsEn = substats.map((entry) => statLabel(entry.name, 'en')).join(' > ')
    const subsEs = substats.map((entry) => statLabel(entry.name, 'es')).join(' > ')
    let reasoning: LocalizedText
    if (verdict === 'SAFE_DISCARD') {
      reasoning = {
        en: `No current ${setNames.en} user needs ${stat} on ${slotEn}. Recycle it unless the substats make it a solid off-piece.`,
        es: `Ningún personaje actual de ${setNames.es} necesita ${statEs} en ${slotEs}. Recíclala salvo que las subestadísticas la conviertan en una buena pieza externa.`,
      }
    } else if (verdict === 'SITUATIONAL_KEEP') {
      reasoning = {
        en: `${joinLocalized(names, 'en')} can use ${stat} on ${slotEn} in niche builds. Keep only if it rolls ${subsEn || 'the needed substats'}.`,
        es: `${joinLocalized(names, 'es')} puede(n) usar ${statEs} en ${slotEs} en builds de nicho. Consérvala solo si sube ${subsEs || 'las subestadísticas necesarias'}.`,
      }
    } else {
      reasoning = {
        en: `${joinLocalized(names, 'en')} can use ${stat} on ${slotEn} for this set. Useful substats for this piece: ${subsEn || 'none — the main stat cannot repeat as a substat'}.`,
        es: `${joinLocalized(names, 'es')} puede(n) usar ${statEs} en ${slotEs} para este set. Subestadísticas útiles para esta pieza: ${subsEs || 'ninguna — la stat principal no puede repetirse como subestadística'}.`,
      }
    }
    return { mainStat, verdict, substats, usedBy, reasoning }
  })
}

function buildFlowerAndPlume(set: GBArtifactSet, characters: CharacterUsage[]) {
  const combos = new Map<string, { substats: StatKey[]; usedBy: string[]; names: LocalizedText[] }>()
  for (const character of characters) {
    const stats = uniqueStats(
      character.substatsPriority.filter((stat) => !['HP', 'ATK', 'DEF'].includes(stat)),
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
  const topStats = uniqueStats(
    characters.flatMap((character) => character.substatsPriority).filter((stat) => !['HP', 'ATK', 'DEF'].includes(stat)),
  )
  return {
    keepCombinations: [...combos.values()].slice(0, 8).map((combo) => ({
      substats: combo.substats,
      usedBy: combo.usedBy,
      reasoning: {
        en: `${joinLocalized(combo.names, 'en')} can use ${combo.substats.map((stat) => statLabel(stat, 'en')).join(' + ')} on this set's Flower and Plume.`,
        es: `${joinLocalized(combo.names, 'es')} busca(n) ${combo.substats.map((stat) => statLabel(stat, 'es')).join(' + ')} en la Flor y la Pluma de este set.`,
      },
    })),
    discardRule: {
      en: `Flowers and plumes with no ${topStats.map((stat) => statLabel(stat, 'en')).join(', ')} and no useful upgrades can be safely recycled in the Relic Strongbox.`,
      es: `Las Flores y Plumas sin ${topStats.map((stat) => statLabel(stat, 'es')).join(', ')} ni mejoras útiles se pueden reciclar sin riesgo en el Relicario.`,
    },
  }
}

function buildSummary(set: GBArtifactSet, setNames: LocalizedText, characters: CharacterUsage[]): LocalizedText {
  const names = characters.slice(0, 4).map((character) => character.name)
  const mustSands = characters.flatMap((character) => character.mainStats.sands)
  const mustGoblets = characters.flatMap((character) => character.mainStats.goblet)
  const mustCirclets = characters.flatMap((character) => character.mainStats.circlet)
  const summary = (lang: 'en' | 'es') => {
    const unique = (stats: StatKey[]) => [...new Set(stats)].slice(0, 4).map((stat) => statLabel(stat, lang)).join(', ')
    return lang === 'en'
      ? `${setNames.en} is a ${set.rarity}★ set used by ${joinLocalized(names, 'en')}. Keep Sands with ${unique(mustSands) || 'useful main stats'}, Goblets with ${unique(mustGoblets) || 'useful main stats'} and Circlets with ${unique(mustCirclets) || 'useful main stats'}. Everything else is fodder unless it is a strong off-piece.`
      : `${setNames.es} es un set de ${set.rarity}★ usado por ${joinLocalized(names, 'es')}. Conserva Arenas con ${unique(mustSands) || 'estadísticas principales útiles'}, Cálices con ${unique(mustGoblets) || 'estadísticas principales útiles'} y Tiaras con ${unique(mustCirclets) || 'estadísticas principales útiles'}. El resto es material de reciclaje salvo que sea una gran pieza externa.`
  }
  return { en: summary('en'), es: summary('es') }
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
    iconUrl: en.iconUrl,
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
    summaryVerdict: buildSummary(en, setNames, characters),
    flowerAndPlumeRules: buildFlowerAndPlume(en, characters),
    slotRules: {
      sands: buildSlotRules(en, setNames, characters, 'sands'),
      goblet: buildSlotRules(en, setNames, characters, 'goblet'),
      circlet: buildSlotRules(en, setNames, characters, 'circlet'),
    },
    characters,
  }
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

  const setDefinitions: { target: TargetSetConfig; en: GBArtifactSet; es?: GBArtifactSet }[] = []
  for (const target of targets) {
    const en = enById.get(target.id)
    if (!en) {
      console.warn(`[build-dataset] ${target.en} not found in EN index, skipping`)
      continue
    }
    const es = esById.get(target.id)
    if (!es) console.warn(`[build-dataset] ${target.en} not found in ES index; using EN bonuses as fallback`)
    setDefinitions.push({ target, en, es })
  }

  const slugs = [...new Set(setDefinitions.flatMap((definition) => definition.en.users.map((user) => user.slug)))]
  console.log(`[build-dataset] characters to inspect: ${slugs.length}`)

  const characterEntries = await mapWithConcurrency(slugs, GB_CONCURRENCY, async (slug) => {
    try {
      const data = await fetchCharacter(slug, targets)
      console.log(`  [gb] ${data.name.en} (${slug})`)
      return [slug, data] as const
    } catch (error) {
      console.warn(`  [gb] failed ${slug}: ${(error as Error).message}`)
      return [slug, null] as const
    }
  })
  const charactersBySlug = new Map(characterEntries)

  const kqmEntries = await mapWithConcurrency(slugs, KQM_CONCURRENCY, async (slug) => {
    const character = charactersBySlug.get(slug)
    if (!character) return [slug, null] as const
    const targetNames = [
      ...new Set(
        setDefinitions
          .filter((definition) => definition.en.users.some((user) => user.slug === slug))
          .flatMap((definition) => [definition.target.en, definition.target.es, ...definition.target.aliases]),
      ),
    ]
    try {
      const guide = await fetchKqmGuide(slug, character.name.en, targetNames)
      console.log(`  [kqm] ${character.name.en}: ${guide ? `${guide.slug} ${guide.version?.raw ?? 'no-version'} recommends=${guide.recommendsSet}` : 'not found'}`)
      return [slug, guide] as const
    } catch (error) {
      console.warn(`  [kqm] failed ${slug}: ${(error as Error).message}`)
      return [slug, null] as const
    }
  })
  const kqmBySlug = new Map(kqmEntries)

  const sets: ArtifactSetTriage[] = []
  for (const { target, en, es } of setDefinitions) {
    const characters: CharacterUsage[] = []
    for (const user of en.users) {
      const character = charactersBySlug.get(user.slug)
      if (!character) continue
      const resolved = resolveCharacter(character, target, user.buildId, user.rank, kqmBySlug.get(user.slug) ?? null)
      if (!resolved) continue
      if (characters.some((entry) => entry.characterId === resolved.usage.characterId)) continue
      characters.push(resolved.usage)
    }
    characters.sort((a, b) => {
      const order: Record<UsageType, number> = { '4pc BiS': 0, '4pc Alternative': 1, '2pc Combo': 2 }
      return order[a.usageType] - order[b.usageType] || a.name.en.localeCompare(b.name.en)
    })
    console.log(`[build-dataset] ${target.en}: ${characters.length} usable characters`)
    sets.push(makeSetTriage(target, en, es, characters))
  }

  const dataset = {
    generatedAt: new Date().toISOString(),
    version: 'MVP-9-sets',
    source: 'Genshin-Builds (EN/ES) + KeqingMains Quickguides',
    sets,
  }

  await mkdir(path.dirname(DATA_OUTPUT), { recursive: true })
  await writeFile(DATA_OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')
  console.log(`[build-dataset] wrote ${DATA_OUTPUT} (${sets.length} sets, ${sets.reduce((total, set) => total + set.characters.length, 0)} character usages)`)

  const auditRows = sets.flatMap((set) =>
    set.characters.map((character) => ({
      Personaje: character.name.en,
      Set: set.name.en,
      'Versión GB': character.sourceValidation.gbVersion,
      'Versión KQM': character.sourceValidation.kqmVersion ?? '—',
      'Fuente Ganadora': character.sourceValidation.primarySource,
      Motivo: character.sourceValidation.resolutionReason,
    })),
  )
  console.log('\n[build-dataset] source resolution audit')
  console.table(auditRows)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
