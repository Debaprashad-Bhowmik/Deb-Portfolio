import { siteSkyModel } from './planner.mjs'
import { createStarSky } from './star-sky.mjs'
import { createSurfaceView, loadSurfaceMesh, surfaceHorizon } from './surface-view.mjs'

const origin = location.origin
const canvas = document.getElementById('surface-canvas')
const sky = document.getElementById('surface-sky')
const labels = document.getElementById('surface-labels')
const rotationKeys = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] }
let status = 'loading'
let selected, clock, surface, sampleSky
let contextLost = false

function reportStatus(next = status) {
  status = next
  parent.postMessage({ type: 'lunar-comparison-map-status', status }, origin)
}

function draw() {
  if (!sampleSky || contextLost) return
  surface.update(sampleSky(clock.vectors), null, clock.epoch, clock.rotation)
}

async function openSite(location) {
  sampleSky = undefined
  reportStatus('loading')
  try {
    const observer = location.horizon ? location : {
      ...location, ...await surfaceHorizon(location.lat, location.lon),
    }
    const terrain = await loadSurfaceMesh(observer)
    if (selected !== location || contextLost) return
    if (!surface) {
      const stars = createStarSky(document.getElementById('star-sky'), { maxTextureSize: 2048 })
      surface = createSurfaceView(canvas, sky, labels, undefined, stars, { compact: true })
    }
    surface.setTerrain(terrain.mesh, terrain.site, 0)
    canvas.setAttribute('aria-label', `Surface at ${location.name}. Drag to look. Use W, A, S and D to walk.`)
    sampleSky = siteSkyModel(observer, true)
    draw()
    reportStatus('ready')
  } catch {
    if (selected === location) reportStatus('error')
  }
}

window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== origin || event.data?.type !== 'lunar-comparison-map') return
  const { action, patch, epoch, vectors, rotation } = event.data
  if (action === 'status') { reportStatus(); return }
  if (action === 'reset' && status === 'ready') {
    surface.returnToLanding()
    surface.aim(0, 2)
  }
  if (action !== 'update' || !patch || !vectors || contextLost) return
  clock = { epoch, vectors, rotation }
  if (selected?.id !== patch.id) {
    selected = patch
    void openSite(patch)
  } else {
    draw()
  }
})

canvas.addEventListener('keydown', event => {
  if (status !== 'ready' || !Object.hasOwn(rotationKeys, event.key)) return
  event.preventDefault()
  surface.turn(...rotationKeys[event.key])
})

canvas.addEventListener('webglcontextlost', () => {
  contextLost = true
  reportStatus('error')
})
