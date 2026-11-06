import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { CACHE_ROOT, NETWORK_DELAY_MS, REQUEST_HEADERS, REQUEST_TIMEOUT_MS } from './config'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function cachePathFor(url: string, namespace: string, extension = 'html'): string {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 12)
  const slug = url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 140)
  return path.join(CACHE_ROOT, namespace, `${slug}-${hash}.${extension}`)
}

export interface FetchOptions {
  namespace: string
  cache?: boolean
  retries?: number
}

export interface CachedResponse {
  url: string
  status: number
  html: string
  fromCache: boolean
}

export async function fetchCached(url: string, options: FetchOptions): Promise<CachedResponse> {
  const { namespace, cache = true, retries = 3 } = options
  const file = cachePathFor(url, namespace)
  const file404 = `${file}.404`

  if (cache) {
    try {
      // Check if previously cached as 404
      const is404 = await readFile(file404, 'utf8').then(() => true).catch(() => false)
      if (is404) {
        return { url, status: 404, html: '', fromCache: true }
      }
      const html = await readFile(file, 'utf8')
      if (html.length > 0) return { url, status: 200, html, fromCache: true }
    } catch {
      // cache miss
    }
  }

  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      // Polite delay on actual network requests to prevent server strain
      await sleep(NETWORK_DELAY_MS + Math.floor(Math.random() * 150))

      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after')
        const waitSec = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) || 5 : 5
        console.warn(`[http] Rate limited (429) on ${url}. Respecting Retry-After: ${waitSec}s`)
        await sleep(waitSec * 1000)
        continue
      }

      const html = await response.text()
      if (response.ok) {
        await mkdir(path.dirname(file), { recursive: true })
        await writeFile(file, html, 'utf8')
        return { url, status: response.status, html, fromCache: false }
      }
      if (response.status === 404) {
        // Cache 404 to avoid repeatedly hammering community servers with invalid slugs
        await mkdir(path.dirname(file404), { recursive: true })
        await writeFile(file404, '404', 'utf8')
        return { url, status: 404, html, fromCache: false }
      }
      lastError = new Error(`HTTP ${response.status} for ${url}`)
    } catch (error) {
      lastError = error
    }
    await sleep(600 * attempt)
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export interface CachedBinaryResponse {
  url: string
  status: number
  data: Buffer
  fromCache: boolean
}

export async function fetchCachedBinary(
  url: string,
  options: FetchOptions & { extension?: string },
): Promise<CachedBinaryResponse> {
  const { namespace, cache = true, retries = 3, extension = 'bin' } = options
  const file = cachePathFor(url, namespace, extension)
  const file404 = `${file}.404`

  if (cache) {
    try {
      const is404 = await readFile(file404, 'utf8').then(() => true).catch(() => false)
      if (is404) {
        return { url, status: 404, data: Buffer.alloc(0), fromCache: true }
      }
      const data = await readFile(file)
      if (data.length > 0) return { url, status: 200, data, fromCache: true }
    } catch {
      // cache miss
    }
  }

  let lastError: unknown
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await sleep(NETWORK_DELAY_MS + Math.floor(Math.random() * 150))

      const response = await fetch(url, {
        headers: REQUEST_HEADERS,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })

      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after')
        const waitSec = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) || 5 : 5
        console.warn(`[http] Rate limited (429) on ${url}. Respecting Retry-After: ${waitSec}s`)
        await sleep(waitSec * 1000)
        continue
      }

      if (response.ok) {
        const data = Buffer.from(await response.arrayBuffer())
        await mkdir(path.dirname(file), { recursive: true })
        await writeFile(file, data)
        return { url, status: response.status, data, fromCache: false }
      }
      if (response.status === 404) {
        await mkdir(path.dirname(file404), { recursive: true })
        await writeFile(file404, '404', 'utf8')
        return { url, status: 404, data: Buffer.alloc(0), fromCache: false }
      }
      lastError = new Error(`HTTP ${response.status} for ${url}`)
    } catch (error) {
      lastError = error
    }
    await sleep(600 * attempt)
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0
  async function run() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await worker(items[current], current)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}
