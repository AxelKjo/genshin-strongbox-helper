import type { LocalizedText, StatKey } from '../types/artifacts'

export const STAT_LABELS: Record<StatKey, LocalizedText> = {
  HP: { en: 'Flat HP', es: 'Vida plana' },
  'HP%': { en: 'HP%', es: 'Vida%' },
  ATK: { en: 'Flat ATK', es: 'ATQ plana' },
  'ATK%': { en: 'ATK%', es: 'ATQ%' },
  DEF: { en: 'Flat DEF', es: 'DEF plana' },
  'DEF%': { en: 'DEF%', es: 'DEF%' },
  'ER%': { en: 'Energy Recharge', es: 'Recarga de Energía' },
  EM: { en: 'Elemental Mastery', es: 'Maestría Elemental' },
  'CRIT Rate': { en: 'CRIT Rate', es: 'Prob. CRIT' },
  'CRIT DMG': { en: 'CRIT DMG', es: 'Daño CRIT' },
  'Healing Bonus': { en: 'Healing Bonus', es: 'Bono de Curación' },
  'Pyro DMG%': { en: 'Pyro DMG Bonus', es: 'Bono de Daño Pyro' },
  'Hydro DMG%': { en: 'Hydro DMG Bonus', es: 'Bono de Daño Hydro' },
  'Cryo DMG%': { en: 'Cryo DMG Bonus', es: 'Bono de Daño Cryo' },
  'Electro DMG%': { en: 'Electro DMG Bonus', es: 'Bono de Daño Electro' },
  'Anemo DMG%': { en: 'Anemo DMG Bonus', es: 'Bono de Daño Anemo' },
  'Geo DMG%': { en: 'Geo DMG Bonus', es: 'Bono de Daño Geo' },
  'Dendro DMG%': { en: 'Dendro DMG Bonus', es: 'Bono de Daño Dendro' },
  'Physical DMG%': { en: 'Physical DMG Bonus', es: 'Bono de Daño Físico' },
}

export const ELEMENTAL_DMG_STATS: StatKey[] = [
  'Pyro DMG%', 'Hydro DMG%', 'Cryo DMG%', 'Electro DMG%',
  'Anemo DMG%', 'Geo DMG%', 'Dendro DMG%', 'Physical DMG%',
]

export const SLOT_MAIN_STATS: Record<'sands' | 'goblet' | 'circlet', StatKey[]> = {
  sands: ['HP%', 'ATK%', 'DEF%', 'ER%', 'EM'],
  goblet: ['HP%', 'ATK%', 'DEF%', 'EM', ...ELEMENTAL_DMG_STATS],
  circlet: ['HP%', 'ATK%', 'DEF%', 'EM', 'CRIT Rate', 'CRIT DMG', 'Healing Bonus'],
}

const ALIASES: Record<string, StatKey> = {
  hp: 'HP', 'flat hp': 'HP', 'vida': 'HP', 'vida plana': 'HP',
  'hp%': 'HP%', 'vida%': 'HP%',
  atk: 'ATK', 'flat atk': 'ATK', atq: 'ATK', 'atq plana': 'ATK',
  'atk%': 'ATK%', 'atq%': 'ATK%',
  def: 'DEF', 'flat def': 'DEF', 'defensa': 'DEF', 'defensa plana': 'DEF',
  'def%': 'DEF%',
  'er%': 'ER%', er: 'ER%', 'energy recharge': 'ER%', 'recarga de energía': 'ER%', 'recarga de energia': 'ER%',
  em: 'EM', 'elemental mastery': 'EM', 'maestría elemental': 'EM', 'maestria elemental': 'EM',
  crit: 'CRIT Rate', 'crit rate': 'CRIT Rate', 'prob. crit': 'CRIT Rate', 'prob crit': 'CRIT Rate', 'cr': 'CRIT Rate',
  'crit dmg': 'CRIT DMG', 'crit damage': 'CRIT DMG', 'daño crit': 'CRIT DMG', 'dano crit': 'CRIT DMG', cd: 'CRIT DMG',
  'healing bonus': 'Healing Bonus', 'bono de curación': 'Healing Bonus', 'bono de curacion': 'Healing Bonus', hb: 'Healing Bonus',
  'pyro dmg bonus': 'Pyro DMG%', 'pyro dmg%': 'Pyro DMG%', 'pyro dmg': 'Pyro DMG%', 'bono de daño pyro': 'Pyro DMG%',
  'hydro dmg bonus': 'Hydro DMG%', 'hydro dmg%': 'Hydro DMG%', 'hydro dmg': 'Hydro DMG%', 'bono de daño hydro': 'Hydro DMG%',
  'cryo dmg bonus': 'Cryo DMG%', 'cryo dmg%': 'Cryo DMG%', 'cryo dmg': 'Cryo DMG%', 'bono de daño cryo': 'Cryo DMG%',
  'electro dmg bonus': 'Electro DMG%', 'electro dmg%': 'Electro DMG%', 'electro dmg': 'Electro DMG%', 'bono de daño electro': 'Electro DMG%',
  'anemo dmg bonus': 'Anemo DMG%', 'anemo dmg%': 'Anemo DMG%', 'anemo dmg': 'Anemo DMG%', 'bono de daño anemo': 'Anemo DMG%',
  'geo dmg bonus': 'Geo DMG%', 'geo dmg%': 'Geo DMG%', 'geo dmg': 'Geo DMG%', 'bono de daño geo': 'Geo DMG%',
  'dendro dmg bonus': 'Dendro DMG%', 'dendro dmg%': 'Dendro DMG%', 'dendro dmg': 'Dendro DMG%', 'bono de daño dendro': 'Dendro DMG%',
  'physical dmg bonus': 'Physical DMG%', 'physical dmg%': 'Physical DMG%', 'physical dmg': 'Physical DMG%', 'bono de daño físico': 'Physical DMG%', 'bono de dano fisico': 'Physical DMG%',
}

export function normalizeStat(raw: string): StatKey | null {
  let token = raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[«»“”"'.]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!token) return null
  if (/^crit$/.test(token)) return 'CRIT Rate'
  const direct = ALIASES[token]
  if (direct) return direct
  token = token.replace(/\s+(until requirement|hasta cumplir el requisito)$/i, '').trim()
  return ALIASES[token] ?? null
}

export function normalizeStatList(raw: string): StatKey[] {
  const parts = raw
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/(\d+(?:\.\d+)?\s*%)/g, ' $1 ')
    .replace(/[()]/g, ' | ')
    .split(/\s*(?:>|≥|=|,|\/|\||\bor\b|\bo\b|\by\b)\s*/i)
  const out: StatKey[] = []
  for (const part of parts) {
    const stat = normalizeStat(part)
    if (stat && !out.includes(stat)) out.push(stat)
    if (/\bcrit\b/i.test(part)) {
      for (const crit of ['CRIT Rate', 'CRIT DMG'] as StatKey[]) {
        if (!out.includes(crit)) out.push(crit)
      }
    }
  }
  return out
}

export function statLabel(stat: StatKey, lang: 'en' | 'es'): string {
  return STAT_LABELS[stat][lang]
}
