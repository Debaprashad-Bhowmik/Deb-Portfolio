import { evaluate, siteSolarPower } from './planner.mjs'

const artemisSlopeLimit = 10
const longestWindow = windows => windows.reduce((longest, [start, end]) => Math.max(longest, end - start), 0)

export function landingPower(site, frames, duration) {
  const { metrics, timeline, sun, earth } = evaluate(site, frames, duration, true, { includeEnergy: true })
  return {
    averageWatts: metrics.energyKwh * 1000 / duration,
    energyKwh: metrics.energyKwh,
    sunHours: metrics.sun,
    sunFraction: metrics.sun / duration,
    earthHours: metrics.earth,
    earthFraction: metrics.earth / duration,
    longestSunHours: longestWindow(sun),
    longestEarthHours: longestWindow(earth),
    longestEarthGap: metrics.blackout,
    touchdownWatts: siteSolarPower(timeline[0]),
  }
}

const terrainOrder = (a, b) => a.slope - b.slope || a.roughness - b.roughness

export async function evaluateLandingPatches(patches, frames, duration, maxSlope = artemisSlopeLimit, onProgress = () => true) {
  const candidates = patches.filter(patch => patch.slope < maxSlope)
  const results = []
  for (const [index, patch] of candidates.entries()) {
    if (index % 64 === 0) {
      if (!await onProgress(index, candidates.length)) return null
    }
    results.push({ ...patch, ...landingPower(patch, frames, duration) })
  }
  return results
}

export function rankLandingSuggestions(results, { duration, mode = 'balanced', minimumShare = 0, body = 'earth' }) {
  const balanced = mode === 'balanced'
  const minimumHours = mode === 'earth' ? duration : mode === 'solar' ? duration * minimumShare : 0
  const continuity = mode === 'solar' && body === 'sun' ? 'longestSunHours' : 'longestEarthHours'
  const maxEnergy = results.reduce((maximum, row) => Math.max(maximum, row.energyKwh), 0)
  const ranked = results.map(row => {
    const balance = maxEnergy ? Math.sqrt((row.energyKwh / maxEnergy) * (row.longestEarthHours / duration)) : 0
    const hasRequiredWindow = row[continuity] + 1e-8 >= minimumHours
    const qualifies = balanced ? balance > 0 : hasRequiredWindow && (mode !== 'solar' || row.energyKwh > 0)
    return { ...row, balance, qualifies }
  })
  let flattest = null
  for (const row of ranked) {
    if (!flattest || terrainOrder(row, flattest) < 0) flattest = row
  }
  const mostEnergy = (a, b) => b.energyKwh - a.energyKwh || b.longestEarthHours - a.longestEarthHours ||
    a.longestEarthGap - b.longestEarthGap || b.earthHours - a.earthHours || terrainOrder(a, b)
  const matches = ranked.filter(row => row.qualifies)
  if (matches.length) matches.sort((a, b) => (balanced ? b.balance - a.balance : 0) || mostEnergy(a, b))
  else ranked.sort((a, b) => b[continuity] - a[continuity] || a.longestEarthGap - b.longestEarthGap || mostEnergy(a, b))
  return { rows: (matches.length ? matches : ranked).slice(0, 5), flattest,
    evaluated: ranked.length, qualified: matches.length, minimumHours,
    ranks: new Map(matches.map((row, index) => [row.id, index + 1])) }
}

export function rankLandingScenarios(results, preference) {
  const modes = ['earth', 'solar', 'balanced']
  const scenarios = Object.fromEntries(modes.map(mode => [
    mode, rankLandingSuggestions(results, { ...preference, mode }),
  ]))
  const summaries = Object.fromEntries(modes.map(mode => {
    const { rows, qualified } = scenarios[mode]
    const { id, energyKwh, longestEarthHours } = rows[0] ?? {}
    return [mode, { id, qualified, energyKwh, longestEarthHours }]
  }))
  const withScenarioRanks = row => ({
    ...row,
    scenarioRanks: Object.fromEntries(modes.map(mode => [mode, scenarios[mode].ranks.get(row.id) ?? null])),
  })
  const { rows, flattest, evaluated, qualified, minimumHours } = scenarios[preference.mode]
  const winners = Object.fromEntries(modes.map(mode => [mode,
    scenarios[mode].rows[0] ? withScenarioRanks(scenarios[mode].rows[0]) : null,
  ]))
  return { summaries, winners, rows: rows.map(withScenarioRanks), flattest: flattest && withScenarioRanks(flattest),
    evaluated, qualified, minimumHours }
}
