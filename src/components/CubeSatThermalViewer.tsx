import { useEffect, useRef, useState } from 'react'
import { notifyCubesatReady } from '../sceneReadiness'

export type ThermalAnchorKey = 'xFace' | 'panel' | 'battery' | 'radio' | 'nadir'
export type ThermalAnchorPoint = { x: number; y: number; visible: boolean }
export type ThermalAnchorMap = Record<ThermalAnchorKey, ThermalAnchorPoint>

export type ThermalTelemetry = {
  xFace: number
  panel: number
  battery: number
  radio: number
  nadir: number
  peak: number
  cold: number
}

type CubeSatThermalViewerProps = {
  sunlight: boolean
  orbitMinutes: number
  thermal: ThermalTelemetry
  onAnchorUpdate: (anchors: ThermalAnchorMap) => void
  onReady?: () => void
}

type CubeSatSceneStatus = 'waiting' | 'preparing' | 'loaded' | 'recovering' | 'model-error'

type ThermalSurfaceKind = 'front' | 'right' | 'left' | 'nadir' | 'rear' | 'solar' | 'sideSolar'

type ThermalTextureBinding = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  columns?: number
  kind: ThermalSurfaceKind
  rows?: number
  texture: import('three').CanvasTexture
}

type ThermalAnchorDefinition = {
  point: import('three').Vector3
  normal: import('three').Vector3
}

type CubeSatModel = {
  anchorDefinitions: Record<ThermalAnchorKey, ThermalAnchorDefinition>
  boundsSize: import('three').Vector3
  root: import('three').Group
  thermalTextures: ThermalTextureBinding[]
}

const thermalStops = [
  { value: -46, color: [43, 72, 218] },
  { value: -28, color: [24, 112, 235] },
  { value: -8, color: [24, 178, 222] },
  { value: 12, color: [72, 213, 180] },
  { value: 30, color: [168, 224, 100] },
  { value: 48, color: [249, 206, 75] },
  { value: 64, color: [241, 122, 45] },
  { value: 82, color: [210, 61, 48] },
] as const

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / Math.max(edge1 - edge0, 0.0001), 0, 1)
  return t * t * (3 - 2 * t)
}

function gaussian(value: number, center: number, width: number) {
  const normalized = (value - center) / width
  return Math.exp(-normalized * normalized)
}

function seededNoise(x: number, y: number, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
  return value - Math.floor(value)
}

function rgba(color: readonly [number, number, number], alpha = 1) {
  return `rgba(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])}, ${alpha})`
}

function temperatureRgb(value: number): [number, number, number] {
  const clamped = clamp(value, thermalStops[0].value, thermalStops[thermalStops.length - 1].value)
  const lower = thermalStops.findLast((stop) => stop.value <= clamped) ?? thermalStops[0]
  const upper = thermalStops.find((stop) => stop.value >= clamped) ?? thermalStops[thermalStops.length - 1]
  const t = (clamped - lower.value) / Math.max(upper.value - lower.value, 1)
  return [
    lerp(lower.color[0], upper.color[0], t),
    lerp(lower.color[1], upper.color[1], t),
    lerp(lower.color[2], upper.color[2], t),
  ]
}

function visualTemperature(value: number, sunlight: boolean) {
  const pivot = sunlight ? 26 : -6
  const gain = sunlight ? 1.26 : 1.36
  return pivot + (value - pivot) * gain
}

function disposeMaterial(material: import('three').Material | import('three').Material[], disposed: Set<unknown>) {
  if (Array.isArray(material)) {
    material.forEach((entry) => disposeMaterial(entry, disposed))
    return
  }

  const materialWithMaps = material as import('three').Material & {
    alphaMap?: import('three').Texture | null
    bumpMap?: import('three').Texture | null
    emissiveMap?: import('three').Texture | null
    map?: import('three').Texture | null
    metalnessMap?: import('three').Texture | null
    normalMap?: import('three').Texture | null
    roughnessMap?: import('three').Texture | null
  }

  ;(['map', 'alphaMap', 'bumpMap', 'emissiveMap', 'metalnessMap', 'normalMap', 'roughnessMap'] as const).forEach((key) => {
    const texture = materialWithMaps[key]
    if (texture && !disposed.has(texture)) {
      disposed.add(texture)
      texture.dispose()
    }
  })

  if (disposed.has(material)) return
  disposed.add(material)
  material.dispose()
}

function disposeObjectResources(object: import('three').Object3D) {
  const disposed = new Set<unknown>()
  object.traverse((entry) => {
    const disposable = entry as import('three').Object3D & {
      geometry?: { dispose: () => void }
      material?: import('three').Material | import('three').Material[]
    }

    if (disposable.geometry && !disposed.has(disposable.geometry)) {
      disposed.add(disposable.geometry)
      disposable.geometry.dispose()
    }

    if (disposable.material) {
      disposeMaterial(disposable.material, disposed)
    }
  })
}

function setRendererSize(
  renderer: import('three').WebGLRenderer,
  camera: import('three').PerspectiveCamera,
  container: HTMLDivElement,
) {
  const rect = container.getBoundingClientRect()
  const width = Math.max(300, rect.width)
  const height = Math.max(380, rect.height)
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function createCanvasTexture(
  THREE: typeof import('three'),
  width: number,
  height: number,
  draw: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void,
) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return undefined
  draw(context, canvas)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function createThermalTextureBinding(
  THREE: typeof import('three'),
  kind: ThermalSurfaceKind,
  thermal: ThermalTelemetry,
  sunlight: boolean,
  orbitMinutes: number,
  columns?: number,
  rows?: number,
) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const context = canvas.getContext('2d')
  if (!context) return undefined
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const binding: ThermalTextureBinding = { canvas, context, columns, kind, rows, texture }
  redrawThermalTexture(binding, thermal, sunlight, orbitMinutes)
  return binding
}

function createMetalTexture(THREE: typeof import('three')) {
  return createCanvasTexture(THREE, 512, 512, (context, canvas) => {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f2f5f2')
    gradient.addColorStop(0.46, '#98a5a2')
    gradient.addColorStop(1, '#e0e5e0')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)

    for (let y = 0; y < canvas.height; y += 2) {
      const alpha = 0.035 + seededNoise(y, 7, 4) * 0.05
      context.fillStyle = `rgba(20, 26, 28, ${alpha})`
      context.fillRect(0, y, canvas.width, 1)
    }

    for (let index = 0; index < 90; index += 1) {
      const x = seededNoise(index, 1, 9) * canvas.width
      const y = seededNoise(index, 2, 9) * canvas.height
      context.strokeStyle = `rgba(255, 255, 255, ${0.04 + seededNoise(index, 3, 9) * 0.12})`
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + 24 + seededNoise(index, 4, 9) * 70, y - 1 + seededNoise(index, 5, 9) * 2)
      context.stroke()
    }
  })
}

function sampleTextureTemperature(
  kind: ThermalSurfaceKind,
  u: number,
  v: number,
  thermal: ThermalTelemetry,
  sunlight: boolean,
  orbitMinutes: number,
) {
  const orbitAngle = (orbitMinutes / 90) * Math.PI * 2
  const sunSweep = Math.sin(orbitAngle)
  const terminator = Math.cos(orbitAngle)
  const orbitWave = Math.sin(orbitAngle + u * 3.7 - v * 2.2) * (sunlight ? 8.6 : 5.2)
  const bottom = 1 - v

  if (kind === 'front') {
    const hotBandCenter = sunlight ? 0.62 + sunSweep * 0.2 : 0.5 + sunSweep * 0.12
    const hotBand = gaussian(u, hotBandCenter, 0.16) * (sunlight ? 54 : 20)
    const coolLeft = lerp(-13, 8, smoothstep(0.05, 0.55, u))
    const lowerCooling = bottom > 0.66 ? lerp(0, -15, smoothstep(0.66, 1, bottom)) : 0
    const upperWarmth = smoothstep(0.18, 0.72, v) * (sunlight ? 9 : 4)
    const eclipseShadow = sunlight ? 0 : gaussian(u, 0.72 - sunSweep * 0.1, 0.34) * -16
    return thermal.nadir + 18 + coolLeft + hotBand + lowerCooling + upperWarmth + orbitWave + eclipseShadow
  }

  if (kind === 'right') {
    const hotLeadingEdge = gaussian(u, 0.16 + terminator * 0.08, 0.18) * (sunlight ? 34 : 12)
    const coolRear = lerp(10, -12, smoothstep(0.28, 1, u))
    const nadirWash = smoothstep(0.68, 1, bottom) * -18
    const sideSweep = Math.sin(orbitAngle + v * 2.4) * (sunlight ? 6 : 3)
    return thermal.battery + coolRear + hotLeadingEdge + nadirWash + orbitWave * 0.9 + sideSweep
  }

  if (kind === 'left') {
    const panelWash = gaussian(u, 0.78 + sunSweep * 0.12, 0.24) * (sunlight ? 18 : 8)
    return lerp(thermal.nadir + 8, thermal.panel - 10, v) + panelWash + orbitWave * 0.85
  }

  if (kind === 'rear') {
    const serviceModule = gaussian(u, 0.34, 0.2) * gaussian(v, 0.64, 0.26) * (sunlight ? 12 : 6)
    const avionicsBay = gaussian(u, 0.68, 0.16) * gaussian(v, 0.38, 0.2) * (sunlight ? 9 : 5)
    const railConduction = (
      gaussian(u, 0.05, 0.11) +
      gaussian(u, 0.95, 0.11) +
      gaussian(v, 0.08, 0.12) +
      gaussian(v, 0.92, 0.12)
    ) * (sunlight ? 6 : 3)
    const backShadow = sunlight ? -9 + terminator * 2 : -17
    return thermal.radio - 4 + backShadow + serviceModule + avionicsBay + railConduction + orbitWave * 0.42
  }

  if (kind === 'solar') {
    const sweepCenter = 0.5 + sunSweep * 0.28
    const directSun = gaussian(u, sweepCenter, 0.24) * (sunlight ? 20 : 6)
    const trailingCool = gaussian(u, 1 - sweepCenter, 0.34) * (sunlight ? -10 : -18)
    const edgeCooling = (gaussian(v, 0.04, 0.08) + gaussian(v, 0.96, 0.08)) * -7
    return thermal.panel + directSun + trailingCool + edgeCooling + orbitWave * 1.05
  }

  if (kind === 'sideSolar') {
    const sweepCenter = 0.56 + sunSweep * 0.2
    const verticalSun = gaussian(v, sweepCenter, 0.23) * (sunlight ? 18 : 5)
    const rearCool = smoothstep(0.45, 1, u) * (sunlight ? -8 : -15)
    return thermal.panel - 4 + verticalSun + rearCool + orbitWave * 0.9
  }

  return thermal.nadir - 2 + (1 - u) * 6 + orbitWave * 0.7
}

function drawPanelSeams(context: CanvasRenderingContext2D, width: number, height: number, columns: number, rows: number) {
  context.strokeStyle = 'rgba(18, 34, 38, 0.42)'
  context.lineWidth = 2
  for (let column = 1; column < columns; column += 1) {
    const x = (column / columns) * width
    context.beginPath()
    context.moveTo(x, 0)
    context.lineTo(x, height)
    context.stroke()
  }
  for (let row = 1; row < rows; row += 1) {
    const y = (row / rows) * height
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y)
    context.stroke()
  }
}

function drawSurfaceWear(context: CanvasRenderingContext2D, width: number, height: number, seed: number) {
  for (let index = 0; index < 130; index += 1) {
    const x = seededNoise(index, 1, seed) * width
    const y = seededNoise(index, 2, seed) * height
    const length = 12 + seededNoise(index, 3, seed) * 48
    const alpha = 0.04 + seededNoise(index, 4, seed) * 0.12
    context.strokeStyle = `rgba(255, 255, 255, ${alpha})`
    context.lineWidth = 0.8
    context.beginPath()
    context.moveTo(x, y)
    context.lineTo(x + length, y + (seededNoise(index, 5, seed) - 0.5) * 8)
    context.stroke()
  }
}

function drawSurfaceScrews(context: CanvasRenderingContext2D, width: number, height: number, columns: number, rows: number) {
  context.fillStyle = 'rgba(210, 218, 214, 0.86)'
  context.strokeStyle = 'rgba(26, 31, 33, 0.3)'
  for (let column = 0; column <= columns; column += 1) {
    for (let row = 0; row <= rows; row += 1) {
      if ((column + row) % 2 !== 0) continue
      const x = (column / columns) * width
      const y = (row / rows) * height
      context.beginPath()
      context.arc(x, y, 3.8, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    }
  }
}

function drawRearServiceDetails(context: CanvasRenderingContext2D, width: number, height: number) {
  context.save()
  context.globalCompositeOperation = 'source-over'

  context.strokeStyle = 'rgba(18, 28, 30, 0.24)'
  context.lineWidth = 1.4
  for (let index = 0; index < 10; index += 1) {
    const y = (index / 9) * height
    context.beginPath()
    context.moveTo(0, y)
    context.lineTo(width, y + (index % 2 === 0 ? 10 : -8))
    context.stroke()
  }

  const plates = [
    [0.08, 0.14, 0.38, 0.32],
    [0.53, 0.16, 0.34, 0.24],
    [0.12, 0.58, 0.3, 0.24],
    [0.58, 0.54, 0.28, 0.28],
  ]

  plates.forEach(([x, y, w, h], index) => {
    const px = x * width
    const py = y * height
    const pw = w * width
    const ph = h * height
    context.fillStyle = index % 2 === 0 ? 'rgba(219, 228, 220, 0.28)' : 'rgba(180, 193, 184, 0.22)'
    context.strokeStyle = 'rgba(15, 24, 27, 0.34)'
    context.lineWidth = 2
    context.fillRect(px, py, pw, ph)
    context.strokeRect(px, py, pw, ph)

    context.strokeStyle = 'rgba(255, 255, 255, 0.22)'
    context.lineWidth = 1
    for (let line = 1; line < 4; line += 1) {
      const ly = py + (line / 4) * ph
      context.beginPath()
      context.moveTo(px + 10, ly)
      context.lineTo(px + pw - 10, ly)
      context.stroke()
    }
  })

  context.fillStyle = 'rgba(26, 35, 38, 0.62)'
  context.strokeStyle = 'rgba(255, 255, 255, 0.16)'
  for (let index = 0; index < 6; index += 1) {
    const x = (0.18 + index * 0.12) * width
    const y = (0.48 + (index % 2) * 0.08) * height
    context.beginPath()
    context.arc(x, y, 9, 0, Math.PI * 2)
    context.fill()
    context.stroke()
  }

  context.strokeStyle = 'rgba(22, 30, 32, 0.42)'
  context.lineWidth = 5
  context.beginPath()
  context.moveTo(width * 0.19, height * 0.48)
  context.bezierCurveTo(width * 0.34, height * 0.4, width * 0.5, height * 0.58, width * 0.72, height * 0.42)
  context.stroke()

  context.restore()
}

function redrawThermalTexture(
  binding: ThermalTextureBinding,
  thermal: ThermalTelemetry,
  sunlight: boolean,
  orbitMinutes: number,
) {
  const { canvas, context, kind, texture } = binding
  const width = canvas.width
  const height = canvas.height
  const step = 3

  for (let y = 0; y < height; y += step) {
    const v = 1 - y / height
    for (let x = 0; x < width; x += step) {
      const u = x / width
      const temperature = sampleTextureTemperature(kind, u, v, thermal, sunlight, orbitMinutes)
      const color = temperatureRgb(visualTemperature(temperature, sunlight))
      const grain = (seededNoise(x, y, kind === 'front' ? 12 : 22) - 0.5) * 18
      context.fillStyle = rgba([
        clamp(color[0] + grain, 0, 255),
        clamp(color[1] + grain, 0, 255),
        clamp(color[2] + grain, 0, 255),
      ])
      context.fillRect(x, y, step, step)
    }
  }

  if (kind === 'right') {
    context.globalCompositeOperation = 'multiply'
    context.globalAlpha = 0.58
    context.fillStyle = '#020735'
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
    context.globalCompositeOperation = 'source-over'
    context.strokeStyle = 'rgba(220, 156, 34, 0.78)'
    context.lineWidth = 1.2
    drawPanelSeams(context, width, height, 6, 8)
    for (let column = 0; column <= 6; column += 1) {
      for (let row = 0; row <= 8; row += 1) {
        context.fillStyle = 'rgba(236, 176, 48, 0.78)'
        context.beginPath()
        context.arc((column / 6) * width, (row / 8) * height, 3.8, 0, Math.PI * 2)
        context.fill()
      }
    }
  } else if (kind === 'solar' || kind === 'sideSolar') {
    const columns = binding.columns ?? (kind === 'solar' ? 8 : 6)
    const rows = binding.rows ?? (kind === 'solar' ? 7 : 8)
    const panelTint = temperatureRgb(visualTemperature(thermal.panel, sunlight))

    context.globalCompositeOperation = 'multiply'
    context.globalAlpha = sunlight ? 0.42 : 0.56
    context.fillStyle = '#06112b'
    context.fillRect(0, 0, width, height)

    context.globalCompositeOperation = 'screen'
    context.globalAlpha = sunlight ? 0.22 : 0.14
    context.fillStyle = rgba(panelTint, 0.9)
    context.fillRect(0, 0, width, height)

    context.globalAlpha = 1
    context.globalCompositeOperation = 'source-over'
    context.strokeStyle = 'rgba(239, 178, 48, 0.72)'
    context.lineWidth = 1.35
    drawPanelSeams(context, width, height, columns, rows)

    context.fillStyle = 'rgba(242, 184, 54, 0.84)'
    for (let column = 0; column <= columns; column += 1) {
      for (let row = 0; row <= rows; row += 1) {
        const x = (column / columns) * width
        const y = (row / rows) * height
        context.beginPath()
        context.arc(x, y, 4.1, 0, Math.PI * 2)
        context.fill()
      }
    }
  } else if (kind === 'front') {
    drawPanelSeams(context, width, height, 6, 7)
    drawSurfaceWear(context, width, height, 5)
    drawSurfaceScrews(context, width, height, 6, 7)
  } else if (kind === 'left') {
    drawPanelSeams(context, width, height, 4, 6)
    drawSurfaceWear(context, width, height, 8)
    drawSurfaceScrews(context, width, height, 4, 6)
  } else if (kind === 'rear') {
    context.globalCompositeOperation = 'multiply'
    context.globalAlpha = 0.22
    context.fillStyle = '#d7ded4'
    context.fillRect(0, 0, width, height)
    context.globalAlpha = 1
    context.globalCompositeOperation = 'source-over'
    drawPanelSeams(context, width, height, 5, 6)
    drawSurfaceWear(context, width, height, 13)
    drawSurfaceScrews(context, width, height, 5, 6)
    drawRearServiceDetails(context, width, height)
  } else {
    drawPanelSeams(context, width, height, 5, 3)
  }

  const vignette = context.createRadialGradient(width * 0.5, height * 0.5, width * 0.1, width * 0.5, height * 0.5, width * 0.78)
  vignette.addColorStop(0, 'rgba(255, 255, 255, 0.04)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.18)')
  context.fillStyle = vignette
  context.fillRect(0, 0, width, height)

  texture.needsUpdate = true
}

function redrawThermalTextures(
  bindings: ThermalTextureBinding[],
  thermal: ThermalTelemetry,
  sunlight: boolean,
  orbitMinutes: number,
) {
  bindings.forEach((binding) => redrawThermalTexture(binding, thermal, sunlight, orbitMinutes))
}

function createPlaneOnBasis(
  THREE: typeof import('three'),
  width: number,
  height: number,
  material: import('three').Material,
  position: import('three').Vector3,
  u: import('three').Vector3,
  v: import('three').Vector3,
  normal: import('three').Vector3,
) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  mesh.position.copy(position)
  mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(u, v, normal))
  mesh.receiveShadow = true
  mesh.castShadow = true
  return mesh
}

function addBox(
  THREE: typeof import('three'),
  parent: import('three').Object3D,
  size: [number, number, number],
  position: [number, number, number],
  material: import('three').Material,
  edgeOpacity = 0,
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material.clone())
  mesh.position.set(position[0], position[1], position[2])
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)

  if (edgeOpacity > 0) {
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x192027,
      transparent: true,
      opacity: edgeOpacity,
    })
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), edgeMaterial)
    edges.scale.setScalar(1.002)
    mesh.add(edges)
  }

  return mesh
}

function addFrontCylinder(
  THREE: typeof import('three'),
  parent: import('three').Object3D,
  radius: number,
  depth: number,
  position: [number, number, number],
  material: import('three').Material,
  segments = 80,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, segments), material.clone())
  mesh.position.set(position[0], position[1], position[2])
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

function addFrontTorus(
  THREE: typeof import('three'),
  parent: import('three').Object3D,
  radius: number,
  tube: number,
  position: [number, number, number],
  material: import('three').Material,
) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 96), material.clone())
  mesh.rotation.x = Math.PI / 2
  mesh.position.set(position[0], position[1], position[2])
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

function addFrontFan(
  THREE: typeof import('three'),
  parent: import('three').Object3D,
  center: [number, number, number],
  radius: number,
  bladeMaterial: import('three').Material,
  hubMaterial: import('three').Material,
) {
  const ventGroup = new THREE.Group()
  ventGroup.position.set(center[0], center[1], center[2])
  ventGroup.rotation.x = Math.PI / 2
  parent.add(ventGroup)

  const vaneGeometry = new THREE.BoxGeometry(radius * 0.78, radius * 0.018, 0.012)
  const vaneMaterial = hubMaterial.clone()
  const shadowMaterial = bladeMaterial.clone()

  for (let vane = 0; vane < 8; vane += 1) {
    const angle = (vane / 8) * Math.PI * 2
    const mesh = new THREE.Mesh(vaneGeometry, vane % 2 === 0 ? vaneMaterial.clone() : shadowMaterial.clone())
    mesh.position.set(Math.cos(angle) * radius * 0.32, Math.sin(angle) * radius * 0.32, 0)
    mesh.rotation.z = angle
    mesh.castShadow = true
    ventGroup.add(mesh)
  }

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.13, radius * 0.13, 0.028, 42), hubMaterial.clone())
  hub.position.set(center[0], center[1] - 0.018, center[2])
  hub.castShadow = true
  parent.add(hub)
}

function addInstancedSpheres(
  THREE: typeof import('three'),
  parent: import('three').Object3D,
  radius: number,
  positions: import('three').Vector3[],
  material: import('three').Material,
) {
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, 14, 8), material, positions.length)
  const matrix = new THREE.Matrix4()
  positions.forEach((position, index) => {
    matrix.makeTranslation(position.x, position.y, position.z)
    mesh.setMatrixAt(index, matrix)
  })
  mesh.instanceMatrix.needsUpdate = true
  mesh.castShadow = true
  parent.add(mesh)
  return mesh
}

function createReferenceCubeSat(
  THREE: typeof import('three'),
  thermal: ThermalTelemetry,
  sunlight: boolean,
  orbitMinutes: number,
): CubeSatModel {
  const root = new THREE.Group()
  root.name = 'scratch-texture-driven-cubesat'

  const boundsSize = new THREE.Vector3(1.72, 2.18, 1.86)
  const xHalf = boundsSize.x * 0.5
  const yHalf = boundsSize.y * 0.5
  const zHalf = boundsSize.z * 0.5
  const frontY = -yHalf - 0.014
  const backY = yHalf + 0.014
  const sideX = xHalf + 0.014

  const metalTexture = createMetalTexture(THREE)
  const frontTexture = createThermalTextureBinding(THREE, 'front', thermal, sunlight, orbitMinutes)
  const rightTexture = createThermalTextureBinding(THREE, 'right', thermal, sunlight, orbitMinutes)
  const leftTexture = createThermalTextureBinding(THREE, 'left', thermal, sunlight, orbitMinutes)
  const nadirTexture = createThermalTextureBinding(THREE, 'nadir', thermal, sunlight, orbitMinutes)
  const rearTexture = createThermalTextureBinding(THREE, 'rear', thermal, sunlight, orbitMinutes)
  const solarTexture = createThermalTextureBinding(THREE, 'solar', thermal, sunlight, orbitMinutes, 8, 7)
  const sideSolarTexture = createThermalTextureBinding(THREE, 'sideSolar', thermal, sunlight, orbitMinutes, 6, 8)
  const thermalTextures = [
    frontTexture,
    rightTexture,
    leftTexture,
    nadirTexture,
    rearTexture,
    solarTexture,
    sideSolarTexture,
  ].filter(Boolean) as ThermalTextureBinding[]

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x9ea8a7,
    metalness: 0.5,
    roughness: 0.42,
    map: metalTexture,
  })
  const frontMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.52,
    roughness: 0.34,
    map: frontTexture?.texture,
  })
  const rightMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.26,
    roughness: 0.44,
    map: rightTexture?.texture,
  })
  const leftMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.38,
    roughness: 0.4,
    map: leftTexture?.texture,
  })
  const nadirMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.36,
    roughness: 0.45,
    map: nadirTexture?.texture,
  })
  const rearMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.42,
    roughness: 0.48,
    map: rearTexture?.texture,
  })
  const solarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.42,
    map: solarTexture?.texture,
    emissive: 0x02072a,
    emissiveIntensity: sunlight ? 0.18 : 0.06,
  })
  const sideSolarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.46,
    map: sideSolarTexture?.texture,
    emissive: 0x02072a,
    emissiveIntensity: sunlight ? 0.16 : 0.05,
  })
  const railMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8dedc,
    metalness: 0.84,
    roughness: 0.2,
    map: metalTexture,
  })
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x030508,
    metalness: 0.56,
    roughness: 0.28,
  })
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd59b2d,
    metalness: 0.58,
    roughness: 0.28,
  })
  const servicePanelMaterial = new THREE.MeshStandardMaterial({
    color: 0xb7c4bd,
    metalness: 0.42,
    roughness: 0.36,
    map: metalTexture,
  })
  const cableMaterial = new THREE.MeshStandardMaterial({
    color: 0x172226,
    metalness: 0.62,
    roughness: 0.3,
  })
  const fanBladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x05080b,
    emissive: 0x020508,
    emissiveIntensity: 0.16,
    metalness: 0.34,
    roughness: 0.42,
    transparent: true,
    opacity: 0.86,
  })
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x7edce4,
    emissive: 0x0b8cb0,
    emissiveIntensity: sunlight ? 0.28 : 0.1,
    metalness: 0.05,
    roughness: 0.08,
    transparent: true,
    opacity: 0.78,
  })

  addBox(THREE, root, [boundsSize.x, boundsSize.y, boundsSize.z], [0, 0, 0], bodyMaterial, 0.03)

  root.add(createPlaneOnBasis(
    THREE,
    boundsSize.x * 0.96,
    boundsSize.z * 0.96,
    frontMaterial,
    new THREE.Vector3(0, frontY, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, -1, 0),
  ))
  root.add(createPlaneOnBasis(
    THREE,
    boundsSize.y * 0.94,
    boundsSize.z * 0.9,
    rightMaterial,
    new THREE.Vector3(sideX, 0, -0.02),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0),
  ))
  root.add(createPlaneOnBasis(
    THREE,
    boundsSize.y * 0.92,
    boundsSize.z * 0.9,
    leftMaterial,
    new THREE.Vector3(-xHalf - 0.012, 0, -0.02),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 0),
  ))
  root.add(createPlaneOnBasis(
    THREE,
    boundsSize.x * 0.92,
    boundsSize.y * 0.92,
    nadirMaterial,
    new THREE.Vector3(0, 0, -zHalf - 0.014),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, -1),
  ))
  root.add(createPlaneOnBasis(
    THREE,
    boundsSize.x * 0.96,
    boundsSize.z * 0.96,
    rearMaterial,
    new THREE.Vector3(0, backY, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 1, 0),
  ))

  for (const xSign of [-1, 1]) {
    for (const ySign of [-1, 1]) {
      addBox(THREE, root, [0.07, 0.07, boundsSize.z + 0.18], [xSign * (xHalf + 0.04), ySign * (yHalf + 0.035), 0], railMaterial, 0.08)
      addBox(THREE, root, [0.12, 0.12, 0.13], [xSign * (xHalf + 0.04), ySign * (yHalf + 0.035), zHalf + 0.08], railMaterial, 0.04)
      addBox(THREE, root, [0.09, 0.09, 0.08], [xSign * (xHalf + 0.04), ySign * (yHalf + 0.035), -zHalf - 0.06], railMaterial, 0.04)
    }
  }

  for (const zSign of [-1, 1]) {
    addBox(THREE, root, [boundsSize.x + 0.18, 0.052, 0.058], [0, -yHalf - 0.04, zSign * (zHalf + 0.03)], railMaterial, 0.05)
    addBox(THREE, root, [boundsSize.x + 0.18, 0.052, 0.058], [0, yHalf + 0.04, zSign * (zHalf + 0.03)], railMaterial, 0.05)
    addBox(THREE, root, [0.052, boundsSize.y + 0.18, 0.058], [-xHalf - 0.04, 0, zSign * (zHalf + 0.03)], railMaterial, 0.05)
    addBox(THREE, root, [0.052, boundsSize.y + 0.18, 0.058], [xHalf + 0.04, 0, zSign * (zHalf + 0.03)], railMaterial, 0.05)
  }

  const rearFeatureY = backY + 0.045
  ;[
    { size: [0.7, 0.036, 0.38] as [number, number, number], position: [-0.36, rearFeatureY, 0.34] as [number, number, number], material: servicePanelMaterial },
    { size: [0.46, 0.04, 0.28] as [number, number, number], position: [0.46, rearFeatureY, 0.26] as [number, number, number], material: servicePanelMaterial },
    { size: [0.34, 0.044, 0.24] as [number, number, number], position: [-0.46, rearFeatureY + 0.006, -0.42] as [number, number, number], material: goldMaterial },
    { size: [0.4, 0.04, 0.22] as [number, number, number], position: [0.42, rearFeatureY, -0.48] as [number, number, number], material: servicePanelMaterial },
  ].forEach(({ size, position, material }) => addBox(THREE, root, size, position, material, 0.035))

  for (const z of [-0.68, -0.35, -0.04, 0.29, 0.62]) {
    addBox(THREE, root, [boundsSize.x * 0.78, 0.02, 0.014], [0, rearFeatureY + 0.028, z], cableMaterial, 0.02)
  }
  for (const x of [-0.62, 0.02, 0.62]) {
    addBox(THREE, root, [0.014, 0.02, boundsSize.z * 0.66], [x, rearFeatureY + 0.03, -0.02], cableMaterial, 0.02)
  }
  for (const [x, z] of [[-0.12, -0.2], [0.12, -0.2], [0.63, -0.04], [-0.68, 0.03]] as Array<[number, number]>) {
    addFrontCylinder(THREE, root, 0.045, 0.035, [x, backY + 0.075, z], cableMaterial, 36)
  }

  const topPanels: Array<[number, number]> = [
    [-0.44, -0.56],
    [0.44, -0.56],
    [-0.44, 0.56],
    [0.44, 0.56],
  ]
  topPanels.forEach(([x, y]) => {
    const panel = createPlaneOnBasis(
      THREE,
      0.72,
      0.88,
      solarMaterial.clone(),
      new THREE.Vector3(x, y, zHalf + 0.075),
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    )
    root.add(panel)
    addBox(THREE, root, [0.79, 0.026, 0.046], [x, y - 0.455, zHalf + 0.095], railMaterial)
    addBox(THREE, root, [0.79, 0.026, 0.046], [x, y + 0.455, zHalf + 0.095], railMaterial)
    addBox(THREE, root, [0.026, 0.91, 0.046], [x - 0.405, y, zHalf + 0.095], railMaterial)
    addBox(THREE, root, [0.026, 0.91, 0.046], [x + 0.405, y, zHalf + 0.095], railMaterial)
  })
  addBox(THREE, root, [0.1, boundsSize.y + 0.28, 0.07], [0, 0, zHalf + 0.13], darkMaterial, 0.03)
  addBox(THREE, root, [0.18, 0.22, 0.12], [-0.18, -0.02, zHalf + 0.16], railMaterial, 0.04)
  addBox(THREE, root, [0.18, 0.22, 0.12], [0.18, 0.02, zHalf + 0.16], railMaterial, 0.04)

  const sidePanel = createPlaneOnBasis(
    THREE,
    boundsSize.y * 0.78,
    boundsSize.z * 0.76,
    sideSolarMaterial,
    new THREE.Vector3(sideX + 0.015, 0.02, 0.02),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(1, 0, 0),
  )
  root.add(sidePanel)
  addBox(THREE, root, [0.046, boundsSize.y * 0.86, 0.045], [sideX + 0.04, 0, zHalf * 0.52], railMaterial, 0.02)
  addBox(THREE, root, [0.046, boundsSize.y * 0.86, 0.045], [sideX + 0.04, 0, -zHalf * 0.52], railMaterial, 0.02)
  addBox(THREE, root, [0.046, 0.045, boundsSize.z * 0.82], [sideX + 0.04, -yHalf * 0.8, 0], railMaterial, 0.02)
  addBox(THREE, root, [0.046, 0.045, boundsSize.z * 0.82], [sideX + 0.04, yHalf * 0.8, 0], railMaterial, 0.02)
  addBox(THREE, root, [0.052, 0.34, 0.34], [sideX + 0.07, 0.45, 0.14], goldMaterial, 0.02)
  addBox(THREE, root, [0.052, 0.26, 0.24], [sideX + 0.075, -0.54, -0.34], goldMaterial, 0.02)

  const largeAperture = addFrontCylinder(THREE, root, 0.32, 0.08, [-0.38, frontY - 0.045, -0.44], darkMaterial, 96)
  const smallAperture = addFrontCylinder(THREE, root, 0.17, 0.075, [-0.42, frontY - 0.046, 0.26], darkMaterial, 80)
  largeAperture.material = darkMaterial.clone()
  smallAperture.material = darkMaterial.clone()
  addFrontTorus(THREE, root, 0.34, 0.018, [-0.38, frontY - 0.086, -0.44], railMaterial)
  addFrontTorus(THREE, root, 0.19, 0.014, [-0.42, frontY - 0.085, 0.26], railMaterial)
  addFrontTorus(THREE, root, 0.265, 0.006, [-0.38, frontY - 0.09, -0.44], railMaterial)
  addFrontFan(THREE, root, [-0.38, frontY - 0.108, -0.44], 0.25, fanBladeMaterial, railMaterial)

  addBox(THREE, root, [0.28, 0.08, 0.2], [0.04, frontY - 0.055, 0.42], glassMaterial, 0.03)
  addBox(THREE, root, [0.2, 0.08, 0.17], [0.32, frontY - 0.058, 0.16], railMaterial, 0.04)
  addFrontCylinder(THREE, root, 0.04, 0.045, [0.51, frontY - 0.062, -0.03], railMaterial, 32)

  const frontScrews: import('three').Vector3[] = []
  for (let column = 0; column <= 6; column += 1) {
    for (let row = 0; row <= 7; row += 1) {
      if ((column + row) % 2 !== 0) continue
      frontScrews.push(new THREE.Vector3(
        lerp(-xHalf * 0.83, xHalf * 0.83, column / 6),
        frontY - 0.072,
        lerp(-zHalf * 0.82, zHalf * 0.82, row / 7),
      ))
    }
  }
  addInstancedSpheres(THREE, root, 0.016, frontScrews, railMaterial)

  const contactDots: import('three').Vector3[] = []
  topPanels.forEach(([panelX, panelY]) => {
    for (let xIndex = 0; xIndex < 4; xIndex += 1) {
      for (let yIndex = 0; yIndex < 5; yIndex += 1) {
        contactDots.push(new THREE.Vector3(
          panelX + lerp(-0.27, 0.27, xIndex / 3),
          panelY + lerp(-0.34, 0.34, yIndex / 4),
          zHalf + 0.105,
        ))
      }
    }
  })
  for (let yIndex = 0; yIndex < 7; yIndex += 1) {
    for (let zIndex = 0; zIndex < 5; zIndex += 1) {
      contactDots.push(new THREE.Vector3(
        sideX + 0.075,
        lerp(-0.78, 0.78, yIndex / 6),
        lerp(-0.58, 0.58, zIndex / 4),
      ))
    }
  }
  addInstancedSpheres(THREE, root, 0.011, contactDots, goldMaterial)

  const anchorDefinitions: Record<ThermalAnchorKey, ThermalAnchorDefinition> = {
    xFace: {
      point: new THREE.Vector3(0.2, frontY - 0.108, 0.42),
      normal: new THREE.Vector3(0, -1, 0),
    },
    panel: {
      point: new THREE.Vector3(-0.44, -0.56, zHalf + 0.13),
      normal: new THREE.Vector3(0, 0, 1),
    },
    battery: {
      point: new THREE.Vector3(sideX + 0.075, 0.45, 0.14),
      normal: new THREE.Vector3(1, 0, 0),
    },
    radio: {
      point: new THREE.Vector3(sideX + 0.075, -0.54, -0.34),
      normal: new THREE.Vector3(1, 0, 0),
    },
    nadir: {
      point: new THREE.Vector3(-0.18, -0.02, -zHalf - 0.075),
      normal: new THREE.Vector3(0, 0, -1),
    },
  }

  return { anchorDefinitions, boundsSize, root, thermalTextures }
}

export default function CubeSatThermalViewer({
  sunlight,
  orbitMinutes,
  thermal,
  onAnchorUpdate,
  onReady,
}: CubeSatThermalViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [shouldMountScene, setShouldMountScene] = useState(false)
  const [sceneEpoch, setSceneEpoch] = useState(0)
  const [sceneStatus, setSceneStatus] = useState<CubeSatSceneStatus>('waiting')
  const sunlightRef = useRef(sunlight)
  const orbitMinutesRef = useRef(orbitMinutes)
  const thermalRef = useRef(thermal)
  const onAnchorUpdateRef = useRef(onAnchorUpdate)
  const onReadyRef = useRef(onReady)
  const runtimeRef = useRef<{
    primaryLight?: import('three').DirectionalLight
    fillLight?: import('three').HemisphereLight
    floor?: import('three').Mesh
  }>({})

  useEffect(() => {
    sunlightRef.current = sunlight
  }, [sunlight])

  useEffect(() => {
    orbitMinutesRef.current = orbitMinutes
  }, [orbitMinutes])

  useEffect(() => {
    thermalRef.current = thermal
  }, [thermal])

  useEffect(() => {
    onAnchorUpdateRef.current = onAnchorUpdate
  }, [onAnchorUpdate])

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const container = mountRef.current
    if (!container || shouldMountScene) return

    if (!('IntersectionObserver' in window)) {
      setSceneStatus('preparing')
      setShouldMountScene(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSceneStatus('preparing')
          setShouldMountScene(true)
          observer.disconnect()
        }
      },
      { rootMargin: '900px 0px' },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [shouldMountScene])

  useEffect(() => {
    if (!shouldMountScene) return

    const mount = mountRef.current
    if (!mount) return

    const container = mount
    let cancelled = false
    let cleanup = () => {}
    setSceneStatus('preparing')

    async function setupScene() {
      const THREE = await import('three')
      if (cancelled) return

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      })
      const isCompactViewport = window.matchMedia('(max-width: 700px)').matches
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactViewport ? 1.22 : 1.65))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.insertBefore(renderer.domElement, container.firstChild)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 100)
      camera.position.set(3.75, 2.55, 4.65)
      camera.lookAt(0, 0.16, 0.02)

      const modelRoot = new THREE.Group()
      modelRoot.position.y = 0.22
      scene.add(modelRoot)

      const fillLight = new THREE.HemisphereLight(0x9cecff, 0x171816, sunlightRef.current ? 1.26 : 0.68)
      const primaryLight = new THREE.DirectionalLight(sunlightRef.current ? 0xfff0c4 : 0x78a9ff, sunlightRef.current ? 3.45 : 1.15)
      primaryLight.position.set(5.4, 6.2, 4.6)
      primaryLight.castShadow = true
      primaryLight.shadow.mapSize.set(isCompactViewport ? 1024 : 2048, isCompactViewport ? 1024 : 2048)
      primaryLight.shadow.camera.near = 0.5
      primaryLight.shadow.camera.far = 24
      scene.add(new THREE.AmbientLight(0xffffff, 0.48), fillLight, primaryLight)

      const rimLight = new THREE.DirectionalLight(0x83e2ff, 1.0)
      rimLight.position.set(-4.4, 2.2, -3.8)
      scene.add(rimLight)

      const floorMaterial = new THREE.MeshBasicMaterial({
        color: sunlightRef.current ? 0xff7d45 : 0x3158ff,
        transparent: true,
        opacity: sunlightRef.current ? 0.1 : 0.075,
        depthWrite: false,
      })
      const floor = new THREE.Mesh(new THREE.CircleGeometry(3.15, 88), floorMaterial)
      floor.rotation.x = -Math.PI / 2
      floor.position.y = -1.08
      scene.add(floor)

      runtimeRef.current = { primaryLight, fillLight, floor }

      const cubeSat = createReferenceCubeSat(THREE, thermalRef.current, sunlightRef.current, orbitMinutesRef.current)
      cubeSat.root.rotation.set(-Math.PI / 2 + Math.PI * 0.012, 0, Math.PI * -0.01)
      modelRoot.scale.setScalar(0.84)
      modelRoot.add(cubeSat.root)
      container.dataset.modelAsset = 'Scratch texture-driven CubeSat thermal twin'
      setSceneStatus('loaded')
      onReadyRef.current?.()
      notifyCubesatReady()

      let lastThermalSignature = ''
      let lastAnchorSignature = ''

      const rotationState = {
        yaw: -0.54,
        pitchOffset: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
      }

      const updateLights = () => {
        primaryLight.intensity = sunlightRef.current ? 3.45 : 1.15
        primaryLight.color.set(sunlightRef.current ? 0xfff0c4 : 0x78a9ff)
        fillLight.intensity = sunlightRef.current ? 1.26 : 0.68
        floorMaterial.color.set(sunlightRef.current ? 0xff7d45 : 0x3158ff)
        floorMaterial.opacity = sunlightRef.current ? 0.1 : 0.075
      }

      const updateThermalTexturesIfNeeded = () => {
        const nextThermal = thermalRef.current
        const signature = [
          sunlightRef.current ? 1 : 0,
          orbitMinutesRef.current,
          nextThermal.xFace.toFixed(1),
          nextThermal.panel.toFixed(1),
          nextThermal.battery.toFixed(1),
          nextThermal.radio.toFixed(1),
          nextThermal.nadir.toFixed(1),
        ].join(':')

        if (signature === lastThermalSignature) return
        lastThermalSignature = signature
        redrawThermalTextures(cubeSat.thermalTextures, nextThermal, sunlightRef.current, orbitMinutesRef.current)
      }

      const emitAnchorPositions = () => {
        const sceneElement = container.closest('.cubesat-scene')
        if (!sceneElement) return

        modelRoot.updateWorldMatrix(true, true)
        cubeSat.root.updateWorldMatrix(true, true)
        camera.updateMatrixWorld()

        const sceneRect = sceneElement.getBoundingClientRect()
        const canvasRect = container.getBoundingClientRect()
        const next = {} as ThermalAnchorMap

        const cameraWorldPosition = new THREE.Vector3()
        camera.getWorldPosition(cameraWorldPosition)

        ;(Object.keys(cubeSat.anchorDefinitions) as ThermalAnchorKey[]).forEach((key) => {
          const definition = cubeSat.anchorDefinitions[key]
          const anchorWorld = definition.point.clone()
          cubeSat.root.localToWorld(anchorWorld)

          const normalWorldEnd = definition.point.clone().add(definition.normal)
          cubeSat.root.localToWorld(normalWorldEnd)
          const normalWorld = normalWorldEnd.sub(anchorWorld).normalize()
          const cameraDirection = cameraWorldPosition.clone().sub(anchorWorld).normalize()
          const facingCamera = normalWorld.dot(cameraDirection)

          const projected = anchorWorld.clone()
          projected.project(camera)

          const canvasX = (projected.x * 0.5 + 0.5) * canvasRect.width
          const canvasY = (-projected.y * 0.5 + 0.5) * canvasRect.height
          next[key] = {
            x: clamp(((canvasRect.left - sceneRect.left + canvasX) / sceneRect.width) * 100, -8, 108),
            y: clamp(((canvasRect.top - sceneRect.top + canvasY) / sceneRect.height) * 100, -8, 108),
            visible: projected.z > -1 && projected.z < 1 && facingCamera > -0.18,
          }
        })

        const signature = Object.values(next)
          .map((point) => `${Math.round(point.x)}:${Math.round(point.y)}:${point.visible ? 1 : 0}`)
          .join('|')
        if (signature !== lastAnchorSignature) {
          lastAnchorSignature = signature
          onAnchorUpdateRef.current(next)
        }
      }

      const onPointerDown = (event: PointerEvent) => {
        rotationState.dragging = true
        rotationState.lastX = event.clientX
        rotationState.lastY = event.clientY
        container.classList.add('is-dragging')
        container.setPointerCapture(event.pointerId)
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!rotationState.dragging) return

        const deltaX = event.clientX - rotationState.lastX
        const deltaY = event.clientY - rotationState.lastY
        rotationState.lastX = event.clientX
        rotationState.lastY = event.clientY
        rotationState.yaw += deltaX * 0.0068
        rotationState.pitchOffset = clamp(rotationState.pitchOffset + deltaY * 0.0048, -0.5, 0.48)
      }

      const endPointerDrag = (event: PointerEvent) => {
        rotationState.dragging = false
        container.classList.remove('is-dragging')
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId)
        }
      }

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', endPointerDrag)
      container.addEventListener('pointercancel', endPointerDrag)

      const resizeObserver = new ResizeObserver(() => setRendererSize(renderer, camera, container))
      resizeObserver.observe(container)
      setRendererSize(renderer, camera, container)

      let sceneVisible = true
      let contextAvailable = true
      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          sceneVisible = entry.isIntersecting
          if (sceneVisible) {
            requestFrame()
          } else if (frame) {
            window.cancelAnimationFrame(frame)
            frame = 0
          }
        },
        { rootMargin: '480px 0px' },
      )
      visibilityObserver.observe(container)

      let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
        reduceMotion = event.matches
      }
      reducedMotionQuery.addEventListener('change', onMotionPreferenceChange)

      let frame = 0
      const requestFrame = () => {
        if (!cancelled && contextAvailable && sceneVisible && frame === 0) {
          frame = window.requestAnimationFrame(animate)
        }
      }
      const animate = (time: number) => {
        if (cancelled) return
        frame = 0
        if (!contextAvailable || !sceneVisible) return

        const seconds = time / 1000
        if (!rotationState.dragging && !reduceMotion) {
          rotationState.yaw += 0.0029333
        }

        const orbitOffset = (orbitMinutesRef.current / 90) * Math.PI * 2
        modelRoot.rotation.x = -0.015 + Math.sin(orbitOffset) * 0.02 + rotationState.pitchOffset
        modelRoot.rotation.y = rotationState.yaw
        modelRoot.rotation.z = Math.sin(seconds * 0.2) * 0.006
        floor.rotation.z = seconds * 0.04

        updateLights()
        updateThermalTexturesIfNeeded()
        emitAnchorPositions()
        renderer.render(scene, camera)
        requestFrame()
      }
      requestFrame()

      const handleContextLost = (event: Event) => {
        event.preventDefault()
        contextAvailable = false
        if (frame) {
          window.cancelAnimationFrame(frame)
          frame = 0
        }
        setSceneStatus('recovering')
      }

      const handleContextRestored = () => {
        if (cancelled) return
        setSceneStatus('preparing')
        setSceneEpoch((epoch) => epoch + 1)
      }

      renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored)

      cleanup = () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        visibilityObserver.disconnect()
        resizeObserver.disconnect()
        reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange)
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endPointerDrag)
        container.removeEventListener('pointercancel', endPointerDrag)
        container.classList.remove('is-dragging')
        runtimeRef.current = {}
        disposeObjectResources(scene)
        renderer.dispose()
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    setupScene().catch(() => {
      if (cancelled) return
      setSceneStatus('model-error')
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [shouldMountScene, sceneEpoch])

  const sceneStatusClass = sceneStatus === 'waiting' ? '' : `is-${sceneStatus}`

  return (
    <div
      className={`cubesat-model-viewer cubesat-thermal-viewer ${sunlight ? 'is-sunlit' : 'is-eclipse'} ${sceneStatusClass}`}
      ref={mountRef}
      aria-label="Interactive 3D CubeSat thermal model. Drag to rotate."
    >
      <div className="model-loading">
        <span>Preparing 3D viewport</span>
        <small>Thermal model warming up</small>
      </div>
      <div className="model-error">CubeSat model could not be loaded.</div>
    </div>
  )
}
