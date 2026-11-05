import { fetchKqmGuide, kqmSlugCandidates } from './kqm-parser'

const samples: Array<[string, string, string]> = [
  ['columbina', 'Columbina', 'Aubade of Morningstar and Moon'],
  ['neuvillette', 'Neuvillette', 'Marechaussee Hunter'],
  ['durin', 'Durin', 'Celestial Gift'],
  ['mona', 'Mona', 'Celestial Gift'],
  ['kamisato-ayato', 'Kamisato Ayato', 'Marechaussee Hunter'],
  ['hu-tao', 'Hu Tao', 'Marechaussee Hunter'],
]

async function main() {
  for (const [id, name, set] of samples) {
    console.log(`\n=== ${name} (${id}) candidates=${kqmSlugCandidates(id, name).join(',')}`)
    const guide = await fetchKqmGuide(id, name, [set])
    if (!guide) {
      console.log('  NO GUIDE')
      continue
    }
    console.log('  slug:', guide.slug, 'version:', guide.version, 'recommends:', guide.recommendsSet)
    console.log('  main:', guide.mainStats)
    console.log('  substats:', guide.substats)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
