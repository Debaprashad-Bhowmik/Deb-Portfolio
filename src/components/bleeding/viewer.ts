import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildAssembly } from './assembly'
import { parts, views, type PartId, type Telemetry, type ViewId } from './parts'

type Selection = { view: ViewId; part: PartId | null }

const defaultCenter = new THREE.Vector3(0, 1.04, -0.07)
const defaultDirection = new THREE.Vector3(2.8, 5.7, 12).normalize()
const overviewSpan = 12.5
const activeLedByStatus: Record<string, number> = {
  'Needs More Pressure': 0,
  'Bleeding Controlled': 1,
  'Maintain Pressure': 2,
  'Ease Pressure': 2,
}

function makeDisplay() {
  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 360
  const context = canvas.getContext('2d')!
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  const history: Telemetry[] = []

  function draw(readings: Telemetry | null) {
    if (readings) {
      history.push(readings)
      if (history.length > 40) history.shift()
    }
    context.fillStyle = '#f4f6f7'
    context.fillRect(0, 0, 640, 360)
    context.fillStyle = '#223049'
    context.fillRect(0, 0, 640, 48)
    context.fillStyle = '#fff'
    context.font = '600 20px system-ui'
    context.fillText('Bleeding control simulator', 22, 31)
    context.font = '14px system-ui'
    context.fillText('Web demo', 552, 30)

    const charts = [
      { title: 'Applied pressure', unit: 'mmHg', key: 'pressure' as const, max: 180, color: '#35689f', y: 75 },
      { title: 'Flow rate', unit: 'mL/min', key: 'flow' as const, max: 180, color: '#9c354b', y: 208 },
    ]
    for (const { title, unit, key, max, color, y } of charts) {
      context.fillStyle = '#ffffff'
      context.fillRect(18, y, 604, 116)
      context.fillStyle = '#24384b'
      context.font = '600 16px system-ui'
      context.fillText(title, 32, y + 23)
      if (readings) {
        context.fillStyle = color
        context.fillText(`${readings[key]} ${unit}`, 475, y + 23)
      }
      context.strokeStyle = '#e0e6ea'
      context.lineWidth = 1
      for (let row = 0; row < 4; row++) {
        context.beginPath()
        context.moveTo(32, y + 38 + 20 * row)
        context.lineTo(600, y + 38 + 20 * row)
        context.stroke()
      }
      if (history.length) {
        context.strokeStyle = color
        context.lineWidth = 3
        context.beginPath()
        context.moveTo(32, y + 98 - Math.min(history[0][key] / max, 1) * 60)
        history.forEach((sample, i) => {
          context.lineTo(32 + (i + 1) / history.length * 565, y + 98 - Math.min(sample[key] / max, 1) * 60)
        })
        context.stroke()
      }
    }
    texture.needsUpdate = true
  }

  draw(null)
  return { texture, draw }
}

export function mountBleedingViewer(
  host: HTMLDivElement,
  onPick: (part: PartId) => void,
  onUnavailable: () => void,
) {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.19
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#f1ece3')
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 70)
  camera.position.copy(defaultCenter).addScaledVector(defaultDirection, 17)
  const canvas = renderer.domElement
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', '3D simulator. Use the arrow keys to rotate the model.')
  host.appendChild(canvas)
  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(defaultCenter)
  controls.enableZoom = false
  controls.enablePan = false
  controls.enableDamping = !motion.matches
  controls.dampingFactor = 0.12
  controls.minPolarAngle = 0.19
  controls.maxPolarAngle = Math.PI / 2 - 0.05
  canvas.style.touchAction = 'pan-y'
  controls.update()

  const fill = new THREE.HemisphereLight('#f9f5ee', '#b0a6a1', 2.12)
  const key = new THREE.DirectionalLight('#fff6e8', 2.25)
  key.position.set(-4.7, 9.5, 6.6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -8
  key.shadow.camera.right = 8
  key.shadow.camera.top = 6
  key.shadow.camera.bottom = -6
  key.shadow.normalBias = 0.036
  key.shadow.bias = -0.00015
  key.shadow.radius = 3
  const rim = new THREE.DirectionalLight('#d5e5ee', 0.94)
  rim.position.set(3.5, 6.2, -5.3)
  scene.add(fill, key, rim)

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.ShadowMaterial({ opacity: 0.20 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.08
  floor.receiveShadow = true
  scene.add(floor)

  const display = makeDisplay()
  const assembly = buildAssembly(display.texture)
  scene.add(assembly.root)

  const originals = new Map<THREE.Mesh, THREE.Material>()
  const dimmed = new Map<THREE.Material, THREE.Material>()
  const partMeshes: THREE.Mesh[] = []
  for (const [id, group] of Object.entries(assembly.groups)) {
    group.traverse(object => {
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return
      const source = object.material
      originals.set(object, source)
      object.userData.part = id
      partMeshes.push(object)
      if (!dimmed.has(source)) {
        const clone = source.clone()
        clone.transparent = true
        clone.opacity = source.opacity * 0.16
        clone.depthWrite = false
        dimmed.set(source, clone)
      }
    })
  }

  const tracerGeometry = new THREE.SphereGeometry(0.064, 10, 8)
  function makeTracers(paths: THREE.CatmullRomCurve3[], color: string, count: number) {
    const material = new THREE.MeshBasicMaterial({ color, toneMapped: false })
    return paths.map(path => ({
      path,
      markers: Array.from({ length: count }, () => {
        const marker = new THREE.Mesh(tracerGeometry, material)
        marker.visible = false
        scene.add(marker)
        return marker
      }),
    }))
  }
  const fluidMarkers = makeTracers(assembly.fluidPaths, '#ed9da3', 8)
  const signalMarkers = makeTracers(assembly.signalPaths, '#6ce8d8', 2)

  let current: Selection = { view: 'overview', part: null }
  let telemetry: Telemetry | null = null
  let viewportWidth = 1
  let viewportHeight = 1
  let span = overviewSpan
  let rotationFrame: number | null = null
  let isVisible = false
  let lostContext = false
  let transition: { center: THREE.Vector3; direction: THREE.Vector3; span: number } | null = null
  const cameraOffset = new THREE.Spherical()
  const clickRay = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let pointerStart: { x: number; y: number; id: number } | null = null

  function frameCamera() {
    const ratio = viewportWidth / viewportHeight
    const height = span / Math.min(1.83, ratio)
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.left = -height * ratio / 2
    camera.right = height * ratio / 2
    camera.updateProjectionMatrix()
  }

  function schedule() {
    if (rotationFrame === null && isVisible && !lostContext) {
      rotationFrame = window.requestAnimationFrame(draw)
    }
  }

  function draw(time: number) {
    rotationFrame = null
    if (!isVisible || lostContext) return
    if (transition) {
      const fraction = motion.matches ? 1 : 0.17
      controls.target.lerp(transition.center, fraction)
      const destination = transition.center.clone().addScaledVector(transition.direction, 17)
      camera.position.lerp(destination, fraction)
      span += (transition.span - span) * fraction
      if (controls.target.distanceToSquared(transition.center) < 0.00006 && camera.position.distanceToSquared(destination) < 0.0001 && Math.abs(span - transition.span) < 0.01) {
        controls.target.copy(transition.center)
        camera.position.copy(destination)
        span = transition.span
        transition = null
      }
      frameCamera()
    }
    controls.update()

    const showFluid = current.view === 'fluid' && (telemetry?.flow ?? 0) > 0
    const showSignal = current.view === 'sensors' || current.view === 'feedback'
    const phase = motion.matches ? 0.15 : time * 0.001
    for (const [tracks, active, speed] of [
      [fluidMarkers, showFluid, 0.13 + Math.min(telemetry?.flow ?? 0, 180) * 0.0022],
      [signalMarkers, showSignal, 0.7],
    ] as const) {
      tracks.forEach(({ path, markers }, i) => {
        markers.forEach((marker, index) => {
          marker.visible = active
          if (active) path.getPointAt((phase * speed + index / markers.length + i * 0.12) % 1, marker.position)
        })
      })
    }
    renderer.render(scene, camera)
    if (transition || (!motion.matches && (showFluid || showSignal))) schedule()
  }

  const resize = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
    if (width <= 0 || height <= 0) return
    viewportWidth = width
    viewportHeight = height
    renderer.setSize(width, height, false)
    frameCamera()
    schedule()
  })
  resize.observe(host)
  const intersection = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting
    schedule()
  }, { rootMargin: '24px' })
  intersection.observe(host)

  function select(selection: Selection) {
    current = selection
    const activeParts = selection.part ? [selection.part] : views[selection.view].parts
    if (selection.part === 'pads') activeParts.push('arm')
    for (const object of partMeshes) {
      const id = object.userData.part as PartId
      const source = originals.get(object)!
      object.material = activeParts.includes(id) ? source : dimmed.get(source)!
    }
    assembly.fluidLines.visible = selection.view !== 'feedback'
    assembly.signalLines.visible = selection.view !== 'fluid'
    const info = selection.part ? parts[selection.part] : null
    const target = info ? new THREE.Vector3(...info.center) : defaultCenter
    const direction = selection.part === 'pads'
      ? new THREE.Vector3(1.2, 10, 12).normalize()
      : defaultDirection
    transition = { center: target, direction, span: info?.span ?? overviewSpan }
    schedule()
  }

  function setTelemetry(next: Telemetry | null) {
    telemetry = next
    display.draw(telemetry)
    const ledIndex = activeLedByStatus[next?.status ?? '']
    assembly.leds.forEach((light, index) => {
      light.emissiveIntensity = index === ledIndex ? 0.85 : 0.08
    })
    schedule()
  }

  function zoom(scale: number) {
    const target = transition?.center ?? controls.target.clone()
    const direction = transition?.direction ?? camera.position.clone().sub(controls.target).normalize()
    transition = { center: target, direction, span: THREE.MathUtils.clamp((transition?.span ?? span) * scale, 1.9, 17.5) }
    schedule()
  }

  function pointerDown(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) return
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId }
  }

  function pointerUp(event: PointerEvent) {
    const start = pointerStart
    pointerStart = null
    if (!start || event.pointerId !== start.id || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return
    const rect = canvas.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    clickRay.setFromCamera(pointer, camera)
    const hit = clickRay.intersectObjects(partMeshes, false)[0]
    if (hit) onPick(hit.object.userData.part as PartId)
  }

  function cancelFocus() {
    transition = null
  }

  function keyboard(event: KeyboardEvent) {
    const step = 0.15
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step],
    }
    const direction = directions[event.key]
    if (!direction) return
    event.preventDefault()
    cancelFocus()
    cameraOffset.setFromVector3(camera.position.clone().sub(controls.target))
    cameraOffset.theta += direction[0]
    cameraOffset.phi = THREE.MathUtils.clamp(cameraOffset.phi + direction[1], controls.minPolarAngle, controls.maxPolarAngle)
    camera.position.setFromSpherical(cameraOffset).add(controls.target)
    controls.update()
    schedule()
  }

  function contextLost(event: Event) {
    event.preventDefault()
    lostContext = true
    onUnavailable()
  }

  function motionChanged() {
    controls.enableDamping = !motion.matches
    schedule()
  }

  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('keydown', keyboard)
  canvas.addEventListener('webglcontextlost', contextLost)
  controls.addEventListener('change', schedule)
  controls.addEventListener('start', cancelFocus)
  motion.addEventListener('change', motionChanged)

  function dispose() {
    lostContext = true
    if (rotationFrame !== null) window.cancelAnimationFrame(rotationFrame)
    intersection.disconnect()
    resize.disconnect()
    motion.removeEventListener('change', motionChanged)
    controls.dispose()
    canvas.remove()
    const materials = new Set(dimmed.values())
    const geometries = new Set<THREE.BufferGeometry>()
    for (const material of originals.values()) materials.add(material)
    scene.traverse(object => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return
      if (object instanceof THREE.InstancedMesh) object.dispose()
      geometries.add(object.geometry)
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
      for (const material of sourceMaterials) materials.add(material)
    })
    for (const geometry of geometries) geometry.dispose()
    for (const material of materials) material.dispose()
    display.texture.dispose()
    key.shadow.dispose()
    renderer.dispose()
  }

  return { select, setTelemetry, zoom, dispose }
}
