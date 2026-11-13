/**
 * Parser for Genshin Impact Helper Team (GIHT) recommendations.
 * Source: https://genshin-impact-helper-team.github.io/genshin-builds/
 * 
 * Community theorycrafting data, builds, and recommendations are curated
 * by the Genshin Impact Helper Team and utilized under fair community attribution.
 */

import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'
import type { StatKey } from '../../src/types/artifacts'
import { hasCritTie, hasErUntilRequirement, normalizeStat, normalizeStatList } from '../../src/lib/stats'
import { ARTIFACT_INDEX_CACHE_TTL_MS, GB_BASE, TARGET_SETS, type TargetSetConfig } from './config'
import { fetchCached } from './http'

export interface GBUsageRef {
  slug: string
  characterName: string
  buildId: string
  rank: string
  href: string
}

export interface GBArtifactSet {
  id: string
  name: string
  rarity: number
  versionReleased: string
  twoPiece: string
  fourPiece: string
  users: GBUsageRef[]
}

export interface GBPieceCountUsage {
  buildId: string
  setId: string
  rank: number
  pieceCount: 2 | 4
  label: string
  conditional: boolean
}

export interface GBBuildData {
  id: string
  name: string
  nameEs?: string
  version: string
  versionEs?: string
  isBestRole: boolean
  setUsages: GBPieceCountUsage[]
  mainStats: { sands: StatKey[]; goblet: StatKey[]; circlet: StatKey[] }
  substats: StatKey[]
  critTie: boolean
  erUntilRequirement: boolean
}

export interface GBCharacterData {
  slug: string
  name: { en: string; es: string }
  element: string
  lastUpdated: { en: string; es: string }
  builds: GBBuildData[]
}

export const GENERIC_2PC_MAP: Record<string, string[]> = {
  '+20% hp set': ['tenacity-of-the-millelith', 'vourukashas-glow'],
  '+20% er set': ['emblem-of-severed-fate'],
  '+80 em set': ['wanderers-troupe', 'gilded-dreams', 'flower-of-paradise-lost'],
  '+18% atk set': ['gladiators-finale', 'shimenawas-reminiscence'],
  '+15% healing bonus set': ['ocean-hued-clam', 'maiden-beloved', 'song-of-days-past'],
  '+15% anemo dmg bonus set': ['viridescent-venerer', 'desert-pavilion-chronicle'],
  '+15% hydro dmg bonus set': ['heart-of-depth', 'nymphs-dream'],
  '+15% cryo dmg bonus set': ['blizzard-strayer'],
  '+15% pyro dmg bonus set': ['crimson-witch-of-flames'],
  '+15% electro dmg bonus set': ['thundering-fury'],
  '+15% geo dmg bonus set': ['archaic-petra'],
  '+15% dendro dmg bonus set': ['deepwood-memories'],
  '+25% physical dmg set': ['bloodstained-chivalry', 'pale-flame'],
  '+30% def set': ['husk-of-opulent-dreams'],
}

const CONDITIONAL_LABEL = /\b(?:only|requires?|requiring|when|if|depending|depends?|furina|c[1-6]|constellation|meme|niche|situational|hyperspecific|teams?\s+with|paired\s+with|enabler|conditional)\b/i

function textOf($: cheerio.CheerioAPI, el: cheerio.Cheerio<AnyNode>): string {
  return el.text().replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function normalizeSpanishCharacterName(name: string): string {
  const match = name.match(/^(Anemo|Geo|Electro|Dendro|Hydro|Pyro|Cryo)\s+(Viajero|Viajera)$/i)
  return match ? `${match[2]} ${match[1]}` : name
}

// Genshin-Builds may pack several recommendations into one label, such as
// "CRIT Rate / CRIT DMG". Split the label before normalizing it; treating the
// whole string as one stat silently drops the recommendation.
function parseMainStatValues(value: string): StatKey[] {
  const stats: StatKey[] = []
  for (const part of value.split(/\s*(?:\/|,|\bor\b)\s*/i)) {
    const stat = normalizeStat(part)
    if (stat && !stats.includes(stat)) stats.push(stat)
    if (/^\s*crit(?:ical)?\s*$/i.test(part)) {
      for (const crit of ['CRIT Rate', 'CRIT DMG'] as StatKey[]) {
        if (!stats.includes(crit)) stats.push(crit)
      }
    }
  }
  return stats
}

function hasConditionalLabel(label: string): boolean {
  return CONDITIONAL_LABEL.test(label)
}

export async function fetchArtifactIndex(lang: 'en' | 'es'): Promise<GBArtifactSet[]> {
  const url = `${GB_BASE}/${lang}/artifacts`
  const { html } = await fetchCached(url, {
    namespace: `genshin-builds/${lang}`,
    maxAgeMs: ARTIFACT_INDEX_CACHE_TTL_MS,
  })
  const $ = cheerio.load(html)
  const sets: GBArtifactSet[] = []
  $('article[data-artifact-card]').each((_, article) => {
    const node = $(article)
    const id = node.attr('data-id') ?? ''
    const name = node.attr('data-name') ?? ''
    if (!id || !name) return
    const rarity = Number.parseInt(node.attr('data-rarity') ?? '0', 10)
    const versionReleased = node.attr('data-version-released') ?? ''
    let twoPiece = ''
    let fourPiece = ''
    node.find('.artifact-set-bonus').each((__, bonus) => {
      const bonusNode = $(bonus)
      const label = textOf($, bonusNode.find('h3').first())
      const value = textOf($, bonusNode.find('div').first())
      if (label === '2P') twoPiece = value
      if (label === '4P') fourPiece = value
    })
    const users: GBUsageRef[] = []
    node.find('.artifact-set-usage-list a').each((__, chip) => {
      const link = $(chip)
      const href = link.attr('href') ?? ''
      const match = href.match(/\/genshin-builds\/[a-z]{2}\/([^?/#]+)\?build=([^&#]+)/)
      if (!match) return
      users.push({
        slug: match[1],
        characterName: textOf($, link.find('.artifact-set-usage-character').first()),
        buildId: decodeURIComponent(match[2]),
        rank: textOf($, link.find('.usage-rank-number, .rank-number').first()) || '1',
        href,
      })
    })
    sets.push({
      id,
      name,
      rarity,
      versionReleased,
      twoPiece,
      fourPiece,
      users,
    })
  })
  return sets
}

function parseBuildPanels($: cheerio.CheerioAPI, targetSets: TargetSetConfig[]): GBBuildData[] {
  const builds: GBBuildData[] = []
  $('button[data-build-tab]').each((_, button) => {
    const btn = $(button)
    const id = btn.attr('data-id') ?? ''
    const name = textOf($, btn.find('.build-switcher-name').first())
    const version = btn.attr('data-last-updated') ?? ''
    const isBestRole = btn.find('.build-badge').text().toLowerCase().includes('best role')
    const panel = $(`section[data-build-panel][data-id="${id}"]`).first()
    if (!panel.length) return

    const setUsages: GBPieceCountUsage[] = []
    panel.find('.artifact-sets-card .rank-group').each((__, group) => {
      const groupNode = $(group)
      const rankText = textOf($, groupNode.find('.rank-number').first())
      const rank = /^\d+$/.test(rankText) ? Number.parseInt(rankText, 10) : Number.POSITIVE_INFINITY
      groupNode.find('.inline-info-label.artifact-info-label').each((___, labelNode) => {
        const labelEl = $(labelNode)
        const visibleLabel = textOf($, labelEl)
        const popoverHtml = labelEl.find('[data-info-popover-html]').attr('data-info-popover-html') ?? ''
        const popover = cheerio.load(popoverHtml)
        const popoverName = textOf($, popover('.info-popover-name').first())
        const label =
          textOf($, labelEl.find('.recommendation-label-emphasized').first()) ||
          popoverName ||
          visibleLabel
        const suffix =
          textOf($, labelEl.find('.artifact-piece-suffix').first()) ||
          textOf($, labelEl.nextAll('.artifact-piece-suffix').first())
        const pieceMatch = suffix.match(/\((\d)\)/)
        const haystack = `${label} ${popoverName} ${visibleLabel}`.toLowerCase()
        let target: TargetSetConfig | undefined
        let bestMatchLen = 0
        for (const set of targetSets) {
          for (const alias of [set.en, set.es, ...set.aliases]) {
            if (haystack.includes(alias.toLowerCase()) && alias.length > bestMatchLen) {
              target = set
              bestMatchLen = alias.length
            }
          }
        }
        const pieceCount = pieceMatch?.[1] === '4' ? 4 : pieceMatch?.[1] === '2' ? 2 : null
        if (!pieceCount) return
        const isConditional = hasConditionalLabel(visibleLabel)

        if (target) {
          if (!setUsages.some((u) => u.buildId === id && u.setId === target!.id)) {
            setUsages.push({
              buildId: id,
              setId: target.id,
              rank,
              pieceCount,
              label,
              conditional: isConditional,
            })
          }
        } else if (pieceCount === 2) {
          for (const [pattern, setIds] of Object.entries(GENERIC_2PC_MAP)) {
            if (haystack.includes(pattern)) {
              for (const mappedId of setIds) {
                if (
                  targetSets.some((s) => s.id === mappedId) &&
                  !setUsages.some((u) => u.buildId === id && u.setId === mappedId)
                ) {
                  setUsages.push({
                    buildId: id,
                    setId: mappedId,
                    rank,
                    pieceCount: 2,
                    label: visibleLabel,
                    conditional: isConditional,
                  })
                }
              }
            }
          }
        }
      })
    })

    const mainStats: GBBuildData['mainStats'] = { sands: [], goblet: [], circlet: [] }
    const statsCard = panel.find('.artifact-stats-card').first()
    statsCard.find('.stat-row').each((__, row) => {
      const rowNode = $(row)
      const slotText = textOf($, rowNode.find('strong').first()).toLowerCase()
      const slot = slotText.includes('sands') ? 'sands' : slotText.includes('goblet') ? 'goblet' : slotText.includes('circlet') ? 'circlet' : null
      if (!slot) return
      const emphasized = rowNode.find('.recommendation-label-emphasized')
      const values: string[] = []
      if (emphasized.length > 0) {
        emphasized.each((___, el) => { values.push(textOf($, $(el))) })
      } else {
        values.push(textOf($, rowNode.find('span').last()))
      }
      for (const value of values) {
        for (const stat of parseMainStatValues(value)) {
          if (!mainStats[slot].includes(stat)) mainStats[slot].push(stat)
        }
      }
    })

    const substats: StatKey[] = []
    let critTie = false
    const substatSection = statsCard.find('.recommendation-section').filter((_, section) => {
      return textOf($, $(section).find('h3').first()).toLowerCase() === 'substats'
    }).first()
    substatSection.find('.rank-row').each((__, row) => {
      const label = textOf($, $(row).find('.recommendation-label-emphasized').first())
      if (hasCritTie(label)) critTie = true
      for (const stat of normalizeStatList(label)) {
        if (!substats.includes(stat)) substats.push(stat)
      }
    })

    const erUntilRequirement =
      hasErUntilRequirement(textOf($, substatSection)) ||
      hasErUntilRequirement(textOf($, panel.find('.notes-card')))

    builds.push({ id, name, version, isBestRole, setUsages, mainStats, substats, critTie, erUntilRequirement })
  })
  return builds
}

export async function fetchCharacter(
  slug: string,
  targetSets: TargetSetConfig[] = TARGET_SETS,
): Promise<GBCharacterData> {
  const [en, es] = await Promise.all([
    fetchCached(`${GB_BASE}/en/${slug}`, { namespace: 'genshin-builds/en' }),
    fetchCached(`${GB_BASE}/es/${slug}`, { namespace: 'genshin-builds/es' }),
  ])
  const $en = cheerio.load(en.html)
  const $es = cheerio.load(es.html)
  const enBuilds = parseBuildPanels($en, targetSets)
  const esBuilds = parseBuildPanels($es, targetSets)
  const byId = new Map(esBuilds.map((build) => [build.id, build]))
  const builds: GBBuildData[] = enBuilds.map((build) => {
    const esBuild = byId.get(build.id)
    if (!esBuild) return build
    return {
      ...build,
      nameEs: esBuild.name,
      versionEs: esBuild.version,
    }
  })

  return {
    slug,
    name: {
      en: textOf($en, $en('h1#character-title').first()),
      es: normalizeSpanishCharacterName(textOf($es, $es('h1#character-title').first())),
    },
    element: (($en('body').attr('data-element') ?? '').trim() || 'unknown'),
    lastUpdated: {
      en: textOf($en, $en('.last-updated strong').first()),
      es: textOf($es, $es('.last-updated strong').first()),
    },
    builds,
  }
}

export function getBuildById(data: GBCharacterData, buildId: string): GBBuildData | undefined {
  return data.builds.find((build) => build.id === buildId)
}

export function pickSetUsage(
  data: GBCharacterData,
  preferredBuildId?: string,
  targetSetId?: string,
): { build: GBBuildData; usage: GBPieceCountUsage } | null {
  const candidates: { build: GBBuildData; usage: GBPieceCountUsage }[] = []
  for (const build of data.builds) {
    if (!build.isBestRole) continue
    for (const usage of build.setUsages) {
      if (targetSetId && usage.setId !== targetSetId) continue
      if (usage.conditional) continue
      if (usage.pieceCount !== 4) continue
      if (!Number.isFinite(usage.rank) || usage.rank > 2) continue
      candidates.push({ build, usage })
    }
  }
  if (candidates.length === 0) return null
  const score = (candidate: { build: GBBuildData; usage: GBPieceCountUsage }) => {
    let value = 0
    if (candidate.build.id === preferredBuildId) value += 1000
    if (candidate.usage.pieceCount === 4) value += 200
    value += 100 - Math.min(candidate.usage.rank, 99)
    return value
  }
  candidates.sort((a, b) => score(b) - score(a))
  return candidates[0]
}
