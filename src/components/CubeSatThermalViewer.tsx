import { useEffect, useRef, useState } from 'react'

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
}

type ThermalSurfaceKind = 'front' | 'right' | 'left' | 'nadir'

type ThermalTextureBinding = {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  kind: ThermalSurfaceKind
  texture: import('three').CanvasTexture
}

type CubeSatModel = {
  anchorLocalPoints: Record<ThermalAnchorKey, import('three').Vector3>
  boundsSize: import('three').Vector3
  root: import('three').Group
  thermalTextures: ThermalTextureBinding[]
}

const thermalStops = [
  { value: -40, color: [45, 77, 255] },
  { value: -20, color: [20, 124, 255] },
  { value: 0, color: [53, 217, 223] },
  { value: 20, color: [129, 223, 105] },
  { value: 40, color: [255, 215, 71] },
  { value: 60, color: [255, 148, 40] },
  { value: 80, color: [240, 68, 50] },
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
) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const context = canvas.getContext('2d')
  if (!context) return undefined
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  const binding: ThermalTextureBinding = { canvas, context, kind, texture }
  redrawThermalTexture(binding, thermal, sunlight, orbitMinutes)
  return binding
}

function createSolarPanelTexture(THREE: typeof import('three'), columns = 10, rows = 7) {
  return createCanvasTexture(THREE, 1024, 1024, (context, canvas) => {
    const width = canvas.width
    const height = canvas.height
    context.fillStyle = '#00021f'
    context.fillRect(0, 0, width, height)

    const sheen = context.createLinearGradient(0, 0, width, height)
    sheen.addColorStop(0, 'rgba(45, 68, 148, 0.09)')
    sheen.addColorStop(0.34, 'rgba(4, 13, 62, 0.02)')
    sheen.addColorStop(0.74, 'rgba(0, 0, 0, 0.72)')
    context.fillStyle = sheen
    context.fillRect(0, 0, width, height)

    for (let x = 0; x < width; x += 4) {
      const alpha = 0.022 + seededNoise(x, 19, 2) * 0.035
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`
      context.fillRect(x, 0, 1, height)
    }

    context.strokeStyle = 'rgba(228, 174, 50, 0.62)'
    context.lineWidth = 1.3
    for (let column = 0; column <= columns; column += 1) {
      const x = (column / columns) * width
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }
    for (let row = 0; row <= rows; row += 1) {
      const y = (row / rows) * height
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }

    context.fillStyle = 'rgba(238, 185, 68, 0.82)'
    for (let column = 0; column <= columns; column += 1) {
      for (let row = 0; row <= rows; row += 1) {
        const x = (column / columns) * width
        const y = (row / rows) * height
        context.beginPath()
        context.arc(x, y, 4.2, 0, Math.PI * 2)
        context.fill()
      }
    }
  })
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
  const orbitWave = Math.sin((orbitMinutes / 90) * Math.PI * 2 + u * 2.4 - v * 1.2) * (sunlight ? 2.4 : 1.2)
  const bottom = 1 - v

  if (kind === 'front') {
    const hotBand = gaussian(u, 0.68, 0.17) * (sunlight ? 47 : 18)
    const coolLeft = lerp(-13, 8, smoothstep(0.05, 0.55, u))
    const lowerCooling = bottom > 0.66 ? lerp(0, -15, smoothstep(0.66, 1, bottom)) : 0
    const upperWarmth = smoothstep(0.18, 0.72, v) * 6
    return thermal.nadir + 18 + coolLeft + hotBand + lowerCooling + upperWarmth + orbitWave
  }

  if (kind === 'right') {
    const hotLeadingEdge = gaussian(u, 0.12, 0.2) * (sunlight ? 26 : 10)
    const coolRear = lerp(10, -12, smoothstep(0.28, 1, u))
    const nadirWash = smoothstep(0.68, 1, bottom) * -18
    return thermal.battery + coolRear + hotLeadingEdge + nadirWash + orbitWave * 0.7
  }

  if (kind === 'left') {
    return lerp(thermal.nadir + 8, thermal.panel - 10, v) + gaussian(u, 0.8, 0.28) * 10 + orbitWave
  }

  return thermal.nadir - 2 + (1 - u) * 6 + orbitWave * 0.35
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
      const color = temperatureRgb(temperature)
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
    context.globalAlpha = 0.74
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
  } else if (kind === 'front') {
    drawPanelSeams(context, width, height, 6, 7)
    drawSurfaceWear(context, width, height, 5)
    drawSurfaceScrews(context, width, height, 6, 7)
  } else if (kind === 'left') {
    drawPanelSeams(context, width, height, 4, 6)
    drawSurfaceWear(context, width, height, 8)
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
  const sideX = xHalf + 0.014

  const metalTexture = createMetalTexture(THREE)
  const solarTexture = createSolarPanelTexture(THREE, 8, 7)
  const sideSolarTexture = createSolarPanelTexture(THREE, 6, 8)
  const frontTexture = createThermalTextureBinding(THREE, 'front', thermal, sunlight, orbitMinutes)
  const rightTexture = createThermalTextureBinding(THREE, 'right', thermal, sunlight, orbitMinutes)
  const leftTexture = createThermalTextureBinding(THREE, 'left', thermal, sunlight, orbitMinutes)
  const nadirTexture = createThermalTextureBinding(THREE, 'nadir', thermal, sunlight, orbitMinutes)
  const thermalTextures = [frontTexture, rightTexture, leftTexture, nadirTexture].filter(Boolean) as ThermalTextureBinding[]

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
  const solarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.42,
    map: solarTexture,
    emissive: 0x02072a,
    emissiveIntensity: sunlight ? 0.12 : 0.04,
  })
  const sideSolarMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08,
    roughness: 0.46,
    map: sideSolarTexture,
    emissive: 0x02072a,
    emissiveIntensity: sunlight ? 0.1 : 0.035,
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

  const anchorLocalPoints: Record<ThermalAnchorKey, import('three').Vector3> = {
    xFace: new THREE.Vector3(0.18, frontY - 0.12, 0.56),
    panel: new THREE.Vector3(-0.44, -0.58, zHalf + 0.13),
    battery: new THREE.Vector3(sideX + 0.1, 0.54, 0.16),
    radio: new THREE.Vector3(sideX + 0.1, -0.48, -0.24),
    nadir: new THREE.Vector3(-0.22, -0.2, -zHalf - 0.08),
  }

  return { anchorLocalPoints, boundsSize, root, thermalTextures }
}

export default function CubeSatThermalViewer({
  sunlight,
  orbitMinutes,
  thermal,
  onAnchorUpdate,
}: CubeSatThermalViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [shouldMountScene, setShouldMountScene] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#cubesat-thermal',
  )
  const sunlightRef = useRef(sunlight)
  const orbitMinutesRef = useRef(orbitMinutes)
  const thermalRef = useRef(thermal)
  const onAnchorUpdateRef = useRef(onAnchorUpdate)
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
    const container = mountRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldMountScene(true)
        observer.disconnect()
      },
      { rootMargin: '520px 0px' },
    )
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldMountScene) return

    const mount = mountRef.current
    if (!mount) return

    const container = mount
    let cancelled = false
    let cleanup = () => {}

    async function setupScene() {
      const THREE = await import('three')
      if (cancelled) return

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
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

      const fillLight = new THREE.HemisphereLight(0x9cecff, 0x171816, sunlightRef.current ? 1.45 : 0.76)
      const primaryLight = new THREE.DirectionalLight(sunlightRef.current ? 0xfff0c4 : 0x78a9ff, sunlightRef.current ? 3.85 : 1.25)
      primaryLight.position.set(5.4, 6.2, 4.6)
      primaryLight.castShadow = true
      primaryLight.shadow.mapSize.set(2048, 2048)
      primaryLight.shadow.camera.near = 0.5
      primaryLight.shadow.camera.far = 24
      scene.add(new THREE.AmbientLight(0xffffff, 0.58), fillLight, primaryLight)

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
      container.classList.add('is-loaded')

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
        primaryLight.intensity = sunlightRef.current ? 3.85 : 1.25
        primaryLight.color.set(sunlightRef.current ? 0xfff0c4 : 0x78a9ff)
        fillLight.intensity = sunlightRef.current ? 1.45 : 0.76
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

        ;(Object.keys(cubeSat.anchorLocalPoints) as ThermalAnchorKey[]).forEach((key) => {
          const projected = cubeSat.anchorLocalPoints[key].clone()
          cubeSat.root.localToWorld(projected)
          projected.project(camera)

          const canvasX = (projected.x * 0.5 + 0.5) * canvasRect.width
          const canvasY = (-projected.y * 0.5 + 0.5) * canvasRect.height
          next[key] = {
            x: clamp(((canvasRect.left - sceneRect.left + canvasX) / sceneRect.width) * 100, -8, 108),
            y: clamp(((canvasRect.top - sceneRect.top + canvasY) / sceneRect.height) * 100, -8, 108),
            visible: projected.z > -1 && projected.z < 1,
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

      let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
        reduceMotion = event.matches
      }
      reducedMotionQuery.addEventListener('change', onMotionPreferenceChange)

      let frame = 0
      const animate = (time: number) => {
        if (cancelled) return
        frame = window.requestAnimationFrame(animate)

        const seconds = time / 1000
        if (!rotationState.dragging && !reduceMotion) {
          rotationState.yaw += 0.0058665
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
      }
      frame = window.requestAnimationFrame(animate)

      cleanup = () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        resizeObserver.disconnect()
        reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endPointerDrag)
        container.removeEventListener('pointercancel', endPointerDrag)
        container.classList.remove('is-loaded', 'is-model-error', 'is-dragging')
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
      container.classList.add('is-model-error')
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [shouldMountScene])

  return (
    <div
      className={`cubesat-model-viewer cubesat-thermal-viewer ${sunlight ? 'is-sunlit' : 'is-eclipse'}`}
      ref={mountRef}
      aria-label="Interactive 3D CubeSat thermal model. Drag to rotate."
    >
      <div className="model-loading">Loading high-fidelity CubeSat</div>
      <div className="model-error">CubeSat model could not be loaded.</div>
    </div>
  )
}
