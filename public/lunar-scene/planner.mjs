const radians = Math.PI / 180
export const radius = 1737400
export const sunRadius = 695700000
export const earthRadius = 6378137
export const astronomicalUnit = 149_597_870_700
export const referencePanelEfficiency = .20
export const referencePanelPower = 1361 * referencePanelEfficiency
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const interpolate = (a, b, t) => a + (b - a) * t

export function annualMissionHours(start) {
  const end = new Date(start)
  // UTC date rollover makes a February 29 start end on March 1 the next year.
  end.setUTCFullYear(end.getUTCFullYear() + 1)
  return (end - start) / 3_600_000
}

export function observer(lat, lon, height) {
  const phi = lat * radians
  const lambda = lon * radians
  const up = [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)]
  const east = [-Math.sin(lambda), Math.cos(lambda), 0]
  const north = [-Math.sin(phi) * Math.cos(lambda), -Math.sin(phi) * Math.sin(lambda), Math.cos(phi)]
  return { up, east, north, position: up.map(value => value * (radius + height)) }
}

export function localAngles(position, base) {
  const relative = position.map((value, axis) => value - base.position[axis])
  const east = dot(relative, base.east)
  const north = dot(relative, base.north)
  const up = dot(relative, base.up)
  return [(Math.atan2(east, north) / radians + 360) % 360, Math.atan2(up, Math.hypot(east, north)) / radians, relative]
}

export function horizonAt(profile, azimuth) {
  if (!profile) return 0
  const index = ((azimuth % 360 + 360) % 360) * profile.length / 360
  const left = Math.floor(index)
  return interpolate(profile[left], profile[(left + 1) % profile.length], index - left)
}

export function skyCrossings(timeline, step) {
  function crossings(elevation, horizon) {
    const events = []
    const clearance = sample => sample[elevation] - sample[horizon]
    let before = clearance(timeline[0])
    for (let index = 1; index < timeline.length; index++) {
      const after = clearance(timeline[index])
      if ((before > 0) !== (after > 0)) {
        const at = (index - 1 + before / (before - after)) * step
        if (events.at(-1)?.at === at) events.pop()
        else events.push({ at, rising: after > 0 })
      }
      before = after
    }
    return events
  }
  return { sun: crossings('sunEl', 'sunHorizon'), earth: crossings('earthEl', 'earthHorizon') }
}

export function nextSkyCrossing(events, elapsedHours) {
  return events.find(event => event.at > elapsedHours)
}

export function missionCrossings(crossings, duration, step = .25) {
  const events = []
  for (const [body, label] of [['sun', 'Sun'], ['earth', 'Earth']]) {
    for (const { at, rising } of crossings[body]) {
      if (at > duration) break
      events.push({ body, label: label + (rising ? 'rise' : 'set'), at, sample: Math.min(duration, Math.round(at / step) * step) })
    }
  }
  return events.sort((a, b) => a.at - b.at)
}

export function visibility(values, step) {
  const windows = []
  let start = values[0] > 0 ? 0 : null
  for (let index = 1; index < values.length; index++) {
    const before = values[index - 1]
    const after = values[index]
    if ((before > 0) === (after > 0)) continue
    const crossing = (index - 1 + before / (before - after)) * step
    if (after > 0) start = crossing
    else {
      if (crossing > start) windows.push([start, crossing])
      start = null
    }
  }
  if (start !== null && start < (values.length - 1) * step) windows.push([start, (values.length - 1) * step])
  return windows
}

export function longestGap(windows, duration) {
  let longest = null
  let cursor = 0
  for (const [start, end] of [...windows, [duration, duration]]) {
    const gap = start - cursor
    if (gap > (longest ? longest[1] - longest[0] : 0)) longest = [cursor, start]
    cursor = end
  }
  return longest
}

export function summarize(sun, earth, duration) {
  const both = []
  let left = 0
  let right = 0
  while (left < sun.length && right < earth.length) {
    const a = sun[left]
    const b = earth[right]
    const start = Math.max(a[0], b[0])
    const end = Math.min(a[1], b[1])
    if (start < end) both.push([start, end])
    if (a[1] <= b[1]) left++
    else right++
  }
  const total = windows => windows.reduce((hours, [start, end]) => hours + end - start, 0)
  const darkGap = longestGap(sun, duration)
  const earthGap = longestGap(earth, duration)
  return { sun: total(sun), earth: total(earth), overlap: total(both),
    darkness: darkGap ? darkGap[1] - darkGap[0] : 0, blackout: earthGap ? earthGap[1] - earthGap[0] : 0, both }
}

export function rank(rows, weights, limits, duration) {
  const totalWeight = weights.sun + weights.earth + weights.overlap
  const ranked = rows.map(row => {
    const { metrics } = row
    const unmet = []
    if (metrics.sun + 1e-8 < limits.sun) unmet.push('Sunlight')
    if (metrics.earth + 1e-8 < limits.earth) unmet.push('Earth visibility')
    if (metrics.overlap + 1e-8 < limits.overlap) unmet.push('Overlap')
    if (metrics.darkness - 1e-8 > limits.darkness) unmet.push('Dark gap')
    if (metrics.blackout - 1e-8 > (limits.blackout ?? Infinity)) unmet.push('Earth visibility gap')
    const score = Math.round(1000 * (weights.sun * metrics.sun + weights.earth * metrics.earth + weights.overlap * metrics.overlap) / (totalWeight * duration)) / 10
    return { ...row, unmet, score }
  })
  ranked.sort((a, b) => a.unmet.length - b.unmet.length || b.score - a.score || a.site.name.localeCompare(b.site.name))
  return ranked.map((row, index) => ({
    ...row,
    place: row.unmet.length ? null : 1 + ranked.findIndex(candidate => candidate.score === row.score),
    tied: !row.unmet.length && ranked.some((other, id) => id !== index && !other.unmet.length && other.score === row.score),
  }))
}

export function flatPanelFactor(elevation) {
  return Math.max(0, Math.sin(elevation * radians))
}

export function panelPowerFacingSun(distance) {
  return referencePanelPower * (astronomicalUnit / distance) ** 2
}

export function siteSolarPower({ sunEl, sunHorizon, eclipse, sunDistance }) {
  if (eclipse || sunEl <= sunHorizon) return 0
  return flatPanelFactor(sunEl) * panelPowerFacingSun(sunDistance)
}

// Integrate the direct-beam projection between sampled elevations, clipped to actual sunlight windows.
export function solarExposure(timeline, windows, duration) {
  const step = duration / (timeline.length - 1)
  let beamHours = 0
  let wattHours = 0
  let peak = null
  for (const [start, end] of windows) {
    for (let i = Math.floor(start / step); i < timeline.length - 1 && i * step < end; i++) {
      const segmentStart = i * step
      const from = Math.max(start, segmentStart)
      const to = Math.min(end, segmentStart + step)
      if (to <= from) continue
      const first = timeline[i].sunEl
      const next = timeline[i + 1].sunEl
      const a = interpolate(first, next, (from - segmentStart) / step)
      const b = interpolate(first, next, (to - segmentStart) / step)
      peak = Math.max(peak ?? -90, a, b)
      const high = Math.max(a, b) * radians
      if (high <= 0) continue
      const low = Math.min(a, b) * radians
      const litLow = Math.max(0, low)
      const delta = high - low
      const projected = delta < 1e-10 ? flatPanelFactor((a + b) / 2) :
        2 * Math.sin((litLow + high) / 2) * Math.sin((high - litLow) / 2) / delta
      const exposure = (to - from) * projected
      beamHours += exposure
      const distance = interpolate(timeline[i].sunDistance ?? astronomicalUnit, timeline[i + 1].sunDistance ?? astronomicalUnit,
        ((from + to) / 2 - segmentStart) / step)
      wattHours += exposure * panelPowerFacingSun(distance)
    }
  }
  return { beamHours, peak, energyKwh: wattHours / 1000 }
}

export function eclipseMargin(sun, earth) {
  const sunDistance = Math.hypot(...sun)
  const earthDistance = Math.hypot(...earth)
  const separation = Math.acos(Math.min(1, Math.max(-1, dot(sun, earth) / (sunDistance * earthDistance))))
  return (separation + Math.asin(sunRadius / sunDistance) - Math.asin(earthRadius / earthDistance)) / radians
}

export function siteSkyModel(site, useTerrain) {
  const base = observer(site.lat, site.lon, useTerrain ? site.height + 2 : 0)
  const profile = useTerrain ? site.horizon : null
  return ([sunPosition, earthPosition]) => {
    const [sunAz, sunEl, sunVector] = localAngles(sunPosition, base)
    const [earthAz, earthEl, earthVector] = localAngles(earthPosition, base)
    const sunHorizon = horizonAt(profile, sunAz)
    const earthHorizon = horizonAt(profile, earthAz)
    const eclipse = eclipseMargin(sunVector, earthVector)
    const sunDistance = Math.hypot(...sunVector)
    return { sunAz, sunEl, earthAz, earthEl, sunHorizon, earthHorizon, eclipse: eclipse <= 0, eclipseMargin: eclipse, sunDistance,
      sunRadius: Math.asin(sunRadius / sunDistance), earthRadius: Math.asin(earthRadius / Math.hypot(...earthVector)) }
  }
}

export function evaluate(site, frames, hours, useTerrain, { includeTimeline = true, includeEnergy = false } = {}) {
  const timeline = includeTimeline || includeEnergy ? new Array(frames.length) : null
  const sunClearance = new Float64Array(frames.length)
  const earthClearance = new Float64Array(frames.length)
  const sampleSky = siteSkyModel(site, useTerrain)
  for (let i = 0; i < frames.length; i++) {
    const sample = sampleSky(frames[i])
    sunClearance[i] = Math.min(sample.sunEl - sample.sunHorizon, sample.eclipseMargin)
    earthClearance[i] = sample.earthEl - sample.earthHorizon
    if (timeline) timeline[i] = sample
  }
  const step = hours / (frames.length - 1)
  const sun = visibility(sunClearance, step)
  const earth = visibility(earthClearance, step)
  const metrics = summarize(sun, earth, hours)
  if (includeEnergy) metrics.energyKwh = solarExposure(timeline, sun, hours).energyKwh
  return { site, timeline: includeTimeline ? timeline : null, sun, earth, metrics }
}

export function binaryFrames(buffer) {
  const values = new Int32Array(buffer)
  if (values.length % 6) throw new Error('Ephemeris data are incomplete.')
  for (let index = 6; index < values.length; index++) values[index] += values[index - 6]
  return values
}

export function frameAt(values, position) {
  const last = values.length / 6 - 1
  if (position < -1e-6 || position > last + 1e-6) throw new Error('Choose a time within the ephemeris coverage.')
  const left = Math.max(0, Math.min(last, Math.floor(position)))
  const right = Math.min(last, left + 1)
  const fraction = Math.max(0, Math.min(1, position - left))
  const coordinate = axis => 100 * interpolate(values[left * 6 + axis], values[right * 6 + axis], fraction)
  return [[coordinate(0), coordinate(1), coordinate(2)], [coordinate(3), coordinate(4), coordinate(5)]]
}
