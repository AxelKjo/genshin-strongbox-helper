import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'
import type { StatKey } from '../../src/types/artifacts'
import { hasCritTie, hasErUntilRequirement, normalizeStatList } from '../../src/lib/stats'
import { KQM_BASE, TARGET_SETS, type TargetSetConfig } from './config'
import { fetchCached } from './http'

export interface KqmVersion {
  raw: string
  major: number
  minor: number
}

export interface KqmSetRecommendation {
  name: string
  label: string
  standard: boolean
}

export interface KqmStandardSetRecommendation {
  setId: string
  name: string
  rank: 1 | 2
  pieceCount: 2 | 4
  rawLabel: string
}

export interface KqmGuide {
  slug: string
  url: string
  version?: KqmVersion
  mainStats: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] }
  substats: StatKey[]
  critTie: boolean
  erUntilRequirement: boolean
  standardSets: KqmStandardSetRecommendation[]
  recommendsSet: boolean
  recommendedSets: string[]
  setRecommendations: KqmSetRecommendation[]
}

export interface KqmArtifactRow {
  label: string
  description: string
  is4pc: boolean
  is2pc: boolean
  rank: number | null
}

const SLUG_OVERRIDES: Record<string, string> = {
  'raiden-shogun': 'raiden',
  'shogun-raiden': 'raiden',
  'kaedehara-kazuha': 'kazuha',
  'kamisato-ayaka': 'ayaka',
  'kamisato-ayato': 'ayato',
  'kujou-sara': 'sara',
  'sangonomiya-kokomi': 'kokomi',
  'shikanoin-heizou': 'heizou',
  'arataki-itto': 'itto',
  'yae-miko': 'yae',
  'yumemizuki-mizuki': 'mizuki',
  'kuki-shinobu': 'shinobu',
  'yun-jin': 'yunjin',
  'hu-tao': 'hu-tao',
  'traveler': 'traveler',
  'anemo-traveler': 'anemo-traveler',
  'geo-traveler': 'geo-traveler',
  'electro-traveler': 'electro-traveler',
  'dendro-traveler': 'dendro-traveler',
  'hydro-traveler': 'hydro-traveler',
  'pyro-traveler': 'pyro-traveler',
}

const NAME_OVERRIDES: Record<string, string> = {
  'kaedehara-kazuha': 'kazuha',
  'kamisato-ayaka': 'ayaka',
  'kamisato-ayato': 'ayato',
  'raiden-shogun': 'raiden',
  'shogun-raiden': 'raiden',
  'kujou-sara': 'sara',
  'sangonomiya-kokomi': 'kokomi',
  'shikanoin-heizou': 'heizou',
  'arataki-itto': 'itto',
  'yae-miko': 'yae',
  'kuki-shinobu': 'shinobu',
}

const PREFIXES = ['kaedehara-', 'kamisato-', 'kujou-', 'sangonomiya-', 'shikanoin-', 'arataki-', 'yae-', 'kuki-']

export function kqmSlugCandidates(characterId: string, englishName: string): string[] {
  const normalized = characterId.toLowerCase().trim()
  const fromName = englishName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const candidates = new Set<string>()
  const override = SLUG_OVERRIDES[normalized] ?? NAME_OVERRIDES[normalized]
  if (override) candidates.add(override)
  candidates.add(normalized)
  if (fromName) candidates.add(fromName)
  for (const prefix of PREFIXES) {
    if (normalized.startsWith(prefix)) candidates.add(normalized.slice(prefix.length))
    if (fromName.startsWith(prefix)) candidates.add(fromName.slice(prefix.length))
  }
  return [...candidates].filter(Boolean)
}

function romanToNumber(roman: string): number {
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 }
  let total = 0
  for (let i = 0; i < roman.length; i += 1) {
    const current = values[roman[i]] ?? 0
    const next = values[roman[i + 1]] ?? 0
    total += current < next ? -current : current
  }
  return total
}

export function parseVersion(raw: string): KqmVersion | undefined {
  const numeric = raw.match(/(\d+)\s*[.:]\s*(\d+)/)
  if (numeric) {
    return { raw: `${numeric[1]}.${numeric[2]}`, major: Number(numeric[1]), minor: Number(numeric[2]) }
  }
  const luna = raw.match(/Luna\s+([IVX]+)/i)
  if (luna) {
    const minor = Math.max(0, romanToNumber(luna[1].toUpperCase()) - 1)
    return { raw: `Luna ${luna[1].toUpperCase()}`, major: 6, minor }
  }
  return undefined
}

export function formatVersion(version: KqmVersion | undefined): string | undefined {
  return version ? `${version.major}.${version.minor}` : undefined
}

function cleanText(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function parseMainStatsTable($: cheerio.CheerioAPI, table: cheerio.Cheerio<AnyNode>) {
  const rows = table.find('tr')
  if (rows.length < 2) return null
  const headers = rows.eq(0).find('th,td').map((_, cell) => cleanText($(cell).text()).toLowerCase()).get()
  if (!headers.some((h) => h.includes('sands')) || !headers.some((h) => h.includes('goblet')) || !headers.some((h) => h.includes('circlet'))) {
    return null
  }
  const result: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] } = { sands: [], goblet: [], circlet: [] }
  rows.slice(1).each((_, row) => {
    const values = $(row).find('td,th').map((__, cell) => cleanText($(cell).text())).get()
    headers.forEach((header, index) => {
      const slot = header.includes('sands') ? 'sands' : header.includes('goblet') ? 'goblet' : header.includes('circlet') ? 'circlet' : null
      if (!slot) return
      for (const stat of normalizeStatList(values[index] ?? '')) {
        if (!result[slot].includes(stat)) result[slot].push(stat)
      }
    })
  })
  return result
}

const KQM_HARD_DISQUALIFIERS = [
  /\b(?:c[1-6]|constellation)\s+only\b/i,
  /\bonly\s+(?:with|viable\s+with|recommended\s+with)\s+c[1-6]\b/i,
  /\bfor fun\b/i,
  /\bmeme\b/i,
  /\bhyperspecific\b/i,
  /\bnot recommended\s+overall\b/i,
  /\bnot worth\s+using\b/i,
  /\bnot worth\s+farming\b/i,
  /\bonly\s+with\s+furina\b/i,
  /\brequires?\s+furina\b/i,
  /\bplaceholder\b/i,
  /\btransitional\b/i,
  /\bcope\b/i,
]

export const KQM_FALLBACK_ACRONYMS: Record<string, string> = {
  vv: 'viridescent-venerer',
  sms: 'silken-moons-serenade',
  notsu: 'night-of-the-skys-unveiling',
  nsu: 'night-of-the-skys-unveiling',
  fhw: 'fragment-of-harmonic-whimsy',
  scroll: 'scroll-of-the-hero-of-cinder-city',
  deepwood: 'deepwood-memories',
  dm: 'deepwood-memories',
  gt: 'golden-troupe',
  gd: 'gilded-dreams',
  no: 'noblesse-oblige',
  cw: 'crimson-witch-of-flames',
  fopl: 'flower-of-paradise-lost',
  wt: 'wanderers-troupe',
  gf: 'gladiators-finale',
  sr: 'shimenawas-reminiscence',
  lno: 'long-nights-oath',
  nd: 'nymphs-dream',
  tf: 'thundering-fury',
  totm: 'tenacity-of-the-millelith',
  bs: 'blizzard-strayer',
  eosf: 'emblem-of-severed-fate',
  mh: 'marechaussee-hunter',
  ohc: 'ocean-hued-clam',
}

export function matchKqmSetToTarget(
  rawLabel: string,
  targetSets: TargetSetConfig[] = TARGET_SETS,
): TargetSetConfig | null {
  const cleaned = rawLabel
    .replace(/[’‘`]/g, "'")
    .replace(/^4\s*-?\s*p(?:c|iece)?\s*/i, '')
    .replace(/^4\s+/i, '')
    .trim()
    .toLowerCase()

  const cleanFullName = cleaned.replace(/\s*\([^)]*\)/g, '').trim()

  for (const set of targetSets) {
    const enNorm = set.en.replace(/[’‘`]/g, "'").toLowerCase()
    if (
      cleanFullName === enNorm ||
      cleanFullName.includes(enNorm) ||
      (cleanFullName.length >= 4 && enNorm.includes(cleanFullName))
    ) {
      return set
    }
    for (const alias of set.aliases) {
      const aliasNorm = alias.replace(/[’‘`]/g, "'").toLowerCase()
      if (cleanFullName === aliasNorm || cleanFullName.includes(aliasNorm)) {
        return set
      }
    }
  }

  const parenMatch = cleaned.match(/\(([^)]+)\)/)
  const acroCandidate = parenMatch ? parenMatch[1].trim().toLowerCase() : cleanFullName
  const mappedId = KQM_FALLBACK_ACRONYMS[acroCandidate]
  if (mappedId) {
    const found = targetSets.find((s) => s.id === mappedId)
    if (found) return found
  }

  return null
}

export const GENERIC_KQM_2PC: Record<string, string[]> = {
  'hp%': ['tenacity-of-the-millelith', 'vourukashas-glow'],
  hp: ['tenacity-of-the-millelith', 'vourukashas-glow'],
  totm: ['tenacity-of-the-millelith'],
  vourukasha: ['vourukashas-glow'],
  voroukasha: ['vourukashas-glow'],
  'er%': ['emblem-of-severed-fate'],
  er: ['emblem-of-severed-fate'],
  esf: ['emblem-of-severed-fate'],
  em: ['wanderers-troupe', 'gilded-dreams', 'flower-of-paradise-lost'],
  'atk%': ['gladiators-finale', 'shimenawas-reminiscence'],
  atk: ['gladiators-finale', 'shimenawas-reminiscence'],
  tf: ['thundering-fury'],
  cw: ['crimson-witch-of-flames'],
  no: ['noblesse-oblige'],
  bs: ['blizzard-strayer'],
  mh: ['marechaussee-hunter'],
  gt: ['golden-troupe'],
  vv: ['viridescent-venerer'],
}

export interface MatchedSetWithPieceCount {
  set: TargetSetConfig
  pieceCount: 2 | 4
}

export function extractSetsWithPieceCount(
  rawLabel: string,
  targetSets: TargetSetConfig[] = TARGET_SETS,
): MatchedSetWithPieceCount[] {
  const isRow2pc = /2\s*-?\s*p(?:c|iece)?\b/i.test(rawLabel) || /\b2pc\b/i.test(rawLabel)
  const isRow4pc = /4\s*-?\s*p(?:c|iece)?\b/i.test(rawLabel) || /^4\s+[A-Za-z]/i.test(rawLabel)
  const defaultPieceCount: 2 | 4 = isRow2pc && !isRow4pc ? 2 : 4

  const parts = rawLabel.split(/\s*(?:\/|\+|,|\band\b|\bor\b)\s*/i)
  const results: MatchedSetWithPieceCount[] = []

  for (const part of parts) {
    const isPart2pc = /2\s*-?\s*p(?:c|iece)?\b/i.test(part) || /\b2pc\b/i.test(part)
    const isPart4pc = /4\s*-?\s*p(?:c|iece)?\b/i.test(part) || /^4\s+[A-Za-z]/i.test(part)
    const pieceCount: 2 | 4 = isPart2pc ? 2 : isPart4pc ? 4 : defaultPieceCount

    const set = matchKqmSetToTarget(part, targetSets)
    if (set) {
      if (!results.some((r) => r.set.id === set.id)) {
        results.push({ set, pieceCount })
      }
      continue
    }

    if (pieceCount === 2) {
      const clean = part.replace(/2\s*-?\s*p(?:c|iece)?/gi, '').trim().toLowerCase()
      for (const [key, setIds] of Object.entries(GENERIC_KQM_2PC)) {
        if (clean === key || clean.startsWith(key + ' ') || clean.endsWith(' ' + key) || clean.includes(key)) {
          for (const setId of setIds) {
            const found = targetSets.find((ts) => ts.id === setId)
            if (found && !results.some((r) => r.set.id === found.id)) {
              results.push({ set: found, pieceCount: 2 })
            }
          }
        }
      }
    }
  }

  return results
}

export function extractSetsFromLabel(
  rawLabel: string,
  targetSets: TargetSetConfig[] = TARGET_SETS,
): TargetSetConfig[] {
  return extractSetsWithPieceCount(rawLabel, targetSets).map((r) => r.set)
}

function isStandardKqmRecommendation(row: KqmArtifactRow): boolean {
  if (!row.is4pc && !row.is2pc) return false
  const haystack = `${row.label} ${row.description}`
  if (KQM_HARD_DISQUALIFIERS.some((pattern) => pattern.test(haystack))) return false
  return row.rank !== null && row.rank <= 2
}

function headingLevel(tagName: string): number {
  const match = tagName.match(/^h([1-6])$/i)
  return match ? Number.parseInt(match[1], 10) : 0
}

function extractArtifactRows(
  $: cheerio.CheerioAPI,
  targetSets: TargetSetConfig[] = TARGET_SETS,
): KqmArtifactRow[] {
  const rows: KqmArtifactRow[] = []
  const seen = new Set<string>()
  $('h1,h2,h3,h4,h5,h6').each((_, heading) => {
    const headingNode = $(heading)
    const headingText = cleanText(headingNode.text())
    if (/teammate/i.test(headingText)) return
    if (!/artifact sets\b/i.test(headingText)) return
    const sectionLevel = headingLevel(headingNode.get(0)?.tagName ?? '')
    if (!sectionLevel) return

    let subheading = ''
    let node = headingNode.next()
    while (node.length) {
      const tagName = node.get(0)?.tagName ?? ''
      const nodeLevel = headingLevel(tagName)
      if (nodeLevel && nodeLevel <= sectionLevel) break
      if (nodeLevel) {
        subheading = cleanText(node.text()).toLowerCase()
      } else if (!/niche|other|teammate/.test(subheading)) {
        const tables = node.is('table') ? node : node.find('table')
        tables.each((__, table) => {
          let rankCounter = 0
          $(table).find('tr').each((___, row) => {
            const cells = $(row).find('td,th')
            if (cells.length < 2) return
            const label = cleanText(cells.eq(0).text())
            const description = cleanText(cells.eq(1).text())
            if (!label || !description) return
            const key = `${label}|${description}`
            if (seen.has(key)) return
            seen.add(key)

            const is2pc = /2\s*-?\s*p(?:c|iece)?\b/i.test(label) || /\b2pc\b/i.test(label)
            const is4pc =
              /4\s*-?\s*p(?:c|iece)?\b/i.test(label) ||
              /^4\s+[A-Za-z]/i.test(label) ||
              (!is2pc && extractSetsWithPieceCount(label, targetSets).some((r) => r.pieceCount === 4))
            const matchesSets = extractSetsWithPieceCount(label, targetSets).length > 0
            const isArtifact = is4pc || is2pc || matchesSets

            let rowRank: number | null = null
            if (isArtifact) {
              const haystack = `${label} ${description}`
              const isDisqualified = KQM_HARD_DISQUALIFIERS.some((p) => p.test(haystack))
              if (!isDisqualified) {
                rankCounter++
                rowRank = rankCounter
              }
            }

            rows.push({
              label,
              description,
              is4pc,
              is2pc,
              rank: rowRank,
            })
          })
        })
      }
      node = node.next()
    }
  })
  return rows
}

export async function fetchKqmGuide(
  characterId: string,
  englishName: string,
  targetSetsInput: TargetSetConfig[] | string[] = TARGET_SETS,
): Promise<KqmGuide | null> {
  const targetSets: TargetSetConfig[] =
    targetSetsInput.length > 0 && typeof targetSetsInput[0] === 'string'
      ? TARGET_SETS
      : (targetSetsInput as TargetSetConfig[])

  const candidates = kqmSlugCandidates(characterId, englishName)
  for (const slug of candidates) {
    const url = `${KQM_BASE}/q/${slug}-quickguide/`
    const response = await fetchCached(url, { namespace: 'kqm' })
    if (response.status === 404) continue
    const $ = cheerio.load(response.html)
    $('script,style,noscript').remove()
    const title = cleanText($('title').text())
    if (!/quick guide/i.test(title)) continue

    const versionPattern = /version\s*:?\s*[^0-9A-Za-z]*(\d+\s*[.:]\s*\d+|luna\s+[ivx]+)/i
    const headingTexts = $('h1,h2,h3,h4,h5,h6')
      .map((_, heading) => cleanText($(heading).text()))
      .get()
      .filter((text) => text.length <= 160)
    const versionHeading =
      headingTexts.find((text) => /updated\s+(?:for|to)\s+version/i.test(text)) ??
      headingTexts.find((text) => /^\s*version\b/i.test(text))
    const versionMatch =
      versionHeading?.match(versionPattern) ??
      cleanText($('body').text()).match(/(?:updated\s+(?:for|to)\s+)?version\s*:?\s*[^0-9A-Za-z]*(\d+\s*[.:]\s*\d+|luna\s+[ivx]+)/i)
    const version = parseVersion(versionMatch?.[1]?.trim() ?? '')

    const merged: KqmGuide['mainStats'] = { sands: [], goblet: [], circlet: [] }
    $('table').each((_, table) => {
      const parsed = parseMainStatsTable($, $(table))
      if (!parsed) return
      for (const slot of ['sands', 'goblet', 'circlet'] as const) {
        for (const stat of parsed[slot]) {
          if (!merged[slot].includes(stat)) merged[slot].push(stat)
        }
      }
    })

    const substats: StatKey[] = []
    const priorityTexts: string[] = []
    $('.substats, p, li').each((_, element) => {
      const text = cleanText($(element).text())
      const match = text.match(/Stat Priority\s*:\s*(.+)$/i)
      if (match) priorityTexts.push(match[1])
    })
    let critTie = false
    let erUntilRequirement = false
    for (const priority of priorityTexts) {
      if (hasCritTie(priority)) critTie = true
      if (hasErUntilRequirement(priority)) erUntilRequirement = true
      for (const stat of normalizeStatList(priority)) {
        if (!substats.includes(stat)) substats.push(stat)
      }
    }

    const artifactRows = extractArtifactRows($, targetSets)
    const standardSets: KqmStandardSetRecommendation[] = []
    for (const row of artifactRows) {
      if (!isStandardKqmRecommendation(row)) continue
      const rank = Math.min(2, Math.max(1, row.rank ?? 1)) as 1 | 2
      const matched = extractSetsWithPieceCount(row.label, targetSets)
      for (const { set, pieceCount } of matched) {
        const existingIndex = standardSets.findIndex((s) => s.setId === set.id)
        if (existingIndex >= 0) {
          const existing = standardSets[existingIndex]
          if (rank < existing.rank) {
            existing.rank = rank
            existing.pieceCount = pieceCount
          } else if (rank === existing.rank && pieceCount > existing.pieceCount) {
            existing.pieceCount = pieceCount
          }
        } else {
          standardSets.push({
            setId: set.id,
            name: set.en,
            rank,
            pieceCount,
            rawLabel: row.label,
          })
        }
      }
    }

    const recommendedSets = standardSets.map((entry) => entry.name)
    const recommendsSet = standardSets.length > 0
    const setRecommendations: KqmSetRecommendation[] = standardSets.map((s) => ({
      name: s.name,
      label: s.rawLabel,
      standard: true,
    }))

    return {
      slug,
      url,
      version,
      mainStats: merged,
      substats,
      critTie,
      erUntilRequirement,
      standardSets,
      recommendsSet,
      recommendedSets,
      setRecommendations,
    }
  }
  return null
}
