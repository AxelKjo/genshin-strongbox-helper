import { getTargetSets } from './config'
import { fetchArtifactIndex, fetchCharacter, pickSetUsage } from './genshin-builds'

async function main() {
  const targets = getTargetSets()
  console.log('Target sets:', targets.map((set) => set.en))
  const [enIndex, esIndex] = await Promise.all([fetchArtifactIndex('en'), fetchArtifactIndex('es')])
  const esById = new Map(esIndex.map((set) => [set.id, set]))
  for (const target of targets) {
    const en = enIndex.find((set) => set.id === target.id)
    const es = esById.get(target.id)
    if (!en) {
      console.log(`\n[missing] ${target.en}`)
      continue
    }
    console.log(`\n=== ${en.name} / ${es?.name} (${en.id}) ${en.rarity}★`)
    console.log('2P:', en.twoPiece, '| ES:', es?.twoPiece)
    console.log('4P:', en.fourPiece.slice(0, 160), '... | ES:', es?.fourPiece.slice(0, 120), '...')
    console.log(`Users (${en.users.length}):`, en.users.map((user) => `${user.characterName}[${user.buildId}]`).join(', '))
  }

  const sampleSlug = enIndex.find((set) => set.id === targets[0]?.id)?.users[0]?.slug
  if (sampleSlug) {
    console.log(`\n--- Character sample: ${sampleSlug}`)
    const character = await fetchCharacter(sampleSlug, targets)
    console.log(character.name, character.element, character.iconUrl)
    for (const build of character.builds) {
      const usage = pickSetUsage(character, build.id)
      console.log(`\nBuild ${build.id}: ${build.name} (${build.version}) best=${build.isBestRole}`)
      console.log('  main:', build.mainStats)
      console.log('  substats:', build.substats)
      console.log('  target usage:', usage?.usage)
      console.log('  notes:', build.notes.slice(0, 180))
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
