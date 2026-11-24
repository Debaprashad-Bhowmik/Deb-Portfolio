import { eclipseMargin, radius } from './planner.mjs'
import { totalityPossible } from './coverage-map.mjs'

export const overlapColors = [[24, 26, 78], [73, 30, 119], [130, 39, 126], [184, 58, 109],
  [224, 92, 83], [248, 141, 62], [255, 198, 89], [252, 250, 186]]
export const missionGridHeight = 91
export const missionQuarters = 4
export const artemisSouthLatitude = -84

export function windowHours(windows, start, end) {
  return windows.reduce((hours, [from, to]) => hours + Math.max(0, Math.min(to, end) - Math.max(from, start)), 0)
}

// Signed horizon clearance varies linearly between adjacent samples.
export function overlapStep(sunBefore, sunAfter, earthBefore, earthAfter, from = 0, to = 1) {
  if ((sunBefore <= 0 && sunAfter <= 0) || (earthBefore <= 0 && earthAfter <= 0)) return 0
  if (sunBefore > 0 && sunAfter > 0 && earthBefore > 0 && earthAfter > 0) return to - from
  const start = Math.max(from, sunBefore > 0 ? 0 : sunBefore / (sunBefore - sunAfter),
    earthBefore > 0 ? 0 : earthBefore / (earthBefore - earthAfter))
  const end = Math.min(to, sunAfter > 0 ? 1 : sunBefore / (sunBefore - sunAfter),
    earthAfter > 0 ? 1 : earthBefore / (earthBefore - earthAfter))
  return Math.max(0, end - start)
}

export function southPoleOverlapGrid(frames, stepHours) {
  return missionOverlapGrid(frames, stepHours, 180, 25, artemisSouthLatitude)
}

export function overviewOverlapGrid(frames, stepHours, southOnly) {
  const fine = (frames.length - 1) * stepHours <= 31 * 24
  if (southOnly) return fine ? missionOverlapGrid(frames, stepHours, 360, 49, artemisSouthLatitude) : southPoleOverlapGrid(frames, stepHours)
  return fine ? missionOverlapGrid(frames, stepHours, 360, 181) : missionOverlapGrid(frames, stepHours)
}

export function missionOverlapGrid(frames, stepHours, width = 180, height = missionGridHeight, northLatitude = 90) {
  const radians = Math.PI / 180
  const longitude = Array.from({ length: width }, (_, col) => ((col + .5) * 360 / width - 180) * radians)
  const directions = longitude.map(angle => [Math.cos(angle), Math.sin(angle)])
  const samples = frames.map(([sun, earth]) => {
    const sunDistance = Math.hypot(...sun)
    const earthDistance = Math.hypot(...earth)
    return { sun, earth, sunDistance, earthDistance, eclipse: totalityPossible(sun, earth) }
  })
  const periods = Array.from({ length: missionQuarters + 1 }, () => ({ values: new Float32Array(width * height), maxHours: 0 }))
  const grid = { width, height, northLatitude, periods }
  if (samples.length < 2) return grid
  const quarterLength = (samples.length - 1) / missionQuarters
  const quarters = periods.slice(1).map((period, index) => {
    const start = index * quarterLength
    const end = (index + 1) * quarterLength
    const first = Math.floor(start)
    const last = Math.ceil(end)
    return { values: period.values, first, last, from: start - first, to: end - (last - 1) }
  })
  for (let row = 0; row < height; row++) {
    const latitude = northLatitude - row * (northLatitude + 90) / (height - 1)
    const lat = latitude * radians
    const cosLat = Math.abs(latitude) === 90 ? 0 : Math.cos(lat)
    const z = Math.sin(lat)
    for (let col = 0; col < width; col++) {
      const x = cosLat * directions[col][0]
      const y = cosLat * directions[col][1]
      const offset = [x * radius, y * radius, z * radius]
      const cell = row * width + col
      let total = 0
      for (const { values, first, last, from, to } of quarters) {
        let quarterTotal = 0
        let previousSun
        let previousEarth
        for (let i = first; i <= last; i++) {
          const { sun, earth, sunDistance, earthDistance, eclipse } = samples[i]
          let sunlight = (x * sun[0] + y * sun[1] + z * sun[2] - radius) / sunDistance
          const earthView = (x * earth[0] + y * earth[1] + z * earth[2] - radius) / earthDistance
          if (eclipse) {
            const margin = eclipseMargin(sun.map((v, i) => v - offset[i]), earth.map((v, i) => v - offset[i]))
            sunlight = Math.min(sunlight, margin * radians)
          }
          if (i > first) {
            quarterTotal += overlapStep(previousSun, sunlight, previousEarth, earthView, i === first + 1 ? from : 0, i === last ? to : 1)
          }
          previousSun = sunlight
          previousEarth = earthView
        }
        values[cell] = quarterTotal * stepHours
        total += quarterTotal
      }
      periods[0].values[cell] = total * stepHours
    }
  }
  for (const period of periods) {
    period.maxHours = period.values.reduce((max, value) => Math.max(max, value), 0)
  }
  return grid
}

export function overlapRgb(hours, maxHours, contrast) {
  const position = maxHours > 0 ? Math.min(1, Math.max(0, hours / maxHours)) : 0
  const [low, high] = contrast ?? [0, 1]
  const start = low > 0 ? .15 : 0
  const end = high < 1 ? .85 : 1
  const fraction = position < low ? position / low * start : position > high ? end + (position - high) / (1 - high) * (1 - end) :
    start + (position - low) / (high - low) * (end - start)
  const scaled = fraction * (overlapColors.length - 1)
  const segment = Math.min(Math.floor(scaled), overlapColors.length - 2)
  const amount = scaled - segment
  return overlapColors[segment].map((start, channel) => Math.round(start + (overlapColors[segment + 1][channel] - start) * amount))
}

export function overlapRamp(maxHours, contrast) {
  const [low, high] = contrast ?? [0, 1]
  const start = low > 0 ? .15 : 0
  const end = high < 1 ? .85 : 1
  const stops = overlapColors.map((color, index) => {
    const fraction = index / (overlapColors.length - 1)
    const position = fraction < start ? fraction / start * low : fraction > end ? high + (fraction - end) / (1 - end) * (1 - high) :
      low + (fraction - start) / (end - start) * (high - low)
    return `rgb(${color.join(',')}) ${position * 100}%`
  })
  // Include the two slope changes so the legend's axis remains linear in hours.
  for (const position of [low, high]) stops.push(`rgb(${overlapRgb(position * maxHours, maxHours, contrast).join(',')}) ${position * 100}%`)
  return `linear-gradient(90deg, ${stops.sort((a, b) => Number.parseFloat(a.split(' ').at(-1)) - Number.parseFloat(b.split(' ').at(-1))).join(', ')})`
}
