import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  AMBER_CATALOG_URL,
  ARTIFACT_IMAGE_DIR,
  ENKA_ASSET_BASE,
  artifactImageUrl,
  getTargetSets,
  type TargetSetConfig,
} from './config'
import { fetchCached, fetchCachedBinary } from './http'

interface ReliquaryItem {
  id: number
  name: string
  icon: string
}

interface ReliquaryPayload {
  response: number
  data?: {
    items?: Record<string, ReliquaryItem>
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function readPngSize(data: Buffer): { width: number; height: number } {
  if (data.length < 24 || !data.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error('downloaded file is not a valid PNG')
  }
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
}

async function loadCatalog(): Promise<ReliquaryItem[]> {
  const { html, fromCache } = await fetchCached(AMBER_CATALOG_URL, { namespace: 'amber/en' })
  const payload = JSON.parse(html) as ReliquaryPayload
  const items = Object.values(payload.data?.items ?? {})
  if (items.length === 0) throw new Error('Project Amber reliquary catalog is empty')
  console.log(`[artifact-images] catalog: ${items.length} sets (${fromCache ? 'cache' : 'network'})`)
  return items
}

function findCatalogEntry(catalog: ReliquaryItem[], target: TargetSetConfig): ReliquaryItem {
  const names = [target.en, target.es, ...target.aliases].map(normalizeName)
  const entry = catalog.find((item) => names.includes(normalizeName(item.name)))
  if (!entry) throw new Error(`No Project Amber asset found for ${target.en}`)
  return entry
}

async function readExistingImage(file: string): Promise<{ width: number; height: number } | null> {
  try {
    return readPngSize(await readFile(file))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    console.warn(`[artifact-images] replacing invalid local file: ${file}`)
    return null
  }
}

async function downloadImage(target: TargetSetConfig, catalog: ReliquaryItem[], force: boolean): Promise<void> {
  const destination = path.join(ARTIFACT_IMAGE_DIR, `${target.id}.png`)
  if (!force) {
    const existing = await readExistingImage(destination)
    if (existing) {
      console.log(`  [skip] ${target.en}: ${existing.width}x${existing.height} (${artifactImageUrl(target.id)})`)
      return
    }
  }

  const entry = findCatalogEntry(catalog, target)
  const sourceUrl = `${ENKA_ASSET_BASE}/${entry.icon}.png`
  const { data, fromCache } = await fetchCachedBinary(sourceUrl, {
    namespace: 'enka/ui',
    extension: 'png',
    cache: !force,
  })
  const size = readPngSize(data)
  if (size.width !== size.height || (size.width !== 256 && size.width !== 512)) {
    throw new Error(`Unexpected image size for ${target.en}: ${size.width}x${size.height}`)
  }

  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, data)
  console.log(`  [save] ${target.en}: ${size.width}x${size.height} <- ${sourceUrl} (${fromCache ? 'cache' : 'network'})`)
}

async function main() {
  const force = process.argv.includes('--force')
  const targets = getTargetSets()
  if (targets.length === 0) throw new Error('No target sets matched the provided filter.')

  const catalog = await loadCatalog()
  for (const target of targets) {
    await downloadImage(target, catalog, force)
  }
  console.log(`[artifact-images] ready: ${targets.length} sets in ${ARTIFACT_IMAGE_DIR}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
