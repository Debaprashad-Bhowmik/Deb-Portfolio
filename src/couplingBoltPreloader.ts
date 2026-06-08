export const COUPLING_BOLT_VIEWER_VERSION = '2026-06-08-render-check'

const COUPLING_BOLT_ASSETS = [
  `/coupling-bolt/coupling-bolt.html?v=${COUPLING_BOLT_VIEWER_VERSION}`,
  '/coupling-bolt/vendor/three/three.module.js',
  '/coupling-bolt/vendor/three/addons/controls/OrbitControls.js',
  '/coupling-bolt/vendor/three/addons/environments/RoomEnvironment.js',
] as const

const PRELOAD_TIMEOUT_MS = 4500

let preloadPromise: Promise<boolean> | null = null

function fetchWithTimeout(url: string, signal: AbortSignal): Promise<boolean> {
  return fetch(url, {
    cache: 'force-cache',
    credentials: 'same-origin',
    signal,
  }).then((response) => response.ok)
}

export function startCouplingBoltPreload(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), PRELOAD_TIMEOUT_MS)

    try {
      const results = await Promise.allSettled(
        COUPLING_BOLT_ASSETS.map((asset) => fetchWithTimeout(asset, controller.signal))
      )

      return results.some((result) => result.status === 'fulfilled' && result.value)
    } catch (error) {
      console.warn('[couplingBoltPreloader] Coupling bolt preload failed:', error)
      return false
    } finally {
      window.clearTimeout(timeoutId)
    }
  })()

  return preloadPromise
}
