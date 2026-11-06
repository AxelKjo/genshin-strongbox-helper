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
    id: 'celestial-gift',
    en: 'Celestial Gift',
    es: 'Dádiva Celestial',
    aliases: ['Dádiva Celestial', 'Dadiva Celestial'],
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
  {
    id: 'long-nights-oath',
    en: "Long Night's Oath",
    es: 'Juramento de la Noche',
    aliases: [
      'Juramento de la Noche',
      'Juramento de la Larga Noche',
      "Long Night's Oath",
      'Long Nights Oath',
    ],
  },
  {
    id: 'finale-of-the-deep-galleries',
    en: 'Finale of the Deep Galleries',
    es: 'Réquiem del Corredor',
    aliases: [
      'Réquiem del Corredor',
      'Requiem del Corredor',
      'Finale of the Deep Galleries',
      'Deep Galleries',
    ],
  },
  {
    id: 'obsidian-codex',
    en: 'Obsidian Codex',
    es: 'Códice de Obsidiana',
    aliases: [
      'Códice de Obsidiana',
      'Codice de Obsidiana',
      'Obsidian Codex',
      'Obsidian',
    ],
  },
  {
    id: 'scroll-of-the-hero-of-cinder-city',
    en: 'Scroll of the Hero of Cinder City',
    es: 'Pergamino del Héroe de la Ciudad de las Cenizas',
    aliases: [
      'Pergamino del Héroe de la Ciudad de las Cenizas',
      'Pergamino del Heroe de la Ciudad de las Cenizas',
      'Scroll of the Hero of Cinder City',
      'Cinder City',
      'Hero of Cinder City',
    ],
  },
  {
    id: 'fragment-of-harmonic-whimsy',
    en: 'Fragment of Harmonic Whimsy',
    es: 'Fragmento de la Armonía Fantasiosa',
    aliases: [
      'Fragmento de la Armonía Fantasiosa',
      'Fragmento de la Armonia Fantasiosa',
      'Fragment of Harmonic Whimsy',
      'Harmonic Whimsy',
      'Whimsy',
    ],
  },
  {
    id: 'unfinished-reverie',
    en: 'Unfinished Reverie',
    es: 'Ensoñación Inacabada',
    aliases: [
      'Ensoñación Inacabada',
      'Ensonacion Inacabada',
      'Unfinished Reverie',
      'Reverie',
    ],
  },
  {
    id: 'song-of-days-past',
    en: 'Song of Days Past',
    es: 'Son de Antaño',
    aliases: [
      'Son de Antaño',
      'Son de Antano',
      'Song of Days Past',
      'Days Past',
    ],
  },
  {
    id: 'nighttime-whispers-in-the-echoing-woods',
    en: 'Nighttime Whispers in the Echoing Woods',
    es: 'Murmullo del Bosque Reverberante',
    aliases: [
      'Murmullo del Bosque Reverberante',
      'Nighttime Whispers in the Echoing Woods',
      'Nighttime Whispers',
      'Echoing Woods',
    ],
  },
  {
    id: 'golden-troupe',
    en: 'Golden Troupe',
    es: 'Compañía Dorada',
    aliases: [
      'Compañía Dorada',
      'Compania Dorada',
      'Golden Troupe',
      'Troupe',
    ],
  },
  {
    id: 'marechaussee-hunter',
    en: 'Marechaussee Hunter',
    es: 'Cazador Fantasmal',
    aliases: ['Cazador Fantasmal', 'Marechaussee'],
  },
  {
    id: 'nymphs-dream',
    en: "Nymph's Dream",
    es: 'Sueño de la Ninfa',
    aliases: [
      'Sueño de la Ninfa',
      'Sueno de la Ninfa',
      "Nymph's Dream",
      'Nymphs Dream',
      'Nymph',
    ],
  },
  {
    id: 'vourukashas-glow',
    en: "Vourukasha's Glow",
    es: 'Fulgor de Vurukasha',
    aliases: [
      'Fulgor de Vurukasha',
      'Fulgor de Vourukasha',
      "Vourukasha's Glow",
      'Vourukashas Glow',
      'Vourukasha',
    ],
  },
  {
    id: 'desert-pavilion-chronicle',
    en: 'Desert Pavilion Chronicle',
    es: 'Épica del Pabellón del Desierto',
    aliases: [
      'Épica del Pabellón del Desierto',
      'Epica del Pabellon del Desierto',
      'Desert Pavilion Chronicle',
      'Desert Pavilion',
      'Pavilion',
    ],
  },
  {
    id: 'flower-of-paradise-lost',
    en: 'Flower of Paradise Lost',
    es: 'Flor Olvidada del Paraíso',
    aliases: [
      'Flor Olvidada del Paraíso',
      'Flor Olvidada del Paraiso',
      'Flower of Paradise Lost',
      'Paradise Lost',
    ],
  },
  {
    id: 'deepwood-memories',
    en: 'Deepwood Memories',
    es: 'Recuerdos del Bosque',
    aliases: [
      'Recuerdos del Bosque',
      'Deepwood Memories',
      'Deepwood',
    ],
  },
  {
    id: 'gilded-dreams',
    en: 'Gilded Dreams',
    es: 'Sueños Áureos',
    aliases: [
      'Sueños Áureos',
      'Suenos Aureos',
      'Gilded Dreams',
      'Gilded',
    ],
  },
  {
    id: 'vermillion-hereafter',
    en: 'Vermillion Hereafter',
    es: 'Deceso del Cinabrio',
    aliases: [
      'Deceso del Cinabrio',
      'Vermillion Hereafter',
      'Vermillion',
      'Cinabrio',
    ],
  },
  {
    id: 'echoes-of-an-offering',
    en: 'Echoes of an Offering',
    es: 'Eco del Sacrificio',
    aliases: [
      'Eco del Sacrificio',
      'Echoes of an Offering',
      'Echoes',
    ],
  },
  {
    id: 'husk-of-opulent-dreams',
    en: 'Husk of Opulent Dreams',
    es: 'Cáscara de Sueños Opulentos',
    aliases: [
      'Cáscara de Sueños Opulentos',
      'Cascara de Suenos Opulentos',
      'Husk of Opulent Dreams',
      'Husk',
    ],
  },
  {
    id: 'ocean-hued-clam',
    en: 'Ocean-Hued Clam',
    es: 'Perla Oceánica',
    aliases: [
      'Perla Oceánica',
      'Perla Oceanica',
      'Ocean-Hued Clam',
      'Clam',
      'Ocean Hued Clam',
    ],
  },
  {
    id: 'emblem-of-severed-fate',
    en: 'Emblem of Severed Fate',
    es: 'Emblema del Destino',
    aliases: [
      'Emblema del Destino',
      'Emblem of Severed Fate',
      'Severed Fate',
      'Emblem',
    ],
  },
  {
    id: 'shimenawas-reminiscence',
    en: "Shimenawa's Reminiscence",
    es: 'Reminiscencia de la Purificación',
    aliases: [
      'Reminiscencia de la Purificación',
      'Reminiscencia de la Purificacion',
      "Shimenawa's Reminiscence",
      'Shimenawas Reminiscence',
      'Shimenawa',
      'Reminiscence',
    ],
  },
  {
    id: 'pale-flame',
    en: 'Pale Flame',
    es: 'Llamas Albinas',
    aliases: [
      'Llamas Albinas',
      'Pale Flame',
    ],
  },
  {
    id: 'tenacity-of-the-millelith',
    en: 'Tenacity of the Millelith',
    es: 'Tenacidad de la Geoarmada',
    aliases: [
      'Tenacidad de la Geoarmada',
      'Tenacity of the Millelith',
      'Millelith',
      'Tenacity',
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
export const CHARACTER_IMAGE_DIR = 'public/images/characters'
export const CHARACTER_IMAGE_PUBLIC_PATH = '/images/characters'
export const AMBER_CATALOG_URL = 'https://gi.yatta.moe/api/v2/en/reliquary'
export const AMBER_AVATAR_CATALOG_URL = 'https://gi.yatta.moe/api/v2/en/avatar'
export const ENKA_ASSET_BASE = 'https://enka.network/ui'

export function artifactImageUrl(setId: string): string {
  return `${ARTIFACT_IMAGE_PUBLIC_PATH}/${setId}.png`
}

export function characterImageUrl(characterId: string): string {
  return `${CHARACTER_IMAGE_PUBLIC_PATH}/${characterId}.png`
}

// Explicit, polite identification of the offline research bot and public repository
export const REQUEST_HEADERS = {
  'user-agent':
    'GenshinStrongboxHelper-Bot/1.0 (+https://github.com/AxelKjo/genshin-strongbox-helper; OpenSource Fan Tool; Respectful Cache)',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9,es;q=0.8',
}

// Polite delay between network fetches (in milliseconds) on cache-miss
export const NETWORK_DELAY_MS = 350
// Timeout for outbound requests
export const REQUEST_TIMEOUT_MS = 15000

export const KQM_CONCURRENCY = 3
export const GB_CONCURRENCY = 4
