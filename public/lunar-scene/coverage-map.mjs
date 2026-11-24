import { eclipseMargin, panelPowerFacingSun, radius } from './planner.mjs'

const radians = Math.PI / 180
const wrapLongitude = lon => ((lon + 180) % 360 + 360) % 360 - 180
const clamp = (value, low, high) => Math.max(low, Math.min(high, value))

export function coverageProject({ lat, lon }, northLatitude = 90) {
  return { x: (wrapLongitude(lon) + 180) / 360, y: (northLatitude - lat) / (northLatitude + 90) }
}

export function coverageUnproject(x, y, northLatitude = 90) {
  return { lat: northLatitude - clamp(y, 0, 1) * (northLatitude + 90), lon: wrapLongitude(clamp(x, 0, 1) * 360 - 180) }
}

export function subPoint([x, y, z]) {
  return { lat: Math.atan2(z, Math.hypot(x, y)) / radians, lon: wrapLongitude(Math.atan2(y, x) / radians) }
}

export const coveragePalette = [[60, 63, 74], [224, 174, 97], [125, 160, 231], [112, 210, 184]]
export const visibilityLayers = { sun: 1, earth: 2, both: 4 }

export function visibilityRequirements(visibility) {
  return visibility & visibilityLayers.both ? 3 : visibility & 3
}

export function coverageColorIndex(point, visibility) {
  const required = visibilityRequirements(visibility)
  return (point & required) === required ? required : 0
}

export function coverageMatches(point, visibility, overlapHours, watts) {
  return (!visibility || coverageColorIndex(point, visibility) !== 0) &&
    (overlapHours === undefined || overlapHours > 0) &&
    (watts === undefined || watts > 0)
}
export const solarPowerScaleMax = 300
export const solarPowerPalette = [[28, 40, 74], [50, 137, 151], [250, 232, 155]]
export function solarPowerColor(watts, maxPower = solarPowerScaleMax) {
  const scaled = maxPower > 0 ? Math.sqrt(clamp(watts / maxPower, 0, 1)) * 2 : 0
  const segment = scaled < 1 ? 0 : 1
  const low = solarPowerPalette[segment]
  const high = solarPowerPalette[segment + 1]
  return low.map((value, channel) => Math.round(value + (high[channel] - value) * (scaled - segment)))
}
// The observer offset across the surface cannot produce totality outside this margin.
export const totalityPossible = (sun, earth) => eclipseMargin(sun, earth) <= .4

export function createCoverageModel(sun, earth) {
  const possibleEclipse = totalityPossible(sun, earth)
  return (x, y, z) => {
    const earthUp = x * earth[0] + y * earth[1] + z * earth[2] > radius
    let sunUp = x * sun[0] + y * sun[1] + z * sun[2] > radius
    if (sunUp && earthUp && possibleEclipse) {
      const offset = [x * radius, y * radius, z * radius]
      sunUp = eclipseMargin(sun.map((v, i) => v - offset[i]), earth.map((v, i) => v - offset[i])) > 0
    }
    return Number(sunUp) + 2 * Number(earthUp)
  }
}

export function createSolarPowerModel(sun, earth) {
  const [sx, sy, sz] = sun
  const sunDistanceSquared = sx * sx + sy * sy + sz * sz
  const visibility = totalityPossible(sun, earth) ? createCoverageModel(sun, earth) : null
  return (x, y, z) => {
    const projection = x * sx + y * sy + z * sz
    if (projection <= radius || (visibility && !(visibility(x, y, z) & 1))) return 0
    const distance = Math.sqrt(sunDistanceSquared - 2 * radius * projection + radius * radius)
    // The dot product of the vertical with the unit Sun direction is sin(elevation).
    return (projection - radius) / distance * panelPowerFacingSun(distance)
  }
}

export function southPolePowerMax(sun, earth, northLatitude) {
  const model = createSolarPowerModel(sun, earth)
  const { lat, lon } = subPoint(sun)
  const polarPower = (latitude, longitude) => {
    const phi = latitude * radians
    const lambda = longitude * radians
    return model(Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi))
  }
  // The closest point to the subsolar latitude maximizes power on an uneclipsed cap.
  let max = polarPower(Math.min(lat, northLatitude), lon)
  if (!totalityPossible(sun, earth)) return max
  // During a possible eclipse, the peak can shift away from the subsolar meridian.
  for (let latitude = northLatitude; latitude >= -90; latitude -= .25) {
    for (let longitude = lon; longitude < lon + 360; longitude += 2) {
      max = Math.max(max, polarPower(latitude, longitude))
    }
  }
  return max
}

const inks = ['#777986', '#ffc975', '#acc4ff', '#83dccb']
const rasterWidth = 480
const rasterHeight = 240

export function createCoverageMap(canvas, onPoint) {
  const ctx = canvas.getContext('2d')
  const raster = document.createElement('canvas')
  raster.width = rasterWidth
  raster.height = rasterHeight
  const rasterCtx = raster.getContext('2d', { willReadFrequently: true })
  const pixels = rasterCtx.createImageData(rasterWidth, rasterHeight)
  let basemap
  let basemapDirty = true
  let frame
  let site
  let visibility = 0
  let power = false
  let overlap
  let overlapSamples
  let colorByPower = false
  let northLatitude = 90
  let powerMax = solarPowerScaleMax
  let dirty = true
  let latitudes, cosLat, sinLat
  const longitudes = Array.from({ length: rasterWidth }, (_, col) => (col + .5) * 360 / rasterWidth - 180)
  const cosLon = longitudes.map(lon => Math.cos(lon * radians))
  const sinLon = longitudes.map(lon => Math.sin(lon * radians))

  const texture = new Image()
  texture.addEventListener('load', () => {
    basemapDirty = true
    dirty = true
    draw()
  })
  texture.src = new URL('./assets/moon-color.jpg', import.meta.url).href

  function drawTerrain(context, width, height) {
    const northY = (90 - northLatitude) / 180 * texture.height
    context.drawImage(texture, 0, northY, texture.width, texture.height - northY, 0, 0, width, height)
  }

  function tint() {
    if (basemapDirty) {
      latitudes = Array.from({ length: rasterHeight }, (_, row) => northLatitude - (row + .5) * (northLatitude + 90) / rasterHeight)
      cosLat = latitudes.map(lat => Math.cos(lat * radians))
      sinLat = latitudes.map(lat => Math.sin(lat * radians))
      if (texture.naturalWidth) {
        drawTerrain(rasterCtx, rasterWidth, rasterHeight)
        basemap = rasterCtx.getImageData(0, 0, rasterWidth, rasterHeight).data
      }
      basemapDirty = false
    }
    if (overlap && !overlapSamples) {
      const hours = new Float32Array(rasterWidth * rasterHeight)
      const colors = new Uint8Array(hours.length * 3)
      for (let row = 0; row < rasterHeight; row++) {
        for (let col = 0; col < rasterWidth; col++) {
          const index = row * rasterWidth + col
          hours[index] = overlap.hoursAt(latitudes[row], longitudes[col]) ?? -1
          if (hours[index] >= 0) colors.set(overlap.color(hours[index]), index * 3)
        }
      }
      overlapSamples = { hours, colors }
    }
    const visibilityAt = visibility ? createCoverageModel(...frame) : null
    const powerAt = power ? createSolarPowerModel(...frame) : null
    const filtered = Boolean(overlap && (visibility || power) || visibility && power)
    const visibilityInk = coveragePalette[visibilityRequirements(visibility)]
    for (let row = 0; row < rasterHeight; row++) {
      for (let col = 0; col < rasterWidth; col++) {
        const x = cosLat[row] * cosLon[col]
        const y = cosLat[row] * sinLon[col]
        const z = sinLat[row]
        const point = visibilityAt?.(x, y, z) ?? 0
        const watts = powerAt?.(x, y, z)
        const index = row * rasterWidth + col
        const offset = 4 * index
        const hours = overlapSamples?.hours[index]
        if (hours < 0 || !coverageMatches(point, visibility, filtered ? hours : undefined, filtered ? watts : undefined)) {
          pixels.data[offset + 3] = 0
          continue
        }
        const shade = basemap ? .56 + basemap[offset] / 360 : .83
        pixels.data[offset + 3] = 255
        if (colorByPower) {
          const fraction = powerMax > 0 ? clamp(watts / powerMax, 0, 1) : 0
          const scaled = Math.sqrt(fraction) * 2
          const segment = scaled < 1 ? 0 : 1
          const low = solarPowerPalette[segment]
          const high = solarPowerPalette[segment + 1]
          for (let channel = 0; channel < 3; channel++) {
            pixels.data[offset + channel] = (low[channel] + (high[channel] - low[channel]) * (scaled - segment)) * shade
          }
        } else if (overlap) {
          for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = overlapSamples.colors[3 * index + channel]
          pixels.data[offset + 3] = 212
        } else {
          for (let channel = 0; channel < 3; channel++) pixels.data[offset + channel] = visibilityInk[channel] * shade
        }
      }
    }
    rasterCtx.putImageData(pixels, 0, 0)
    dirty = false
  }

  function draw() {
    const { clientWidth: width, clientHeight: height } = canvas
    if (!width || !height || !site) return
    const live = frame && (visibility || power)
    if ((live || overlap) && dirty) tint()
    const pixel = Math.min(2, devicePixelRatio || 1)
    const pw = Math.round(width * pixel)
    const ph = Math.round(height * pixel)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
    }
    ctx.setTransform(pixel, 0, 0, pixel, 0, 0)
    ctx.fillStyle = '#111116'
    ctx.fillRect(0, 0, width, height)
    if (texture.naturalWidth) drawTerrain(ctx, width, height)
    if (live || overlap) ctx.drawImage(raster, 0, 0, width, height)
    ctx.font = '600 11px DM Sans, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 1
    ctx.strokeStyle = '#d8dfec45'
    ctx.beginPath()
    for (const fraction of [.25, .5, .75]) {
      ctx.moveTo(width * fraction, 0)
      ctx.lineTo(width * fraction, height)
      ctx.moveTo(0, height * fraction)
      ctx.lineTo(width, height * fraction)
    }
    ctx.stroke()
    const labels = []
    function mark(point, label, ink, shape, offset = -13) {
      if (point.lat > northLatitude) return
      const position = coverageProject(point, northLatitude)
      const x = clamp(position.x * width, 6, width - 6)
      const y = clamp(position.y * height, 6, height - 6)
      ctx.beginPath()
      if (shape === 'site') {
        ctx.moveTo(x, y - 6)
        ctx.lineTo(x + 6, y)
        ctx.lineTo(x, y + 6)
        ctx.lineTo(x - 6, y)
        ctx.closePath()
      } else ctx.arc(x, y, 4.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#101014'
      ctx.fill()
      ctx.strokeStyle = ink
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.font = '600 12px DM Sans, sans-serif'
      const textWidth = ctx.measureText(label).width
      const offsets = [offset, -offset, 2 * offset, -2 * offset, 3 * offset]
      const fits = (left, top) => !labels.some(box => Math.abs(top - box.top) < 16 && left < box.right + 4 && left + textWidth + 4 > box.left)
      let left, top
      for (const delta of offsets) {
        top = clamp(y + delta, 9, height - 9)
        const placements = [x + 9, x - textWidth - 9].map(value => clamp(value, 5, width - textWidth - 5))
        left = placements.find(value => fits(value, top))
        if (left !== undefined) break
      }
      if (left === undefined) return
      labels.push({ left, right: left + textWidth, top })
      ctx.lineWidth = 3
      ctx.strokeStyle = '#101014'
      ctx.strokeText(label, left, top)
      ctx.fillStyle = ink
      ctx.fillText(label, left, top)
    }
    mark(site, 'Selected site', '#fff', 'site', site.lat > 75 ? 14 : -14)
    if (live) {
      if (power || (visibility & 5)) mark(subPoint(frame[0]), 'Sun overhead', inks[1], 'point')
      if (visibility & 6) mark(subPoint(frame[1]), 'Earth overhead', inks[2], 'point', 13)
    }
  }

  new ResizeObserver(draw).observe(canvas)
  canvas.addEventListener('click', event => {
    if (!site) return
    const rect = canvas.getBoundingClientRect()
    onPoint(coverageUnproject((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, northLatitude))
  })

  return (nextFrame, nextSite, { visibility: nextVisibility = 0, power: nextPower = false, overlap: nextOverlap,
    colorByPower: nextColorByPower = nextPower && !nextOverlap, northLatitude: nextNorthLatitude = 90, powerMax: nextPowerMax = solarPowerScaleMax } = {}) => {
    if (northLatitude !== nextNorthLatitude) basemapDirty = true
    if (overlap !== nextOverlap || basemapDirty) overlapSamples = undefined
    if (frame !== nextFrame || visibility !== nextVisibility || power !== nextPower || overlap !== nextOverlap ||
        colorByPower !== nextColorByPower || basemapDirty || powerMax !== nextPowerMax) dirty = true
    frame = nextFrame
    site = nextSite
    visibility = nextVisibility
    power = nextPower
    overlap = nextOverlap
    colorByPower = nextColorByPower
    northLatitude = nextNorthLatitude
    powerMax = nextPowerMax
    draw()
  }
}
