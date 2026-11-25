import { artemisSouthLatitude, createGlobe } from './globe.mjs'
import { visibilityLayers } from './coverage-map.mjs'

const canvas = document.getElementById('moon')
const directions = { sun: document.getElementById('sun'), earth: document.getElementById('earth') }
const origin = location.origin
const rotation = { ArrowUp: [4, 0], ArrowDown: [-4, 0], ArrowLeft: [0, -8], ArrowRight: [0, 8] }
let globe, site
let status = 'loading'

function declareStatus(next = status) {
  status = next
  parent.postMessage({ type: 'lunar-comparison-map-status', status }, origin)
}

window.addEventListener('message', event => {
  if (event.source !== parent || event.origin !== origin || event.data?.type !== 'lunar-comparison-map') return
  const { action, vectors, layers } = event.data
  if (action === 'status') { declareStatus(); return }
  if (!globe) return
  if (action === 'update') {
    // A tab opened before the catalog update still sends its selection as a patch.
    const location = event.data.patch ?? event.data.site
    if (!location) return
    if (site?.id !== location.id) {
      site = { ...location, displayName: location.name, kind: location.kind ?? 'Landing suggestion' }
      globe.setSites([site], site.id)
      if (site.lat <= artemisSouthLatitude) globe.southPole()
      else globe.landCamera(site)
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
  declareStatus('ready')
} catch {
  declareStatus('error')
}
