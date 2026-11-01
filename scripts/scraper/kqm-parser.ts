import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'
import type { StatKey } from '../../src/types/artifacts'
import { normalizeStatList } from '../../src/lib/stats'
import { KQM_BASE } from './config'
import { fetchCached } from './http'

export interface KqmVersion {
  raw: string
  major: number
  minor: number
}

export interface KqmSetRecommendation {
  name: string
  label: string
  description: string
  standard: boolean
}

export interface KqmGuide {
  slug: string
  url: string
  version?: KqmVersion
  mainStats: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] }
  substats: StatKey[]
  recommendsSet: boolean
  recommendedSets: string[]
  setRecommendations: KqmSetRecommendation[]
  setContexts: Record<string, string>
  setContext: string
  playstyle: string
}

interface KqmArtifactRow {
  label: string
  description: string
}

const SLUG_OVERRIDES: Record<string, string> = {
  'raiden-shogun': 'raiden',
  'kaedehara-kazuha': 'kazuha',
  'kamisato-ayaka': 'ayaka',
  'kamisato-ayato': 'ayato',
  'kujou-sara': 'sara',
  'sangonomiya-kokomi': 'kokomi',
  'shikanoin-heizou': 'heizou',
  'arataki-itto': 'itto',
  'yae-miko': 'yae',
  'kuki-shinobu': 'kuki-shinobu',
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
  'kujou-sara': 'sara',
  'sangonomiya-kokomi': 'kokomi',
  'shikanoin-heizou': 'heizou',
  'arataki-itto': 'itto',
  'yae-miko': 'yae',
  'kuki-shinobu': 'kuki-shinobu',
}

const PREFIXES = ['kaedehara-', 'kamisato-', 'kujou-', 'sangonomiya-', 'shikanoin-', 'arataki-', 'yae-']

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
  const numeric = raw.match(/(\d+)\s*\.\s*(\d+)/)
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
  const values = rows.eq(1).find('td,th').map((_, cell) => cleanText($(cell).text())).get()
  const result: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] } = { sands: [], goblet: [], circlet: [] }
  headers.forEach((header, index) => {
    const slot = header.includes('sands') ? 'sands' : header.includes('goblet') ? 'goblet' : header.includes('circlet') ? 'circlet' : null
    if (!slot) return
    for (const stat of normalizeStatList(values[index] ?? '')) {
      if (!result[slot].includes(stat)) result[slot].push(stat)
    }
  })
  return result
}

const KQM_CONDITIONAL = [
  /\bonly\b/i,
  /\brequires?\b/i,
  /\brequiring\b/i,
  /\bwhen\b/i,
  /\bif\b/i,
  /\bunless\b/i,
  /\bdepending\b/i,
  /\bdepends?\b/i,
  /\bfurina\b/i,
  /\bc[1-6]\b/i,
  /\bconstellation/i,
  /\bmeme\b/i,
  /\bniche\b/i,
  /\bsituational\b/i,
  /\bhyperspecific\b/i,
  /\bteams?\s+with\b/i,
  /\bpaired\s+with\b/i,
  /\benabler\b/i,
  /\bright conditions\b/i,
  /\bsecond-best\b/i,
  /\bsuboptimal\b/i,
  /\bworse\b/i,
  /\bfor fun\b/i,
  /\bnot recommended\b/i,
  /\bnot worth\b/i,
  /\bbetter\b/i,
  /\boutside of\b/i,
]

const KQM_POSITIVE = /\b(?:best|bis|best-in-slot|default|top option|preferred|most recommended|recommended|strong|great|on par|competitive|standard)\b/i

function isStandardKqmRecommendation(row: KqmArtifactRow): boolean {
  const haystack = `${row.label} ${row.description}`
  if (KQM_CONDITIONAL.some((pattern) => pattern.test(haystack))) return false
  return KQM_POSITIVE.test(row.description)
}

function headingLevel(tagName: string): number {
  const match = tagName.match(/^h([1-6])$/i)
  return match ? Number.parseInt(match[1], 10) : 0
}

function extractArtifactRows($: cheerio.CheerioAPI): KqmArtifactRow[] {
  const rows: KqmArtifactRow[] = []
  const seen = new Set<string>()
  $('h1,h2,h3,h4,h5,h6').each((_, heading) => {
    const headingNode = $(heading)
    if (!/artifact sets$/i.test(cleanText(headingNode.text()))) return
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
      } else if (!/niche|other/.test(subheading)) {
        const tables = node.is('table') ? node : node.find('table')
        tables.each((__, table) => {
          $(table).find('tr').each((___, row) => {
            const cells = $(row).find('td,th')
            if (cells.length < 2) return
            const label = cleanText(cells.eq(0).text())
            const description = cleanText(cells.eq(1).text())
            if (!label || !description) return
            const key = `${label}|${description}`
            if (seen.has(key)) return
            seen.add(key)
            rows.push({ label, description })
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
  targetSetNames: string[],
): Promise<KqmGuide | null> {
  const candidates = kqmSlugCandidates(characterId, englishName)
  for (const slug of candidates) {
    const url = `${KQM_BASE}/q/${slug}-quickguide/`
    const response = await fetchCached(url, { namespace: 'kqm' })
    if (response.status === 404) continue
    const $ = cheerio.load(response.html)
    $('script,style,noscript').remove()
    const title = cleanText($('title').text())
    if (!/quick guide/i.test(title)) continue

    const bodyText = cleanText($('body').text())
    const versionMatch = bodyText.match(/Updated for Version[^0-9A-Za-z]*(\d+\s*\.\s*\d+|Luna\s+[IVX]+)/i)
    const rawVersion = versionMatch?.[1]?.trim() ?? ''
    const version = parseVersion(rawVersion)

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
    $('.substats, p').each((_, element) => {
      const text = cleanText($(element).text())
      const match = text.match(/Stat Priority\s*:\s*(.+)$/i)
      if (match) priorityTexts.push(match[1])
    })
    for (const priority of priorityTexts) {
      for (const stat of normalizeStatList(priority)) {
        if (!substats.includes(stat)) substats.push(stat)
      }
    }

    const artifactRows = extractArtifactRows($)
    const setRecommendations: KqmSetRecommendation[] = []
    const usedRows = new Set<KqmArtifactRow>()
    for (const name of targetSetNames) {
      const row = artifactRows.find(
        (candidate) =>
          !usedRows.has(candidate) && candidate.label.toLowerCase().includes(name.toLowerCase()),
      )
      if (!row) continue
      usedRows.add(row)
      setRecommendations.push({
        name,
        label: row.label,
        description: row.description,
        standard: isStandardKqmRecommendation(row),
      })
    }
    const recommendedSets = setRecommendations.filter((entry) => entry.standard).map((entry) => entry.name)
    const setContexts: Record<string, string> = {}
    for (const entry of setRecommendations) {
      if (entry.standard) setContexts[entry.name] = entry.description
    }
    const recommendsSet = recommendedSets.length > 0
    const setContext = recommendedSets[0] ? setContexts[recommendedSets[0]] : ''

    const playstyle = cleanText($('h1').first().parent().find('h2').first().text()) || title.replace(/\s*-\s*KQM\s*$/i, '')

    return {
      slug,
      url,
      version,
      mainStats: merged,
      substats,
      recommendsSet,
      recommendedSets,
      setRecommendations,
      setContexts,
      setContext,
      playstyle,
    }
  }
  return null
}
