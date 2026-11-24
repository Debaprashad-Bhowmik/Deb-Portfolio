import { createGlobe } from './globe.mjs'
import { visibilityLayers } from './coverage-map.mjs'

const canvas = document.getElementById('moon')
const directions = { sun: document.getElementById('sun'), earth: document.getElementById('earth') }
const origin = location.origin
const declareStatus = status => parent.postMessage({ type: 'lunar-comparison-map-status', status }, origin)
const rotation = { ArrowUp: [4, 0], ArrowDown: [-4, 0], ArrowLeft: [0, -8], ArrowRight: [0, 8] }
let globe, site

try {
  globe = createGlobe(canvas, document.getElementById('markers'), null, null, 315_000,
    null, null, null, { detail: 'south', directions, globalElevation: false })
  globe.southPole()
  for (const event of ['textureerror', 'webglcontextlost']) {
    canvas.addEventListener(event, () => {
      globe = undefined
      declareStatus('error')
    }, { once: true })
  }
  canvas.addEventListener('keydown', event => {
    if (!globe || !Object.hasOwn(rotation, event.key)) return
    event.preventDefault()
    globe.rotate(...rotation[event.key])
  })
  window.addEventListener('message', event => {
    if (event.source !== parent || event.origin !== origin || event.data?.type !== 'lunar-comparison-map' || !globe) return
    const { action, patch, vectors, layers } = event.data
    if (action === 'update') {
      if (site?.id !== patch.id) {
        site = { ...patch, displayName: patch.name, kind: 'Landing suggestion' }
        globe.setSites([site], site.id)
        globe.southPole()
      }
      if (vectors) {
        const visibility = (layers.sun ? visibilityLayers.sun : 0) | (layers.earth ? visibilityLayers.earth : 0)
        globe.setLayers(vectors, { visibility, terrainShadows: layers.shadows })
      }
    }
    if (action === 'zoom-in') globe.zoom(1.25)
    if (action === 'zoom-out') globe.zoom(.8)
    if (action === 'center' && site) globe.center(site)
  })
  declareStatus('ready')
} catch {
  declareStatus('error')
}
