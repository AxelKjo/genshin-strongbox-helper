export type Lang = 'en' | 'es'

export const UI = {
  appTitle: { en: 'Genshin Strongbox Helper', es: 'Genshin Strongbox Helper' },
  appSubtitle: {
    en: 'Artifact keep-vs-discard guide for Genshin Impact.',
    es: 'Guía para saber qué artefactos conservar y descartar en Genshin Impact.',
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
  summary: { en: 'Verdict', es: 'Veredicto' },
  keepMatrix: { en: 'Keep vs. Discard matrix', es: 'Matriz Conservar vs. Descartar' },
  reverseOrder: {
    en: 'Reverse order (Show discards on top)',
    es: 'Invertir orden (Mostrar descartes arriba)',
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
  discardRule: { en: 'Discard rule', es: 'Regla de descarte' },
  characterBreakdown: { en: 'Character breakdown', es: 'Desglose por personaje' },
  characterBreakdownNote: {
    en: 'It is not recommended to use this tool as a character build guide. For that, consider checking the linked guides.',
    es: 'No se recomienda utilizar esta herramienta como guía para buildear personajes. Para ello, se sugiere consultar las guías enlazadas.',
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
  evaluator: { en: 'Does my piece work?', es: '¿Sirve mi pieza?' },
  evaluatorHelp: {
    en: 'Pick a slot, a main stat and up to 3 substats. Results update instantly.',
    es: 'Elige una pieza, una estadística principal y hasta 3 subestadísticas. El resultado se actualiza al instante.',
  },
  slot: { en: 'Slot', es: 'Pieza' },
  mainStat: { en: 'Main stat', es: 'Estadística principal' },
  pickSubstats: { en: 'Substats', es: 'Subestadísticas' },
  evaluate: { en: 'Evaluate', es: 'Evaluar' },
  evaluatorGood: { en: 'This piece is worth keeping for:', es: 'Merece la pena conservar esta pieza para:' },
  evaluatorNone: {
    en: 'No current user of this set wants this combination. It is fodder unless you need a temporary off-piece.',
    es: 'Ningún personaje actual de este set quiere esta combinación. Es material de reciclaje salvo que necesites una pieza externa temporal.',
  },
  evaluatorEmpty: {
    en: 'Select a main stat to evaluate the piece.',
    es: 'Selecciona una estadística principal para evaluar la pieza.',
  },
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
