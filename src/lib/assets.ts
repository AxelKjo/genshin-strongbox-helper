/**
 * Resolves an asset path against Vite's base URL (import.meta.env.BASE_URL).
 * Ensures root-relative paths like `/images/...` or `/icons/...` work seamlessly
 * both in local development (`/`) and under subdirectories (e.g. GitHub Pages `/<repo-name>/`).
 */
export function resolveAssetUrl(path: string): string {
  if (!path) return ''
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  if (base !== '/' && path.startsWith(base)) {
    return path
  }

  if (path.startsWith('/') && !path.startsWith('//')) {
    return `${base}${path.slice(1)}`
  }

  return path
}
