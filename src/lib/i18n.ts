export type Lang = 'en' | 'es'

export const UI = {
  appTitle: { en: 'Genshin Strongbox Helper', es: 'Genshin Strongbox Helper' },
  appSubtitle: {
    en: 'Artifact keep-vs-discard guide for Genshin Impact.',
    es: 'Guía para saber qué artefactos conservar y descartar en Genshin Impact.',
  },
  criteria: { en: 'Criteria', es: 'Criterio' },
  criteriaP1: {
    en: 'This tool aims to cover only the main sets and most relevant alternatives for each character, so niche builds or highly specific variants are not considered.',
    es: 'Esta herramienta solo contempla los sets principales y alternativas más relevantes de cada personaje, por lo que no se consideran builds de nicho o variantes muy específicas.',
  },
  criteriaP2: {
    en: 'This is not a character build guide, so recommendations are not explanatory, lack context, and are deliberately condensed. When in doubt, it is always recommended to use it together with the referenced guides to make more informed discard decisions.',
    es: 'Al no ser una guía de builds, las recomendaciones no incluyen explicaciones ni contexto y están deliberadamente condensadas. Ante cualquier duda, se recomienda utilizarla en conjunto con las guías referenciadas para tomar decisiones de descarte más informadas.',
  },
  searchPlaceholder: {
    en: 'Search set or character...',
    es: 'Busca un set o personaje...',
  },
  searchSets: { en: 'Search sets', es: 'Buscar sets' },
  expandSidebar: { en: 'Expand set list', es: 'Expandir lista de sets' },
  collapseSidebar: { en: 'Collapse set list', es: 'Compactar lista de sets' },
  sets: { en: 'Artifact sets', es: 'Sets de artefactos' },
  noResults: { en: 'No sets match your search.', es: 'Ningún set coincide con la búsqueda.' },
  loading: { en: 'Loading triage data...', es: 'Cargando datos del clasificador...' },
  loadError: { en: 'Could not load the dataset.', es: 'No se pudo cargar el conjunto de datos.' },
  characters: { en: 'characters', es: 'personajes' },
  twoPiece: { en: '2-piece', es: '2 piezas' },
  fourPiece: { en: '4-piece', es: '4 piezas' },
  description: { en: 'Description', es: 'Descripción' },
  settings: { en: 'Settings', es: 'Ajustes' },
  hide: { en: 'Hide', es: 'Ocultar' },
  keepMatrix: { en: 'Keep vs. Discard matrix', es: 'Matriz Conservar vs. Descartar' },
  excludeAlternative: {
    en: 'Exclude alternative builds',
    es: 'Excluir builds alternativas',
  },
  reverseOrder: {
    en: 'Reverse order (Show discards on bottom)',
    es: 'Invertir orden (Mostrar descartes abajo)',
  },
  compactMatrix: {
    en: 'Compact matrix',
    es: 'Compactar matriz',
  },
  sands: { en: 'Sands', es: 'Arenas' },
  goblet: { en: 'Goblet', es: 'Cáliz' },
  circlet: { en: 'Circlet', es: 'Tiara' },
  flowerPlume: { en: 'Flower & Plume', es: 'Flor y Pluma' },
  mustKeep: { en: 'Keep', es: 'Conservar' },
  situational: { en: 'Situational', es: 'Situacional' },
  safeDiscard: { en: 'Safe discard', es: 'Descartar' },
  targetSubstats: { en: 'Target substats', es: 'Subestadísticas objetivo' },
  usedBy: { en: 'Used by', es: 'Usado por' },
  allUsers: { en: 'All', es: 'Todos' },
  allBut: { en: 'All but', es: 'Todos menos' },
  keepCombinations: { en: 'Keep combinations', es: 'Combinaciones a conservar' },
  characterBreakdown: { en: 'Character breakdown', es: 'Desglose por personaje' },
  characterBreakdownNote: {
    en: 'It is not recommended to use this tool as a character build guide. For that, consider checking the linked guides.',
    es: 'No se recomienda utilizar esta herramienta como guía para buildear personajes. Para ello, se sugiere consultar las guías enlazadas.',
  },
  bisLegend: {
    en: 'Used when sources indicate it is the best set for the character, either in general or under a prominent composition or specific playstyle.',
    es: 'Utilizada cuando las fuentes indican que es el mejor set para el personaje, ya sea en general o bajo una composición destacada o playstyle específico.',
  },
  alternativeLegend: {
    en: 'Used for second-best options or situational sets restricted to certain teams or conditions.',
    es: 'Utilizada para segundas mejores opciones o sets situacionales restringidos a ciertos equipos o condiciones.',
  },
  alternativeLegendTooltip: {
    en: 'The line between whether a conditional set is listed as BiS or Alternative depends on the discretion of each source. A conditional set in "Alternative" can be the best option if you play that specific composition. Check the guides to see their conditions.',
    es: 'La línea entre si un set condicional figura como BiS o Alternativa depende del criterio de cada fuente. Un set condicional en "Alternativa" puede ser la mejor opción si juegas esa composición específica. Consulta las guías para ver sus condiciones.',
  },
  role: { en: 'Role', es: 'Rol' },
  mainStats: { en: 'Main stats', es: 'Estadísticas principales' },
  substats: { en: 'Substats', es: 'Subestadísticas' },
  erUntilRequirement: { en: 'Until Req', es: 'Hasta requisito' },
  source: { en: 'Source', es: 'Fuente' },
  validatedKqm: { en: 'Validated with KQM', es: 'Validado con KQM' },
  gbSource: {
    en: 'Genshin-Builds (Genshin Impact Helper Team)',
    es: 'Genshin-Builds (Genshin Impact Helper Team)',
  },
  consensus: { en: 'Both agree', es: 'Ambas fuentes coinciden' },
  slot: { en: 'Slot', es: 'Pieza' },
  mainStat: { en: 'Main stat', es: 'Estadística principal' },
  offPiece: { en: 'Off-piece candidate', es: 'Candidata a pieza externa' },
  allSets: { en: 'All sets', es: 'Todos los sets' },
  sourceRule: {
    en: 'The most recently updated source wins. KQM prevails only when its guide is newer and recommends the set.',
    es: 'Prevalece la fuente actualizada al parche más reciente. KQM solo gana cuando su guía es más nueva y recomienda el set.',
  },
  footerDisclaimer: {
    en: 'Unofficial, non-commercial fan-made tool. Not affiliated with or endorsed by HoYoverse.',
    es: 'Herramienta no oficial y sin ánimo de lucro creada por fans. No está afiliada ni respaldada por HoYoverse.',
  },
  usage: {
    '4pc BiS': { en: '4pc BiS', es: '4pc BiS' },
    '4pc Alternative': { en: '4pc Alternative', es: '4pc Alternativa' },
    '2pc BiS': { en: '2pc BiS', es: '2pc BiS' },
    '2pc Alternative': { en: '2pc Alternative', es: '2pc Alternativa' },
    '2pc Combo': { en: '2pc Combo', es: 'Combo 2pc' },
  } as const,
  tier: {
    BiS: { en: 'BiS', es: 'BiS' },
    Alternative: { en: 'Alternative', es: 'Alternativa' },
  } as const,
  verdict: {
    MUST_KEEP: { en: 'Keep', es: 'Conservar' },
    SITUATIONAL_KEEP: { en: 'Situational', es: 'Situacional' },
    SAFE_DISCARD: { en: 'Safe discard', es: 'Descartar sin riesgo' },
  } as const,
}

export const FOOTER_ATTRIBUTION: Record<Lang, { before: string; between: string; after: string }> = {
  en: {
    before: 'Character set and stat recommendations are sourced from the outstanding work of ',
    between: ' and ',
    after: '. Please consider visiting the original sources for their full comprehensive character guides.',
  },
  es: {
    before:
      'Las recomendaciones de sets y estadísticas para los personajes provienen del excelente trabajo de ',
    between: ' y ',
    after:
      '. Por favor, considera visitar las fuentes originales para consultar sus guías de personajes completas.',
  },
}

export function t<K extends keyof typeof UI>(key: K, lang: Lang): string {
  const value = UI[key]
  if (typeof value === 'string') return value
  return (value as Record<Lang, string>)[lang]
}
