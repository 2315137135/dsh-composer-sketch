import { readFile } from 'node:fs/promises'
import { dirname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Fonts the whiteboard chunk loads at runtime; the package-asset route serves images only. */
const ASSET_ROUTE = '/composer-sketch/'
const ASSET_DIR = join(dirname(fileURLToPath(import.meta.url)), 'assets')
const MEDIA_TYPES = new Map([
  ['.woff2', 'font/woff2'],
  ['.woff', 'font/woff'],
  ['.ttf', 'font/ttf'],
  ['.otf', 'font/otf'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
])

function mediaTypeOf(file) {
  const dot = file.lastIndexOf('.')
  return dot <= 0 ? undefined : MEDIA_TYPES.get(file.slice(dot).toLowerCase())
}

async function serveAsset(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } })
  }
  const pathname = new URL(request.url, 'http://localhost').pathname
  const target = normalize(join(ASSET_DIR, decodeURIComponent(pathname.slice(ASSET_ROUTE.length))))
  if (!target.startsWith(ASSET_DIR + sep)) return new Response(null, { status: 404 })
  const type = mediaTypeOf(target)
  if (type === undefined) return new Response(null, { status: 404 })
  let body
  try {
    body = await readFile(target)
  } catch {
    return new Response(null, { status: 404 })
  }
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: { 'content-type': type, 'cache-control': 'private, max-age=86400' },
  })
}

export function apply(ctx) {
  ctx.inject(['webServer'], (scope) => {
    scope.effect(
      () => scope.webServer.register({ kind: 'prefix', path: ASSET_ROUTE, resource: serveAsset }),
      'composer-sketch: asset route',
    )
  })
}
