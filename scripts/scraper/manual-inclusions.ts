import type { CharacterUsage } from '../../src/types/artifacts'

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
 * Whitelist for manually preserved character builds that are conditional or omitted
 * in external sources but confirmed as standard options for specific sets.
 */
export const MANUAL_CHARACTER_INCLUSIONS: Record<string, CharacterUsage[]> = {
  'silken-moons-serenade': [AINO_USAGE],
  'noblesse-oblige': [AINO_USAGE],
}
