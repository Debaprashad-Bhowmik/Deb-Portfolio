import { evaluate, frameAt } from './planner.mjs'
import { evaluateLandingPatches, landingPower, rankLandingScenarios } from './landing-suggestions.mjs?v=1.3.0'

let patchesPromise
let currentRequest
let preference
let evaluatedMission

function postRanking() {
  const { rows, frames, duration, step, sampled, catalog } = evaluatedMission
  const result = rankLandingScenarios(rows, { duration, ...preference })
  // Only send timelines for the handful of displayed patches, not the entire
  // polar inventory. Use exactly the same terrain and sampling as the ranking.
  const windows = new Map()
  for (const site of [...result.rows, result.flattest, ...Object.values(result.winners)].filter(Boolean)) {
    if (!windows.has(site.id)) {
      const { sun, earth } = evaluate(site, frames, duration, true)
      windows.set(site.id, { sunWindows: sun, earthWindows: earth })
    }
    Object.assign(site, windows.get(site.id))
  }
  self.postMessage({ request: currentRequest, result, preference, step, sampled, catalog })
}

function loadPatches() {
  patchesPromise ??= (async () => {
    // Serve the gzip payload as binary so the browser does not decode it before this worker.
    const response = await fetch(new URL('./data/landing-patches.bin', import.meta.url))
    if (!response.ok) throw new Error('Could not load the South Pole terrain inventory.')
    const decoded = new Response(response.body.pipeThrough(new DecompressionStream('gzip')))
    const rows = await decoded.json()
    return rows.map(([lat, lon, slope, roughness, height, angles], index) => ({
      id: `landing-patch-${index}`, lat, lon, slope, roughness, height, horizon: angles.map(angle => angle / 100),
    }))
  })().catch(error => {
    patchesPromise = undefined
    throw error
  })
  return patchesPromise
}

self.addEventListener('message', async ({ data }) => {
  const { request, ephemeris, first, frameHours, duration, maxSlope, catalog } = data
  if (data.rankOnly) {
    if (request !== currentRequest) return
    preference = data.preference
    if (evaluatedMission) postRanking()
    return
  }
  currentRequest = request
  preference = data.preference
  evaluatedMission = undefined
  if (!ephemeris) return

  try {
    const patches = await loadPatches()
    if (currentRequest !== request) return
    const intervals = Math.ceil(duration / (duration <= 720 ? .25 : 2))
    const step = duration / intervals
    const frames = Array.from({ length: intervals + 1 }, (_, index) => frameAt(ephemeris, first + index * step / frameHours))
    const rows = await evaluateLandingPatches(patches, frames, duration, maxSlope, async (done, total) => {
      self.postMessage({ request, done, total })
      await new Promise(resolve => setTimeout(resolve, 0))
      return currentRequest === request
    })
    if (rows && currentRequest === request) {
      const catalogMetrics = (catalog ?? []).map(({ id, displayName, kind, lat, lon, height, horizon }) => ({
        id, displayName, kind, lat, lon,
        ...landingPower({ lat, lon, height, horizon }, frames, duration, { includeWindows: true }),
      }))
      evaluatedMission = { rows, frames, duration, step, sampled: patches.length, catalog: catalogMetrics }
      postRanking()
    }
  } catch (error) {
    if (currentRequest === request) self.postMessage({ request, error: error.message })
  }
})
