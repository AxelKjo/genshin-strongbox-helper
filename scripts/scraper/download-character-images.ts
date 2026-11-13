import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { TriageDataset } from '../../src/types/artifacts'
import {
  AMBER_AVATAR_CATALOG_URL,
  ARTIFACT_INDEX_CACHE_TTL_MS,
  CHARACTER_IMAGE_DIR,
  DATA_OUTPUT,
  ENKA_ASSET_BASE,
  characterImageUrl,
  getTargetSets,
} from './config'
import { fetchArtifactIndex, type GBArtifactSet } from './genshin-builds'
import { fetchCached, fetchCachedBinary } from './http'

interface AvatarItem {
  id: number
  name: string
  icon: string
  route?: string
}

interface AvatarPayload {
  response: number
  data?: {
    items?: Record<string, AvatarItem>
  }
}

export interface CharacterTarget {
  id: string
  name: string
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function readPngSize(data: Buffer): { width: number; height: number } {
  if (data.length < 24 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('downloaded file is not a valid PNG')
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

async function loadCatalog(): Promise<AvatarItem[]> {
  const { html, fromCache } = await fetchCached(AMBER_AVATAR_CATALOG_URL, {
    namespace: 'amber/en',
    maxAgeMs: ARTIFACT_INDEX_CACHE_TTL_MS,
  })
  const payload = JSON.parse(html) as AvatarPayload
  const items = Object.values(payload.data?.items ?? {})
  if (items.length === 0) throw new Error('Project Amber avatar catalog is empty')
  console.log(`[character-images] catalog: ${items.length} characters (${fromCache ? 'cache' : 'network'})`)
  return items
}

function findAvatarEntry(catalog: AvatarItem[], target: CharacterTarget): AvatarItem | null {
  const targetKey = normalizeKey(target.name)
  const targetIdKey = normalizeKey(target.id)

  // 1. Traveler special case
  if (targetKey.includes('traveler') || targetIdKey.includes('traveler')) {
    const traveler = catalog.find((item) => normalizeKey(item.name) === 'traveler')
    if (traveler) return traveler
  }

  // 2. Exact match by name or route
  const exact = catalog.find(
    (item) => normalizeKey(item.name) === targetKey || (item.route && normalizeKey(item.route) === targetKey),
  )
  if (exact) return exact

  // 3. Substring match
  const substring = catalog.find((item) => {
    const itemKey = normalizeKey(item.name)
    return itemKey.includes(targetKey) || targetKey.includes(itemKey)
  })
  if (substring) return substring

  return null
}

async function readExistingImage(file: string): Promise<{ width: number; height: number } | null> {
  try {
    return readPngSize(await readFile(file))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    console.warn(`[character-images] replacing invalid local file: ${file}`)
    return null
  }
}

async function downloadCharacterImage(
  target: CharacterTarget,
  catalog: AvatarItem[],
  force: boolean,
): Promise<void> {
  const destination = path.join(CHARACTER_IMAGE_DIR, `${target.id}.png`)
  if (!force) {
    const existing = await readExistingImage(destination)
    if (existing) {
      console.log(`  [skip] ${target.name}: ${existing.width}x${existing.height} (${characterImageUrl(target.id)})`)
      return
    }
  }

  const entry = findAvatarEntry(catalog, target)
  if (!entry) {
    console.warn(`  [missing-asset] No Amber avatar entry found for ${target.name} (${target.id})`)
    return
  }

  const sourceUrl = `${ENKA_ASSET_BASE}/${entry.icon}.png`
  const { data, fromCache, status } = await fetchCachedBinary(sourceUrl, {
    namespace: 'enka/ui',
    extension: 'png',
    cache: !force,
  })

  if (status !== 200 || data.length === 0) {
    console.warn(`  [fetch-failed] Status ${status} for ${target.name} (${sourceUrl})`)
    return
  }

  const size = readPngSize(data)
  if (size.width !== size.height || (size.width !== 256 && size.width !== 512)) {
    throw new Error(`Unexpected image size for ${target.name}: ${size.width}x${size.height}`)
  }

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, data)
  console.log(`  [save] ${target.name}: ${size.width}x${size.height} <- ${sourceUrl} (${fromCache ? 'cache' : 'network'})`)
}

async function getTargetCharacters(): Promise<CharacterTarget[]> {
  // First attempt: read from public/data/artifacts-triage.json if available
  try {
    const json = await readFile(DATA_OUTPUT, 'utf8')
    const dataset = JSON.parse(json) as TriageDataset
    const characterMap = new Map<string, CharacterTarget>()
    for (const set of dataset.sets) {
      for (const char of set.characters) {
        if (!characterMap.has(char.characterId)) {
          characterMap.set(char.characterId, {
            id: char.characterId,
            name: char.name.en,
          })
        }
      }
    }
    if (characterMap.size > 0) {
      return [...characterMap.values()]
    }
  } catch {
    // dataset not generated yet, fallback to scraping index
  }

  const targetSets = getTargetSets()
  const enIndex = await fetchArtifactIndex('en')
  const targetIds = new Set(targetSets.map((s) => s.id))
  const relevantSets = enIndex.filter((s: GBArtifactSet) => targetIds.has(s.id))
  const characterMap = new Map<string, CharacterTarget>()

  for (const set of relevantSets) {
    for (const user of set.users) {
      if (!characterMap.has(user.slug)) {
        characterMap.set(user.slug, {
          id: user.slug,
          name: user.characterName,
        })
      }
    }
  }

  return [...characterMap.values()]
}

async function main() {
  const force = process.argv.includes('--force')
  const targets = await getTargetCharacters()
  if (targets.length === 0) {
    console.warn('[character-images] No characters found to download.')
    return
  }

  console.log(`[character-images] characters to process (${targets.length}): ${targets.map((c) => c.name).join(', ')}`)
  const catalog = await loadCatalog()
  for (const target of targets) {
    await downloadCharacterImage(target, catalog, force)
  }
  console.log(`[character-images] ready: processed ${targets.length} characters in ${CHARACTER_IMAGE_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
