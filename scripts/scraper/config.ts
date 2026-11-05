export type Locale = 'en' | 'es'

export interface TargetSetConfig {
  id: string
  en: string
  es: string
  aliases: string[]
}

export const GB_BASE = 'https://genshin-impact-helper-team.github.io/genshin-builds'
export const KQM_BASE = 'https://keqingmains.com'

export const TARGET_SETS: TargetSetConfig[] = [
  {
    id: 'aubade-of-morningstar-and-moon',
    en: 'Aubade of Morningstar and Moon',
    es: 'Alborada de la Estrella del Alba y la Luna',
    aliases: [
      'Alborada de la Estrella Matutina y la Luna',
      'Alborada de la Estrella del Alba y la Luna',
      'Aubade',
    ],
  },
  {
    id: 'marechaussee-hunter',
    en: 'Marechaussee Hunter',
    es: 'Cazador Fantasmal',
    aliases: ['Cazador Fantasmal', 'Marechaussee'],
  },
  {
    id: 'celestial-gift',
    en: 'Celestial Gift',
    es: 'Dádiva Celestial',
    aliases: ['Dádiva Celestial', 'Dadiva Celestial'],
  },
  {
    id: 'heart-of-the-furnace',
    en: 'Heart of the Furnace',
    es: 'Corazón Forjado',
    aliases: ['Corazon Forjado', 'Heart of Furnace'],
  },
  {
    id: 'scarlet-proof',
    en: 'Scarlet Proof',
    es: 'Testimonio Escarlata',
    aliases: ['Testimonio escarlata', 'Scarlet Proof'],
  },
  {
    id: 'disenchantment-in-deep-shadow',
    en: 'Disenchantment in Deep Shadow',
    es: 'Desilusión Congelada en las Sombras',
    aliases: [
      'Desilusión Congelada en las Sombras',
      'Desilusion Congelada en las Sombras',
      'Disenchantment',
    ],
  },
  {
    id: 'a-day-carved-from-rising-winds',
    en: 'A Day Carved From Rising Winds',
    es: 'Día de los Vientos Alzantes',
    aliases: ['Día de los Vientos Alzantes', 'Dia de los Vientos Alzantes', 'Rising Winds'],
  },
  {
    id: 'night-of-the-skys-unveiling',
    en: "Night of the Sky's Unveiling",
    es: 'Noche de la Revelación del Cielo',
    aliases: [
      'Noche de la Revelación del Cielo',
      'Noche de la Revelacion del Cielo',
      "Night of the Sky's Unveiling",
      'Night of the Skys Unveiling',
      'Skys Unveiling',
    ],
  },
  {
    id: 'silken-moons-serenade',
    en: "Silken Moon's Serenade",
    es: 'Serenata de la Luna Tejida',
    aliases: [
      'Serenata de la Luna Tejida',
      "Silken Moon's Serenade",
      'Silken Moons Serenade',
      'Silken Moon',
    ],
  },
]

export function getTargetSets(argv: string[] = process.argv.slice(2)): TargetSetConfig[] {
  const filters = argv.filter((arg) => !arg.startsWith('-')).map((arg) => arg.toLowerCase().trim())
  if (filters.length === 0) return TARGET_SETS
  return TARGET_SETS.filter((set) => {
    const haystack = [set.id, set.en, set.es, ...set.aliases].map((value) => value.toLowerCase())
    return filters.some((filter) => haystack.some((value) => value.includes(filter)))
  })
}

export const CACHE_ROOT = '.cache'
export const DATA_OUTPUT = 'public/data/artifacts-triage.json'
export const ARTIFACT_IMAGE_DIR = 'public/images/artifacts'
export const ARTIFACT_IMAGE_PUBLIC_PATH = '/images/artifacts'
export const AMBER_CATALOG_URL = 'https://gi.yatta.moe/api/v2/en/reliquary'
export const ENKA_ASSET_BASE = 'https://enka.network/ui'

export function artifactImageUrl(setId: string): string {
  return `${ARTIFACT_IMAGE_PUBLIC_PATH}/${setId}.png`
}

export const REQUEST_HEADERS = {
  'user-agent': 'GenshinStrongboxHelper/1.0 (+https://github.com/AxelKjo/genshin-strongbox-helper)',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9,es;q=0.8',
}

export const KQM_CONCURRENCY = 3
export const GB_CONCURRENCY = 4
