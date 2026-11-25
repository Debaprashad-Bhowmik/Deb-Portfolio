import { createGlobe, globeOrientation } from './globe.mjs'
import { binaryFrames, frameAt, siteSkyModel, siteSolarPower } from './planner.mjs'
import { createSpaceView, readSpaceSamples, spaceStep } from './space-view.mjs'
import { createSurfaceView, loadSurfaceMesh, surfaceHorizon, surfacePaths } from './surface-view.mjs'
import { siteFlightCenter, surfaceFlightFrame } from './viewer-flight.mjs'
import { createStarSky } from './star-sky.mjs'

const stage = document.getElementById('scene')
const layers = Object.fromEntries(['orbit', 'map', 'surface'].map(mode => [mode, document.getElementById(mode)]))
const orbitCanvas = document.getElementById('orbit-canvas')
const moonCanvas = document.getElementById('moon')
const surfaceCanvas = document.getElementById('surface-canvas')
const mapStart = { lat: -47, lon: -10.04 }
const landingEye = { height: 2, azimuth: 0, elevation: 2, zoom: 1 }
const views = Object.keys(layers)
const directions = { forward: [1, 0], back: [-1, 0], left: [0, -1], right: [0, 1] }
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const origin = location.origin

let mode = 'map'
let phase = 'loading'
let message = ''
let distance = 0
let mission, orbit, globe, surface, ephemeris, start, end, site, terrainSite, worker
let drawStarSky
let clock = 0
let sky = []
let request = 0
let pendingWindow, activeWindow
let showMissionPaths = false
let guideFrames, localGuides
const candidates = new Map()
const catalogSites = new Map()
const catalogNames = {
  odysseus: 'Odysseus · Malapert A',
  athena: 'Athena · Mons Mouton',
  mouton: 'Mons Mouton Plateau',
}
let recommendations = []
const post = data => parent.postMessage(data, origin)
const sendState = () => post({ type: 'lunar-scene-state', mode, phase, message, distance, sky, siteName: site?.displayName ?? '' })
const hour = 3_600_000
const orbitIndex = () => (clock - start) / (spaceStep * 1000)
const skyVectors = () => frameAt(ephemeris, (clock - start) / (mission.step * 1000))

function refreshMissionPaths() {
  guideFrames = null
  localGuides = null
  if (showMissionPaths && activeWindow) {
    const { epoch, duration } = activeWindow
    const first = (epoch - start) / (mission.step * 1000)
    const span = duration * 3600 / mission.step
    const intervals = Math.min(720, Math.ceil(span))
    guideFrames = Array.from({ length: intervals + 1 }, (_, i) => frameAt(ephemeris, first + i / intervals * span))
  }
  orbit.setMissionPaths(guideFrames)
}

function surfaceMissionPaths() {
  if (!guideFrames) return null
  if (localGuides?.site !== site) {
    localGuides = { site, paths: surfacePaths(guideFrames.map(siteSkyModel(site, true)), 1) }
  }
  return localGuides.paths
}

function sendComparison(vectors = skyVectors()) {
  const samples = Object.fromEntries([...catalogSites, ...candidates].map(([id, location]) => {
    const sample = siteSkyModel(location, true)(vectors)
    return [id, {
      sun: sample.sunEl,
      sunStatus: sample.eclipse ? 'Eclipsed' : sample.sunEl > sample.sunHorizon ? 'In view' : 'Blocked',
      earth: sample.earthEl,
      earthStatus: sample.earthEl > sample.earthHorizon ? 'In view' : 'Blocked',
      power: siteSolarPower(sample),
    }]
  }))
  post({ type: 'lunar-scene-comparison', snapshot: {
    epoch: clock, vectors, samples, rotation: orbit.lunarRotation(orbitIndex()),
  } })
}

function syncMapCamera(camera = globe.camera()) {
  if (orbit && mode === 'map' && camera.radius > 0) orbit.mapView(camera)
}

function setView(next) {
  mode = next
  stage.dataset.view = next
  for (const [name, layer] of Object.entries(layers)) layer.inert = name !== next
  if (next === 'map') syncMapCamera()
  else {
    sky = []
    orbit.mapView(null)
  }
}

function updateSky() {
  const vectors = skyVectors()
  globe.setLighting(vectors)
  orbit(orbitIndex(), site, null, clock, mode === 'orbit')
  if (mode === 'map') globe.draw()
  if (terrainSite === site.id) {
    surface.update(siteSkyModel(site, true)(vectors), surfaceMissionPaths(), clock, orbit.lunarRotation(orbitIndex()))
  }
  sendComparison(vectors)
}

function updateMarkers() {
  const markers = new Map(catalogSites)
  for (const { id } of recommendations) markers.set(id, candidates.get(id))
  markers.set(site.id, site)
  globe.setSites([...markers.values()], site.id)
}

function animate(ms, draw) {
  if (reducedMotion.matches) {
    draw(1)
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    let previous = performance.now()
    let elapsed = 0
    function frame(now) {
      elapsed += Math.min(64, Math.max(0, now - previous))
      previous = now
      const t = Math.min(1, elapsed / ms)
      try { draw(t * t * t * (t * (t * 6 - 15) + 10)) }
      catch (error) { reject(error); return }
      if (t < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

async function flyOrbit(reverse) {
  const center = reverse ? globe.viewCenter() : orbit.viewCenter()
  const radius = reverse ? globe.camera().radius : undefined
  setView('orbit')
  if (reverse) orbit.centerOnLunarView(center)
  orbit.approach(reverse ? 1 : 0, center, radius)
  await animate(1900, t => orbit.approach(reverse ? 1 - t : t, center, radius))
  if (!reverse) {
    setView('map')
    globe.landCamera(center)
  }
}

async function prepareSurface() {
  if (terrainSite === site.id) return
  const terrain = await loadSurfaceMesh(site)
  surface ??= createSurfaceView(surfaceCanvas, document.getElementById('surface-sky'),
    document.getElementById('surface-labels'), (_bearing, _targets, meters) => {
      const rounded = Math.round(meters)
      if (rounded === distance) return
      distance = rounded
      if (phase === 'ready') sendState()
    }, drawSurfaceSky)
  surface.setTerrain(terrain.mesh, terrain.site, 0)
  terrainSite = site.id
  updateSky()
}

async function flySurface(reverse) {
  if (!reverse) await prepareSurface()
  const eye = reverse ? surface.camera() : landingEye
  const mapCenter = reverse ? site : globe.viewCenter()
  const { width, height } = stage.getBoundingClientRect()
  const startRadius = reverse ? Math.min(width, height) * .46 : globe.camera().radius
  const options = { width, height, startRadius, eye }
  const layer = layers.surface
  if (!reverse) surface.returnToLanding()
  setView('map')
  layer.inert = false
  function renderFlight(t) {
    const frame = surfaceFlightFrame(t, options)
    const terrainCoversMap = frame.surfaceOpacity >= 1
    stage.dataset.descent = terrainCoversMap ? 'terrain' : 'approach'
    layer.style.opacity = String(frame.surfaceOpacity)
    if (!terrainCoversMap) {
      const center = siteFlightCenter(frame.alignment, mapCenter, site)
      globe.flight({ moving: true, radius: frame.mapRadius, orientation: globeOrientation(center.lat, center.lon) })
    }
    if (frame.surfaceOpacity > 0) surface.flight({ ...frame, moving: true })
  }
  try {
    if (!reducedMotion.matches) renderFlight(reverse ? 1 : 0)
    await animate(reverse ? 2500 : 3100, progress => renderFlight(reverse ? 1 - progress : progress))
  } finally {
    delete stage.dataset.descent
    layer.style.removeProperty('opacity')
    surface.flight(eye)
  }
  globe.landCamera(site)
  setView(reverse ? 'map' : 'surface')
}

async function changeView(next, target = site) {
  if (!views.includes(next) || phase !== 'ready' || (mode === next && target.id === site.id)) return
  phase = 'moving'
  stage.dataset.moving = ''
  message = next === 'surface' ? `Descending to ${target.displayName}…` : next === 'orbit' ? 'Returning to orbit…' : 'Moving to the Moon map…'
  setView(mode)
  sendState()
  try {
    if (next === 'surface' && !target.horizon) {
      target = { ...target, ...await surfaceHorizon(target.lat, target.lon) }
    }
    if (mode === 'orbit') await flyOrbit(false)
    if (mode === 'surface') await flySurface(true)
    if (site.id !== target.id) {
      site = target
      updateMarkers()
      updateSky()
    }
    if (next === 'orbit') await flyOrbit(true)
    if (next === 'surface') await flySurface(false)
    if (phase !== 'error') { phase = 'ready'; message = '' }
  } catch (error) {
    phase = 'ready'
    message = error instanceof Error ? error.message : 'The next view could not load.'
    globe.landCamera(mapStart)
    mode = 'map'
  }
  delete stage.dataset.moving
  setView(mode)
  if (mode === 'surface') surface.draw()
  sendState()
}

const makeControl = (tag, state = {}) => Object.assign(document.createElement(tag), state)
const makeButton = (value = '') => makeControl('button', { value })
const orbitControls = {
  labels: document.getElementById('orbit-labels'),
  starSky(view) {
    if (mode !== 'surface' && stage.dataset.descent !== 'terrain') drawStarSky?.(view)
  },
  moonCamera(camera) { if (mode === 'orbit') globe.flight(camera) },
  mapBodies(bodies) {
    if (sky.join('|') === bodies.join('|')) return
    sky = bodies
    if (phase === 'ready') sendState()
  },
  earthView: makeButton('earth'), sunView: makeButton('sun'),
  left: makeButton(), right: makeButton(), up: makeButton(), down: makeButton(),
  zoomIn: makeButton(), zoomOut: makeButton(), reset: makeButton(),
  yearPath: makeControl('input'), moonPath: makeControl('input', { checked: true }),
  links: makeControl('input'), yearLabel: document.createElement('span'),
}

function drawSurfaceSky(view) {
  // By the handoff the camera is pointing down and the terrain fills the view.
  if (mode === 'surface' || stage.dataset.descent === 'terrain') drawStarSky?.(view)
}

const activeCanvas = () => ({ orbit: orbitCanvas, map: moonCanvas, surface: surfaceCanvas })[mode]

function visitSite(id) {
  const location = catalogSites.get(id) ?? candidates.get(id) ?? (site.id === id ? site : null)
  if (location) void changeView('surface', location)
}

function visitMapPoint({ lat, lon }) {
  const id = `point-${lat.toFixed(6)}/${lon.toFixed(6)}`
  const coordinate = (value, positive, negative) => `${Math.abs(value).toFixed(3)}°${value < 0 ? negative : positive}`
  const displayName = `${coordinate(lat, 'N', 'S')}, ${coordinate(lon, 'E', 'W')}`
  void changeView('surface', site.id === id ? site : { id, displayName, kind: 'Map point', lat, lon })
}

function findCandidates({ epoch, duration, maxSlope } = {}) {
  if (!Number.isFinite(epoch) || !Number.isFinite(duration) || epoch < start ||
      duration < 1 || duration > 8784 || epoch + duration * hour > end ||
      !Number.isFinite(maxSlope) || maxSlope < .1 || maxSlope > 45) {
    post({ type: 'lunar-scene-search-error', message: 'Choose a mission within 2024–2030 and a slope limit from 0.1° to 45°.' })
    return
  }
  pendingWindow = { epoch, duration }
  try {
    if (!worker) {
      worker = new Worker(new URL('./landing-suggestions-worker.mjs', import.meta.url), { type: 'module' })
      worker.addEventListener('message', ({ data }) => {
        if (data.request !== request) return
        if (data.error) {
          post({ type: 'lunar-scene-search-error', message: data.error })
        } else if (data.result) {
          const { winners, rows, flattest, summaries, evaluated } = data.result
          activeWindow = pendingWindow
          clock = activeWindow.epoch
          candidates.clear()
          for (const patch of [...Object.values(winners), ...rows, flattest].filter(Boolean)) {
            candidates.set(patch.id, { ...patch, kind: 'Landing suggestion', displayName: 'Patch ' + patch.id.split('-').at(-1) })
          }
          recommendations = Object.entries(winners).flatMap(([priority, patch]) =>
            patch ? [{ priority, id: patch.id, qualifies: summaries[priority].qualified > 0 }] : [])
          const sites = [...candidates.values(), ...data.catalog].map(location => {
            const { id, displayName: name, kind, slope = null, lat, lon, energyKwh: energy, longestEarthHours: earthHours,
              earthHours: earthTotal, sunHours, sunWindows, earthWindows, averageWatts, longestEarthGap } = location
            const { height, horizon, terrain } = catalogSites.get(id) ?? location
            return { id, name, kind, slope, lat, lon, energy, earthHours, earthTotal, sunHours,
              sunWindows, earthWindows, averageWatts, longestEarthGap, surface: { height, horizon, terrain } }
          })
          updateMarkers()
          post({ type: 'lunar-scene-search-result', recommendations, sites, patches: sites.slice(0, candidates.size),
            evaluated, sampled: data.sampled, step: data.step })
          refreshMissionPaths()
          updateSky()
          sendState()
        } else {
          post({ type: 'lunar-scene-search-progress', done: data.done, total: data.total })
        }
      })
      worker.addEventListener('error', () => {
        worker.terminate()
        worker = undefined
        post({ type: 'lunar-scene-search-error', message: 'The search stopped. Run Landing Suggestions to retry.' })
      })
    }
    worker.postMessage({ request: ++request, ephemeris, duration, maxSlope, catalog: [...catalogSites.values()],
      first: (epoch - start) / (mission.step * 1000), frameHours: mission.step / 3600,
      preference: { mode: 'balanced', minimumShare: 0, body: 'earth' } })
  } catch {
    post({ type: 'lunar-scene-search-error', message: 'Landing Suggestions could not start. Reload the viewer to retry.' })
  }
}

window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== origin || event.data?.type !== 'lunar-scene-command') return
  const { action, value } = event.data
  if (action === 'status') { sendState(); return }
  if (phase !== 'ready') return
  if (action === 'view') void changeView(value)
  if (action === 'search') findCandidates(value)
  if (action === 'visit') visitSite(value)
  if (action === 'paths' && typeof value === 'boolean') {
    showMissionPaths = value
    refreshMissionPaths()
    updateSky()
  }
  if (action === 'clock' && Number.isFinite(value) && value >= start && value <= end) {
    clock = value
    updateSky()
  }
  if (action === 'focus') activeCanvas().focus({ preventScroll: true })
  if (action === 'reset') {
    if (mode === 'orbit') orbitControls.reset.click()
    if (mode === 'map') globe.landCamera(mapStart)
    if (mode === 'surface') { surface.returnToLanding(); surface.flight(landingEye) }
  }
  if (action === 'walk' && mode === 'surface' && Object.hasOwn(directions, value)) surface.walk(...directions[value], 8)
  if (action === 'zoom' && (value === 'in' || value === 'out')) {
    if (mode === 'orbit') orbitControls[value === 'in' ? 'zoomIn' : 'zoomOut'].click()
    if (mode === 'map') globe.zoom(value === 'in' ? 1.25 : .8)
  }
})

async function asset(path, format) {
  const response = await fetch(path)
  if (!response.ok) throw new Error('Lunar scene data could not load.')
  return response[format]()
}

async function startScene() {
  try {
    const [config, positions, surfacePositions, locations] = await Promise.all([
      asset('./data/mission.json', 'json'), asset('./data/space-positions.bin', 'arrayBuffer'), asset('./data/ephemeris.bin', 'arrayBuffer'),
      asset('./data/sites.json', 'json'),
    ])
    mission = config
    start = Date.parse(mission.start)
    end = Date.parse(mission.end)
    site = mission.site
    clock = mission.epoch
    ephemeris = binaryFrames(surfacePositions)
    for (const location of locations) {
      catalogSites.set(location.id, { ...location, displayName: catalogNames[location.id] ?? location.name })
    }
    globe = createGlobe(moonCanvas, document.getElementById('markers'), null, null,
      mission.mapExtent, visitSite, visitMapPoint, null, { detail: false, onCameraChange: syncMapCamera })
    updateMarkers()
    globe.landCamera(mapStart)
    orbit = createSpaceView(orbitCanvas, readSpaceSamples(positions, start, end), orbitControls)
    drawStarSky = createStarSky(document.getElementById('star-sky'))
    updateSky()
    phase = 'ready'
    setView('map')
    sendState()
  } catch (error) {
    phase = 'error'
    message = 'The 3D scene could not load. Try reloading the viewer.'
    console.error(error)
    sendState()
  }
}

function failRendering() {
  phase = 'error'
  message = 'The browser lost its 3D rendering context. Reload the viewer to try again.'
  sendState()
}

for (const canvas of [orbitCanvas, moonCanvas, surfaceCanvas]) {
  canvas.addEventListener('webglcontextlost', failRendering)
  canvas.addEventListener('keydown', event => {
    if (phase !== 'ready' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const direction = event.key.slice(5).toLowerCase()
    if (mode === 'orbit') orbitControls[direction].click()
    if (mode === 'map' || mode === 'surface') {
      const [vertical, horizontal] = { left: [0, -10], right: [0, 10], up: [10, 0], down: [-10, 0] }[direction]
      if (mode === 'map') globe.rotate(vertical, horizontal)
      else surface.turn(horizontal, vertical)
    }
  })
}
moonCanvas.addEventListener('textureerror', failRendering)
void startScene()
