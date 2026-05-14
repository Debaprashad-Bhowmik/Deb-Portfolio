import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { RotateCcw } from 'lucide-react'
import type { Material, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three'
import type { HvacOption } from '../data/portfolio'
import { notifyHvacReady } from '../sceneReadiness'

type GmpHvacModelProps = {
  activeOption: HvacOption['id']
}

type CalloutKey = 'hepa' | 'supply' | 'return' | 'pressure'

type AnchorPosition = {
  x: number
  y: number
  visible: boolean
}

type FlowBinding = {
  material: MeshBasicMaterial
  baseOpacity: number
  pathIndex: number
}

type FlowParticle = {
  mesh: Mesh
  points: Vector3[]
  segmentLengths: number[]
  totalLength: number
  material: MeshBasicMaterial
  offset: number
  pathIndex: number
  speed: number
}

type FlowPoint = [number, number, number]

type OrthogonalFlowPath = {
  id: string
  pathIndex: number
  points: FlowPoint[]
  laneOffsets: number[]
  particleCount: number
  cornerRadius: number
}

type ZoneBinding = {
  material: MeshBasicMaterial
  baseOpacity: number
  zoneIndex: number
}

type RuntimeControls = {
  resetView: () => void
}

const defaultAnchors: Record<CalloutKey, AnchorPosition> = {
  hepa: { x: 32, y: 18, visible: true },
  supply: { x: 78, y: 27, visible: true },
  return: { x: 13, y: 51, visible: true },
  pressure: { x: 73, y: 74, visible: true },
}

const calloutCopy: Record<CalloutKey, { title: string; detail: string }> = {
  hepa: { title: 'HEPA FILTER UNIT', detail: 'H14 Efficiency' },
  supply: { title: 'SUPPLY AIR', detail: 'ISO Class 7 (Grade C)' },
  return: { title: 'RETURN AIR', detail: 'Low particle recirculation' },
  pressure: { title: 'PRESSURIZED ZONES', detail: 'Positive pressure cascade' },
}

const optionVisuals = {
  dedicated: {
    pathStrength: [1, 1, 1, 0.92, 0.88],
    zoneStrength: [1, 0.92, 0.86, 0.8],
    particleSpeed: 1,
    fanSpeed: 1,
  },
  modify: {
    pathStrength: [0.74, 0.78, 0.66, 0.54, 0.46],
    zoneStrength: [0.7, 0.58, 0.46, 0.36],
    particleSpeed: 0.72,
    fanSpeed: 0.74,
  },
  enhance: {
    pathStrength: [0.46, 0.34, 0.28, 0.18, 0.18],
    zoneStrength: [0.42, 0.26, 0.18, 0.12],
    particleSpeed: 0.5,
    fanSpeed: 0.52,
  },
}

function getOptionVisuals(activeOption: HvacOption['id']) {
  if (activeOption === 'modify') return optionVisuals.modify
  if (activeOption === 'enhance') return optionVisuals.enhance
  return optionVisuals.dedicated
}

function disposeMaterial(material: Material | Material[]) {
  if (Array.isArray(material)) {
    material.forEach((entry) => entry.dispose())
    return
  }

  material.dispose()
}

function disposeObjectResources(object: Object3D) {
  const disposable = object as Object3D & {
    geometry?: { dispose: () => void }
    material?: Material | Material[]
  }

  disposable.geometry?.dispose()
  if (disposable.material) disposeMaterial(disposable.material)
}

function formatCalloutStyle(position: AnchorPosition): CSSProperties {
  return {
    '--callout-left': `${position.x}%`,
    '--callout-top': `${position.y}%`,
    opacity: position.visible ? 1 : 0.32,
  } as CSSProperties
}

export default function GmpHvacModel({ activeOption }: GmpHvacModelProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const activeOptionRef = useRef(activeOption)
  const runtimeRef = useRef<RuntimeControls | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [activeCallout, setActiveCallout] = useState<CalloutKey>('hepa')
  const [anchors, setAnchors] = useState<Record<CalloutKey, AnchorPosition>>(defaultAnchors)

  useEffect(() => {
    activeOptionRef.current = activeOption
  }, [activeOption])

  const [shouldMount] = useState(true)

  useEffect(() => {
    const containerElement = mountRef.current
    if (!containerElement) return
    const container: HTMLDivElement = containerElement

    let cancelled = false
    let cleanup = () => {}
    let sceneVisible = true

    async function setupScene() {
      const THREE = await import('three')
      if (cancelled) return

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.04
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFShadowMap
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      scene.fog = new THREE.Fog(0xe7ebef, 18, 38)

      const root = new THREE.Group()
      scene.add(root)

      const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, -90, 90)
      camera.position.set(9.8, 10.2, 8.8)
      camera.lookAt(0, 0.62, -0.15)

      scene.add(new THREE.HemisphereLight(0xffffff, 0xaab4bd, 2.85))

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.6)
      keyLight.position.set(4.6, 9.2, 5.4)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.set(2048, 2048)
      keyLight.shadow.camera.near = 1
      keyLight.shadow.camera.far = 28
      keyLight.shadow.camera.left = -12
      keyLight.shadow.camera.right = 12
      keyLight.shadow.camera.top = 12
      keyLight.shadow.camera.bottom = -12
      scene.add(keyLight)

      const coolRim = new THREE.DirectionalLight(0x9edfff, 1.4)
      coolRim.position.set(-6, 4.5, -3)
      scene.add(coolRim)

      const flowLight = new THREE.PointLight(0x42d8ff, 2.7, 16)
      flowLight.position.set(1.4, 2.2, -0.8)
      scene.add(flowLight)

      function createMaterials() {
        return {
          base: new THREE.MeshStandardMaterial({ color: 0xd9e0e7, roughness: 0.72, metalness: 0.04 }),
          floor: new THREE.MeshStandardMaterial({ color: 0xe8edf2, roughness: 0.76, metalness: 0.02 }),
          floorBand: new THREE.MeshStandardMaterial({ color: 0xcbd4dc, roughness: 0.64, metalness: 0.06 }),
          wall: new THREE.MeshStandardMaterial({ color: 0xe7ecef, roughness: 0.6, metalness: 0.02 }),
          wallFace: new THREE.MeshStandardMaterial({ color: 0xf5f7f9, roughness: 0.56, metalness: 0.02 }),
          wallCap: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.44, metalness: 0.02 }),
          seam: new THREE.MeshBasicMaterial({ color: 0x9ca9b4, transparent: true, opacity: 0.24 }),
          equipment: new THREE.MeshStandardMaterial({ color: 0xe4eaf0, roughness: 0.5, metalness: 0.14 }),
          equipmentLight: new THREE.MeshStandardMaterial({ color: 0xf8fbfd, roughness: 0.42, metalness: 0.06 }),
          equipmentDark: new THREE.MeshStandardMaterial({ color: 0x242f38, roughness: 0.5, metalness: 0.34 }),
          black: new THREE.MeshStandardMaterial({ color: 0x111920, roughness: 0.44, metalness: 0.38 }),
          metal: new THREE.MeshStandardMaterial({ color: 0xaeb9c2, roughness: 0.28, metalness: 0.68 }),
          pipe: new THREE.MeshStandardMaterial({ color: 0x9db2bf, roughness: 0.24, metalness: 0.72 }),
          pipeDark: new THREE.MeshStandardMaterial({ color: 0x435663, roughness: 0.28, metalness: 0.64 }),
          bluePanel: new THREE.MeshStandardMaterial({
            color: 0x27a8df,
            roughness: 0.36,
            metalness: 0.16,
            emissive: 0x0c5273,
            emissiveIntensity: 0.12,
          }),
          screen: new THREE.MeshStandardMaterial({
            color: 0x0d1a22,
            roughness: 0.26,
            metalness: 0.1,
            emissive: 0x062d44,
            emissiveIntensity: 0.32,
          }),
          green: new THREE.MeshBasicMaterial({ color: 0x6cd49a, transparent: true, opacity: 0.9 }),
          glass: new THREE.MeshPhysicalMaterial({
            color: 0xd5f3ff,
            transparent: true,
            opacity: 0.26,
            roughness: 0.03,
            metalness: 0,
            transmission: 0.24,
            thickness: 0.08,
            depthWrite: false,
          }),
          glassEdge: new THREE.MeshStandardMaterial({ color: 0x8ba4b3, roughness: 0.24, metalness: 0.58 }),
          shadow: new THREE.MeshBasicMaterial({
            color: 0x5c6972,
            transparent: true,
            opacity: 0.08,
            depthWrite: false,
          }),
        }
      }

      const materials = createMaterials()
      const flowMaterials: FlowBinding[] = []
      const flowParticles: FlowParticle[] = []
      const pressureZones: ZoneBinding[] = []
      const fanRotors: Object3D[] = []
      const anchorObjects: Record<CalloutKey, Object3D> = {
        hepa: new THREE.Object3D(),
        supply: new THREE.Object3D(),
        return: new THREE.Object3D(),
        pressure: new THREE.Object3D(),
      }

      const addEdges = (mesh: Mesh, opacity = 0.18, color = 0x81909b) => {
        if (opacity <= 0) return

        const edges = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry),
          new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
        )
        edges.scale.set(1.002, 1.002, 1.002)
        mesh.add(edges)
      }

      const addBox = (
        size: [number, number, number],
        position: [number, number, number],
        material: Material,
        parent: Object3D = root,
        edgeOpacity = 0.14,
      ) => {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
        mesh.scale.set(size[0], size[1], size[2])
        mesh.position.set(position[0], position[1], position[2])
        mesh.castShadow = true
        mesh.receiveShadow = true
        parent.add(mesh)
        addEdges(mesh, edgeOpacity)
        return mesh
      }

      const addSphere = (
        radius: number,
        position: [number, number, number],
        material: Material,
        parent: Object3D = root,
      ) => {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), material)
        mesh.position.set(position[0], position[1], position[2])
        mesh.castShadow = true
        mesh.receiveShadow = true
        parent.add(mesh)
        return mesh
      }

      const addCylinderBetween = (
        start: Vector3,
        end: Vector3,
        radius: number,
        material: Material,
        parent: Object3D = root,
        segments = 24,
      ) => {
        const length = start.distanceTo(end)
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material)
        const midpoint = start.clone().add(end).multiplyScalar(0.5)
        const direction = end.clone().sub(start).normalize()
        mesh.position.copy(midpoint)
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
        mesh.castShadow = true
        mesh.receiveShadow = true
        parent.add(mesh)
        return mesh
      }

      const addShadowPlate = (size: [number, number], position: [number, number, number], parent: Object3D = root) => {
        const plate = new THREE.Mesh(new THREE.PlaneGeometry(size[0], size[1]), materials.shadow)
        plate.position.set(position[0], position[1], position[2])
        plate.rotation.x = -Math.PI / 2
        plate.renderOrder = -1
        parent.add(plate)
      }

      const addPanelWall = (
        size: [number, number, number],
        position: [number, number, number],
        orientation: 'x' | 'z',
        spanPanels: number,
        heightPanels = 3,
      ) => {
        const wall = addBox(size, position, materials.wall, root, 0.22)
        addBox(
          [size[0] + 0.08, 0.08, size[2] + 0.08],
          [position[0], position[1] + size[1] / 2 + 0.055, position[2]],
          materials.wallCap,
          root,
          0.05,
        )

        const faceSign = orientation === 'x' ? Math.sign(position[2] || 1) || 1 : Math.sign(position[0] || 1) || 1
        for (let index = 1; index < spanPanels; index += 1) {
          if (orientation === 'x') {
            const x = position[0] - size[0] / 2 + (size[0] / spanPanels) * index
            addBox([0.022, size[1] * 0.88, 0.016], [x, position[1], position[2] + faceSign * (size[2] / 2 + 0.014)], materials.seam, root, 0)
          } else {
            const z = position[2] - size[2] / 2 + (size[2] / spanPanels) * index
            addBox([0.016, size[1] * 0.88, 0.022], [position[0] + faceSign * (size[0] / 2 + 0.014), position[1], z], materials.seam, root, 0)
          }
        }

        for (let row = 1; row < heightPanels; row += 1) {
          const y = position[1] - size[1] / 2 + (size[1] / heightPanels) * row
          if (orientation === 'x') {
            addBox([size[0] * 0.98, 0.018, 0.016], [position[0], y, position[2] + faceSign * (size[2] / 2 + 0.016)], materials.seam, root, 0)
          } else {
            addBox([0.016, 0.018, size[2] * 0.98], [position[0] + faceSign * (size[0] / 2 + 0.016), y, position[2]], materials.seam, root, 0)
          }
        }

        return wall
      }

      const addDoor = (position: [number, number, number], orientation: 'x' | 'z', glass = false) => {
        const mat = glass ? materials.glass : materials.equipmentDark
        if (orientation === 'x') {
          addBox([0.72, 1.22, 0.045], position, mat, root, 0.12)
          addBox([0.42, 0.12, 0.05], [position[0], position[1] + 0.54, position[2] + 0.03], materials.green, root, 0)
          addBox([0.04, 0.12, 0.055], [position[0] + 0.29, position[1], position[2] + 0.04], materials.metal, root, 0)
          return
        }

        addBox([0.045, 1.22, 0.72], position, mat, root, 0.12)
        addBox([0.05, 0.12, 0.42], [position[0] + 0.03, position[1] + 0.54, position[2]], materials.green, root, 0)
        addBox([0.055, 0.12, 0.04], [position[0] + 0.04, position[1], position[2] + 0.29], materials.metal, root, 0)
      }

      const addFanGrille = (position: [number, number, number], radius: number, parent: Object3D = root) => {
        const fan = new THREE.Group()
        fan.position.set(position[0], position[1], position[2])
        parent.add(fan)

        const well = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.94, radius * 0.94, 0.055, 64), materials.black)
        well.position.y = 0.005
        well.castShadow = true
        fan.add(well)

        const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, radius * 0.085, 10, 64), materials.equipmentLight)
        ring.rotation.x = Math.PI / 2
        ring.position.y = 0.06
        ring.castShadow = true
        fan.add(ring)

        const rotor = new THREE.Group()
        rotor.position.y = 0.1
        fan.add(rotor)

        for (let bladeIndex = 0; bladeIndex < 6; bladeIndex += 1) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.78, 0.025, radius * 0.105), materials.metal)
          blade.position.x = radius * 0.34
          blade.rotation.y = (bladeIndex / 6) * Math.PI * 2
          blade.castShadow = true
          rotor.add(blade)
        }

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.15, radius * 0.15, 0.09, 24), materials.wallCap)
        hub.position.y = 0.13
        rotor.add(hub)
        fanRotors.push(rotor)
        return fan
      }

      const addSideGrille = (
        position: [number, number, number],
        size: [number, number, number],
        orientation: 'x' | 'z',
        parent: Object3D = root,
      ) => {
        addBox(size, position, materials.black, parent, 0.04)
        const slatCount = 5
        for (let index = 0; index < slatCount; index += 1) {
          const offset = -0.4 + index * 0.2
          if (orientation === 'x') {
            addBox([size[0] * 0.9, 0.018, 0.014], [position[0], position[1] + offset * size[1], position[2] + 0.012], materials.metal, parent, 0)
          } else {
            addBox([0.014, 0.018, size[2] * 0.9], [position[0] + 0.012, position[1] + offset * size[1], position[2]], materials.metal, parent, 0)
          }
        }
      }

      const addCabinet = (
        position: [number, number, number],
        size: [number, number, number],
        parent: Object3D = root,
        accent: 'blue' | 'dark' | 'mixed' = 'mixed',
      ) => {
        const group = new THREE.Group()
        group.position.set(position[0], position[1], position[2])
        parent.add(group)

        addShadowPlate([size[0] * 1.1, size[2] * 1.25], [0, -size[1] / 2 - 0.002, 0.05], group)
        addBox(size, [0, 0, 0], materials.equipment, group, 0.2)
        addBox([size[0] * 0.42, size[1] * 0.24, 0.025], [-size[0] * 0.16, size[1] * 0.08, size[2] / 2 + 0.017], accent === 'dark' ? materials.screen : materials.bluePanel, group, 0)
        addBox([size[0] * 0.13, size[1] * 0.52, 0.025], [size[0] * 0.28, 0, size[2] / 2 + 0.018], materials.screen, group, 0)
        addBox([size[0] * 0.7, 0.024, 0.028], [0, -size[1] * 0.3, size[2] / 2 + 0.02], materials.metal, group, 0)
        return group
      }

      const addCabinetRow = (
        start: [number, number, number],
        count: number,
        spacing: number,
        axis: 'x' | 'z',
        size: [number, number, number],
      ) => {
        for (let index = 0; index < count; index += 1) {
          const position: [number, number, number] =
            axis === 'x'
              ? [start[0] + index * spacing, start[1], start[2]]
              : [start[0], start[1], start[2] + index * spacing]
          addCabinet(position, size, root, index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'dark' : 'mixed')
        }
      }

      const addGlassRail = (
        start: [number, number, number],
        end: [number, number, number],
        panelCount: number,
      ) => {
        const startVector = new THREE.Vector3(start[0], start[1], start[2])
        const endVector = new THREE.Vector3(end[0], end[1], end[2])
        const direction = endVector.clone().sub(startVector)
        const length = direction.length()
        const angle = Math.atan2(direction.x, direction.z)
        const segment = length / panelCount

        for (let index = 0; index <= panelCount; index += 1) {
          const t = index / panelCount
          const point = startVector.clone().lerp(endVector, t)
          const post = addBox([0.045, 0.92, 0.045], [point.x, 0.52, point.z], materials.glassEdge, root, 0.02)
          post.rotation.y = angle
        }

        for (let index = 0; index < panelCount; index += 1) {
          const t = (index + 0.5) / panelCount
          const point = startVector.clone().lerp(endVector, t)
          const panel = addBox([segment * 0.86, 0.68, 0.036], [point.x, 0.62, point.z], materials.glass, root, 0.06)
          panel.rotation.y = Math.PI / 2 - angle
        }

        addCylinderBetween(startVector.clone().setY(1.02), endVector.clone().setY(1.02), 0.028, materials.glassEdge)
      }

      const addAHUBlock = (position: [number, number, number]) => {
        const group = new THREE.Group()
        group.position.set(position[0], position[1], position[2])
        root.add(group)

        addShadowPlate([5.4, 1.4], [0, -0.44, 0.08], group)
        addBox([5.15, 0.82, 1.22], [0, 0, 0], materials.equipmentLight, group, 0.22)
        addBox([5.18, 0.16, 1.24], [0, -0.49, 0], materials.floorBand, group, 0.08)
        addBox([5.0, 0.1, 1.08], [0, 0.49, 0], materials.wallCap, group, 0.08)

        for (let index = 0; index < 4; index += 1) {
          const x = -1.88 + index * 1.25
          addBox([1.04, 0.08, 1.02], [x, 0.56, 0], materials.wallCap, group, 0.08)
          addFanGrille([x, 0.63, 0], 0.38, group)
          addBox([0.045, 0.62, 1.18], [x + 0.58, 0.02, 0], materials.seam, group, 0)
        }

        addSideGrille([-2.62, 0.03, 0.2], [0.04, 0.56, 0.82], 'z', group)
        addSideGrille([2.62, 0.03, 0.2], [0.04, 0.56, 0.82], 'z', group)
        addSideGrille([0.35, -0.08, 0.63], [3.6, 0.38, 0.05], 'x', group)

        addCylinderBetween(new THREE.Vector3(-2.9, -0.04, 0.15), new THREE.Vector3(-4.15, -0.04, 0.15), 0.2, materials.pipe, group, 32)
        addCylinderBetween(new THREE.Vector3(2.88, -0.05, 0.15), new THREE.Vector3(3.65, -0.05, 0.15), 0.2, materials.pipe, group, 32)

        for (let index = 0; index < 3; index += 1) {
          const x = 1.55 + index * 0.32
          addCylinderBetween(new THREE.Vector3(x, 0.52, -0.48), new THREE.Vector3(x, 1.28, -0.48), 0.035, materials.metal, group, 16)
          addCylinderBetween(new THREE.Vector3(x - 0.11, 1.29, -0.48), new THREE.Vector3(x + 0.11, 1.29, -0.48), 0.022, materials.metal, group, 12)
        }

        return group
      }

      const addHepaCluster = () => {
        const hepa = new THREE.Group()
        hepa.position.set(-2.7, 1.68, -4.34)
        root.add(hepa)

        addShadowPlate([2.0, 1.6], [0, -0.7, 0.08], hepa)
        addBox([1.65, 1.06, 1.34], [0, 0, 0], materials.equipmentLight, hepa, 0.24)
        addBox([1.62, 0.1, 1.34], [0, 0.58, 0], materials.wallCap, hepa, 0.08)
        addFanGrille([0, 0.66, 0], 0.44, hepa)
        addSideGrille([-0.84, -0.06, 0.1], [0.045, 0.55, 0.86], 'z', hepa)
        addBox([0.92, 0.3, 0.05], [0.18, 0.04, 0.69], materials.bluePanel, hepa, 0)
        addBox([0.26, 0.3, 0.05], [0.67, 0.04, 0.69], materials.screen, hepa, 0)
        addBox([0.5, 0.28, 0.5], [1.25, -0.22, 0.06], materials.equipment, hepa, 0.16)
        addCylinderBetween(new THREE.Vector3(0.84, -0.2, 0.06), new THREE.Vector3(1.05, -0.2, 0.06), 0.18, materials.pipe, hepa, 32)

        for (let index = 0; index < 4; index += 1) {
          const x = -0.5 + index * 0.32
          addCylinderBetween(new THREE.Vector3(x, 0.62, -0.54), new THREE.Vector3(x, 1.28, -0.54), 0.032, materials.pipe, hepa, 16)
          addCylinderBetween(new THREE.Vector3(x - 0.12, 1.28, -0.54), new THREE.Vector3(x + 0.12, 1.28, -0.54), 0.02, materials.pipe, hepa, 12)
        }

        const booster = new THREE.Group()
        booster.position.set(1.55, -0.08, 0.72)
        hepa.add(booster)
        addBox([0.95, 0.58, 0.82], [0, 0, 0], materials.equipment, booster, 0.2)
        addBox([0.62, 0.34, 0.05], [0, 0, 0.43], materials.screen, booster, 0)
        addCylinderBetween(new THREE.Vector3(-0.66, 0, 0.02), new THREE.Vector3(-1.1, 0, 0.02), 0.16, materials.pipe, booster, 32)

        return hepa
      }

      const addProductionLine = () => {
        const process = new THREE.Group()
        process.position.set(-0.75, 0.22, 0.05)
        root.add(process)

        addShadowPlate([6.7, 1.5], [0, -0.16, 0], process)
        addCylinderBetween(new THREE.Vector3(-3.25, 0.48, -0.52), new THREE.Vector3(3.18, 0.48, -0.52), 0.045, materials.pipeDark, process, 18)
        addCylinderBetween(new THREE.Vector3(-3.25, 0.48, 0.48), new THREE.Vector3(3.18, 0.48, 0.48), 0.045, materials.pipeDark, process, 18)
        addCylinderBetween(new THREE.Vector3(-3.1, 0.82, -0.05), new THREE.Vector3(3.05, 0.82, -0.05), 0.035, materials.metal, process, 16)

        for (let index = 0; index < 8; index += 1) {
          const x = -2.88 + index * 0.84
          addBox([0.62, 0.2, 0.96], [x, 0.36, 0], materials.metal, process, 0.12)
          addBox([0.5, 0.12, 0.68], [x, 0.55, 0], materials.equipmentLight, process, 0.1)
          addBox([0.36, 0.14, 0.24], [x, 0.68, index % 2 === 0 ? -0.18 : 0.18], index % 3 === 0 ? materials.bluePanel : materials.equipment, process, 0.08)
          addCylinderBetween(new THREE.Vector3(x - 0.22, 0.75, -0.28), new THREE.Vector3(x + 0.22, 0.75, -0.28), 0.03, materials.metal, process, 16)
          addCylinderBetween(new THREE.Vector3(x - 0.22, 0.75, 0.28), new THREE.Vector3(x + 0.22, 0.75, 0.28), 0.03, materials.metal, process, 16)
          addSphere(0.055, [x - 0.2, 0.84, index % 2 === 0 ? -0.34 : 0.34], materials.pipeDark, process)
        }

        for (let index = 0; index < 5; index += 1) {
          const x = -2.3 + index * 1.24
          const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.48, 28), materials.equipment)
          tank.position.set(x, 0.76, 0.02)
          tank.castShadow = true
          tank.receiveShadow = true
          process.add(tank)
          addCylinderBetween(new THREE.Vector3(x, 1.0, 0.02), new THREE.Vector3(x, 1.22, 0.02), 0.025, materials.pipeDark, process, 12)
          addSphere(0.06, [x, 1.25, 0.02], materials.metal, process)
        }

        return process
      }

      const addWallPipes = () => {
        const runs = [
          [new THREE.Vector3(-8.32, 1.35, -3.8), new THREE.Vector3(-4.95, 1.35, -3.8), 0.035, materials.pipeDark],
          [new THREE.Vector3(-8.32, 1.52, -3.5), new THREE.Vector3(-5.1, 1.52, -3.5), 0.026, materials.pipe],
          [new THREE.Vector3(-8.32, 1.12, -0.4), new THREE.Vector3(-4.95, 1.12, -0.4), 0.03, materials.pipe],
          [new THREE.Vector3(-4.72, 1.28, -1.6), new THREE.Vector3(3.55, 1.28, -1.6), 0.032, materials.pipeDark],
          [new THREE.Vector3(-4.72, 1.08, 1.25), new THREE.Vector3(3.65, 1.08, 1.25), 0.032, materials.pipe],
          [new THREE.Vector3(4.05, 1.18, -4.55), new THREE.Vector3(8.35, 1.18, -4.55), 0.034, materials.pipeDark],
          [new THREE.Vector3(4.05, 1.42, -4.25), new THREE.Vector3(8.25, 1.42, -4.25), 0.028, materials.pipe],
          [new THREE.Vector3(7.55, 1.08, -2.3), new THREE.Vector3(7.55, 1.08, 3.0), 0.035, materials.pipeDark],
          [new THREE.Vector3(-0.4, 0.94, 3.76), new THREE.Vector3(7.4, 0.94, 3.76), 0.032, materials.pipe],
        ] as const

        runs.forEach(([start, end, radius, material]) => {
          addCylinderBetween(start, end, radius, material, root, 18)
          const count = Math.max(Math.floor(start.distanceTo(end) / 0.72), 2)
          for (let index = 1; index < count; index += 1) {
            const point = start.clone().lerp(end, index / count)
            addBox([0.05, 0.16, 0.05], [point.x, point.y - 0.13, point.z], materials.metal, root, 0)
          }
        })

        for (let index = 0; index < 12; index += 1) {
          addBox([0.18, 0.28, 0.08], [-7.96 + index * 0.24, 0.82, -4.93], index % 2 === 0 ? materials.bluePanel : materials.screen, root, 0.02)
        }
      }

      const addPressureZone = (
        position: [number, number, number],
        size: [number, number, number],
        zoneIndex: number,
      ) => {
        const material = new THREE.MeshBasicMaterial({
          color: 0x44d9ff,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })
        const zone = addBox(size, position, material, root, 0)
        zone.renderOrder = 2
        pressureZones.push({ material, baseOpacity: 0.09, zoneIndex })
        return zone
      }

      const toVector = (point: FlowPoint) => new THREE.Vector3(point[0], point[1], point[2])

      const createPathMetrics = (points: Vector3[]) => {
        const segmentLengths = points.slice(0, -1).map((point, index) => point.distanceTo(points[index + 1]))
        const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0)
        return { segmentLengths, totalLength }
      }

      const getPolylinePointAtDistance = (
        points: Vector3[],
        segmentLengths: number[],
        totalLength: number,
        distance: number,
      ) => {
        if (points.length < 2 || totalLength <= 0) {
          return { point: points[0]?.clone() ?? new THREE.Vector3(), tangent: new THREE.Vector3(0, 1, 0) }
        }

        const wrappedDistance = ((distance % totalLength) + totalLength) % totalLength
        let traversed = 0

        for (let index = 0; index < segmentLengths.length; index += 1) {
          const length = segmentLengths[index]
          if (wrappedDistance <= traversed + length || index === segmentLengths.length - 1) {
            const progress = length <= 0 ? 0 : (wrappedDistance - traversed) / length
            const start = points[index]
            const end = points[index + 1]
            return {
              point: start.clone().lerp(end, Math.min(Math.max(progress, 0), 1)),
              tangent: end.clone().sub(start).normalize(),
            }
          }
          traversed += length
        }

        return {
          point: points[points.length - 1].clone(),
          tangent: points[points.length - 1].clone().sub(points[points.length - 2]).normalize(),
        }
      }

      const getFlowLaneVector = (pathIndex: number) => {
        const vectors = [
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(0, 0, 1),
          new THREE.Vector3(1, 0, 0),
        ]
        return (vectors[pathIndex] ?? new THREE.Vector3(0, 0, 1)).normalize()
      }

      const applyLaneOffset = (point: Vector3, laneOffset: number, laneVector: Vector3) =>
        point.clone().addScaledVector(laneVector, laneOffset)

      const createFlowMaterial = (color: number, opacity: number) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          toneMapped: false,
        })

      const addStraightFlowSegment = (
        start: Vector3,
        end: Vector3,
        laneOffset: number,
        material: MeshBasicMaterial,
        radius: number,
        laneVector: Vector3,
      ) => {
        const curve = new THREE.LineCurve3(
          applyLaneOffset(start, laneOffset, laneVector),
          applyLaneOffset(end, laneOffset, laneVector),
        )
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 1, radius, 12, false), material)
        tube.renderOrder = 12
        root.add(tube)
        return tube
      }

      const addElbowTurn = (
        previous: Vector3,
        corner: Vector3,
        next: Vector3,
        laneOffset: number,
        material: MeshBasicMaterial,
        radius: number,
        cornerRadius: number,
        laneVector: Vector3,
      ) => {
        const incoming = corner.clone().sub(previous).normalize()
        const outgoing = next.clone().sub(corner).normalize()
        const elbowStart = corner.clone().sub(incoming.multiplyScalar(cornerRadius))
        const elbowEnd = corner.clone().add(outgoing.multiplyScalar(cornerRadius))
        const curve = new THREE.QuadraticBezierCurve3(
          applyLaneOffset(elbowStart, laneOffset, laneVector),
          applyLaneOffset(corner, laneOffset, laneVector),
          applyLaneOffset(elbowEnd, laneOffset, laneVector),
        )
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 12, false), material)
        tube.renderOrder = 12
        root.add(tube)
        return tube
      }

      const addOrthogonalFlowPath = (config: OrthogonalFlowPath) => {
        const points = config.points.map(toVector)
        const laneVector = getFlowLaneVector(config.pathIndex)
        const glowMaterial = createFlowMaterial(0x00d9ff, 0.15)
        const clippedCornerRadius = Math.min(config.cornerRadius, 0.2)

        const addSegmentSet = (laneOffset: number, material: MeshBasicMaterial, radius: number) => {
          for (let index = 0; index < points.length - 1; index += 1) {
            const start = points[index].clone()
            const end = points[index + 1].clone()
            const direction = end.clone().sub(start).normalize()
            if (index > 0) start.add(direction.clone().multiplyScalar(clippedCornerRadius))
            if (index < points.length - 2) end.sub(direction.clone().multiplyScalar(clippedCornerRadius))
            addStraightFlowSegment(start, end, laneOffset, material, radius, laneVector)
          }

          for (let index = 1; index < points.length - 1; index += 1) {
            addElbowTurn(
              points[index - 1],
              points[index],
              points[index + 1],
              laneOffset,
              material,
              radius,
              clippedCornerRadius,
              laneVector,
            )
          }
        }

        config.laneOffsets.forEach((laneOffset) => {
          addSegmentSet(laneOffset, glowMaterial, 0.1)
        })
        flowMaterials.push({ material: glowMaterial, baseOpacity: 0.17, pathIndex: config.pathIndex })

        config.laneOffsets.forEach((laneOffset, strandIndex) => {
          const isCore = strandIndex === 1 || strandIndex === 2
          const material = createFlowMaterial(isCore ? 0x88f5ff : 0x18caff, isCore ? 0.88 : 0.58)
          addSegmentSet(laneOffset, material, isCore ? 0.032 : 0.048)
          flowMaterials.push({
            material,
            baseOpacity: isCore ? 0.92 : 0.62,
            pathIndex: config.pathIndex,
          })
        })

        const particleMaterial = createFlowMaterial(0xd7fbff, 0.92)
        const particleGeometry = new THREE.ConeGeometry(0.075, 0.26, 16)
        for (let index = 0; index < config.particleCount; index += 1) {
          const particleLaneOffset = config.laneOffsets[index % config.laneOffsets.length]
          const particlePoints = points.map((point) => applyLaneOffset(point, particleLaneOffset, laneVector))
          const { segmentLengths, totalLength } = createPathMetrics(particlePoints)
          const particle = new THREE.Mesh(particleGeometry, particleMaterial)
          particle.renderOrder = 14
          root.add(particle)
          flowParticles.push({
            mesh: particle,
            points: particlePoints,
            segmentLengths,
            totalLength,
            material: particleMaterial,
            offset: index / config.particleCount,
            pathIndex: config.pathIndex,
            speed: 0.42 + config.pathIndex * 0.04,
          })
        }
      }

      const addDetailDensityPass = () => {
        for (let index = 0; index < 22; index += 1) {
          const x = -8.18 + index * 0.34
          addBox([0.1, 0.18, 0.04], [x, 1.62, -5.0], index % 3 === 0 ? materials.bluePanel : materials.screen, root, 0.01)
          addBox([0.08, 0.06, 0.035], [x, 1.36, -4.98], materials.metal, root, 0)
        }

        for (let index = 0; index < 18; index += 1) {
          const x = -3.48 + index * 0.42
          addBox([0.08, 0.22, 0.045], [x, 1.28, -1.47], index % 4 === 0 ? materials.bluePanel : materials.screen, root, 0.01)
          addBox([0.05, 0.07, 0.08], [x, 1.06, -1.39], materials.metal, root, 0)
        }

        for (let index = 0; index < 16; index += 1) {
          const x = -3.28 + index * 0.43
          addSphere(0.04, [x, 1.08, index % 2 === 0 ? -0.58 : 0.58], materials.pipeDark, root)
          addCylinderBetween(
            new THREE.Vector3(x, 0.88, index % 2 === 0 ? -0.42 : 0.42),
            new THREE.Vector3(x, 1.18, index % 2 === 0 ? -0.42 : 0.42),
            0.018,
            materials.pipeDark,
            root,
            10,
          )
        }

        for (let index = 0; index < 9; index += 1) {
          const z = -4.32 + index * 0.52
          addBox([0.045, 0.22, 0.1], [-8.74, 1.32, z], materials.metal, root, 0)
          addBox([0.055, 0.32, 0.26], [-8.68, 0.78, z + 0.14], index % 2 === 0 ? materials.screen : materials.bluePanel, root, 0.01)
        }

        for (let index = 0; index < 20; index += 1) {
          const x = -0.08 + index * 0.4
          addBox([0.045, 0.16, 0.045], [x, 0.58, 4.28], materials.glassEdge, root, 0)
          addBox([0.16, 0.035, 0.035], [x + 0.08, 1.02, 4.28], materials.glassEdge, root, 0)
        }

        for (let index = 0; index < 4; index += 1) {
          const x = 4.08 + index * 1.24
          addBox([0.68, 0.34, 0.055], [x, 1.32, -2.12], materials.screen, root, 0)
          addBox([0.26, 0.18, 0.06], [x + 0.34, 1.64, -3.36], materials.bluePanel, root, 0.01)
          addSphere(0.045, [x - 0.32, 1.84, -3.32], materials.metal, root)
        }

        for (let index = 0; index < 10; index += 1) {
          addBox([0.12, 0.08, 0.06], [4.74 + index * 0.34, 0.82, 1.78], materials.metal, root, 0.01)
          addBox([0.08, 0.22, 0.045], [4.74 + index * 0.34, 1.14, 1.68], index % 2 === 0 ? materials.bluePanel : materials.screen, root, 0)
        }

        for (let index = 0; index < 6; index += 1) {
          const x = -7.82 + index * 0.58
          addCylinderBetween(new THREE.Vector3(x, 1.58, -2.82), new THREE.Vector3(x, 1.58, -1.58), 0.018, materials.pipe, root, 10)
          addCylinderBetween(new THREE.Vector3(x + 0.12, 1.36, -2.82), new THREE.Vector3(x + 0.12, 1.36, -1.58), 0.018, materials.pipeDark, root, 10)
        }
      }

      const flowLanes = [-0.24, -0.08, 0.08, 0.24]
      const flowRoutes: OrthogonalFlowPath[] = [
        {
          id: 'HEPA_TO_LEFT_RETURN_DROP',
          pathIndex: 0,
          points: [
            [-2.72, 2.72, -4.35],
            [-2.72, 1.96, -4.35],
            [-4.42, 1.96, -4.35],
            [-4.42, 1.58, -4.35],
            [-4.42, 1.58, -2.82],
            [-6.9, 1.58, -2.82],
            [-6.9, 1.12, -2.82],
            [-6.9, 1.12, -0.28],
          ],
          laneOffsets: flowLanes,
          particleCount: 13,
          cornerRadius: 0.12,
        },
        {
          id: 'HEPA_TO_TOP_SUPPLY_RUN',
          pathIndex: 1,
          points: [
            [-2.18, 2.76, -4.76],
            [1.28, 2.76, -4.76],
            [4.9, 2.76, -4.76],
            [4.9, 2.22, -4.76],
            [4.9, 2.22, -3.58],
            [6.72, 2.22, -3.58],
          ],
          laneOffsets: flowLanes,
          particleCount: 14,
          cornerRadius: 0.12,
        },
        {
          id: 'RIGHT_AHU_DOWNFEED',
          pathIndex: 2,
          points: [
            [7.86, 1.76, -2.18],
            [7.86, 1.18, -2.18],
            [7.86, 1.18, 1.18],
            [6.82, 1.18, 1.18],
            [6.82, 1.05, 1.18],
            [6.82, 1.05, 3.62],
          ],
          laneOffsets: flowLanes,
          particleCount: 13,
          cornerRadius: 0.12,
        },
        {
          id: 'FRONT_PRESSURE_CORRIDOR',
          pathIndex: 3,
          points: [
            [7.45, 1.02, 3.94],
            [4.4, 1.02, 3.94],
            [1.1, 1.02, 3.94],
            [-0.92, 1.02, 3.94],
            [-0.92, 1.12, 3.94],
            [-0.92, 1.12, 2.76],
          ],
          laneOffsets: flowLanes,
          particleCount: 12,
          cornerRadius: 0.1,
        },
        {
          id: 'LEFT_RETURN_RISER',
          pathIndex: 4,
          points: [
            [-8.28, 1.12, 0.82],
            [-8.28, 1.82, 0.82],
            [-8.28, 1.82, -2.52],
            [-4.58, 1.82, -2.52],
            [-4.58, 2.34, -2.52],
            [-4.58, 2.34, -4.28],
            [-2.76, 2.34, -4.28],
          ],
          laneOffsets: flowLanes,
          particleCount: 10,
          cornerRadius: 0.12,
        },
      ]

      addBox([18.6, 0.24, 11.3], [0, -0.2, 0], materials.base, root, 0.08)
      addBox([18.15, 0.08, 10.85], [0, -0.04, 0], materials.floorBand, root, 0.06)
      addBox([17.65, 0.04, 10.35], [0, 0.03, 0], materials.floor, root, 0)

      const tileLines: Vector3[] = []
      for (let x = -8.5; x <= 8.55; x += 0.72) {
        tileLines.push(new THREE.Vector3(x, 0.058, -5.05), new THREE.Vector3(x, 0.058, 5.05))
      }
      for (let z = -5.0; z <= 5.05; z += 0.72) {
        tileLines.push(new THREE.Vector3(-8.55, 0.058, z), new THREE.Vector3(8.55, 0.058, z))
      }
      const tileGrid = new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(tileLines),
        new THREE.LineBasicMaterial({ color: 0xb9c5ce, transparent: true, opacity: 0.28 }),
      )
      root.add(tileGrid)

      addPressureZone([-5.85, 0.08, -1.4], [4.9, 0.03, 4.5], 0)
      addPressureZone([-0.4, 0.085, 0.12], [7.5, 0.03, 3.0], 1)
      addPressureZone([5.65, 0.09, 3.64], [6.2, 0.03, 2.08], 2)
      addPressureZone([3.4, 0.095, -3.78], [9.3, 0.03, 2.3], 3)

      addPanelWall([17.75, 2.08, 0.24], [0, 1.05, -5.15], 'x', 11, 3)
      addPanelWall([0.24, 2.08, 10.1], [-8.88, 1.05, -0.02], 'z', 7, 3)
      addPanelWall([0.24, 2.08, 7.5], [8.88, 1.05, -1.26], 'z', 6, 3)
      addPanelWall([4.9, 1.42, 0.22], [-6.2, 0.72, 4.95], 'x', 4, 2)
      addPanelWall([3.25, 1.42, 0.22], [6.98, 0.72, 4.95], 'x', 3, 2)

      addPanelWall([6.6, 1.82, 0.2], [-5.2, 0.93, -2.92], 'x', 5, 3)
      addPanelWall([5.6, 1.82, 0.2], [4.95, 0.93, -2.92], 'x', 5, 3)
      addPanelWall([0.2, 1.78, 5.7], [-4.66, 0.91, -0.14], 'z', 5, 3)
      addPanelWall([0.2, 1.78, 5.15], [3.74, 0.91, -0.36], 'z', 5, 3)
      addPanelWall([8.6, 1.32, 0.2], [-0.46, 0.68, 1.42], 'x', 7, 3)
      addPanelWall([0.2, 1.58, 2.5], [1.12, 0.8, -3.9], 'z', 2, 2)
      addPanelWall([0.2, 1.48, 3.58], [5.18, 0.75, 2.92], 'z', 4, 2)
      addPanelWall([3.4, 1.48, 0.2], [6.78, 0.75, 1.58], 'x', 3, 2)
      addPanelWall([4.1, 1.42, 0.18], [-2.05, 0.72, 3.35], 'x', 4, 2)

      addDoor([-1.1, 0.64, 4.86], 'x', false)
      addDoor([4.08, 0.64, 1.68], 'z', true)
      addDoor([-6.85, 0.64, 4.86], 'x', true)
      addDoor([7.98, 0.64, 4.84], 'x', true)

      addGlassRail([-7.9, 0.12, 4.35], [-4.5, 0.12, 4.35], 5)
      addGlassRail([-0.2, 0.12, 4.34], [7.75, 0.12, 4.34], 10)
      addGlassRail([7.75, 0.12, 4.34], [8.12, 0.12, 1.88], 4)
      addGlassRail([4.9, 0.12, 1.85], [4.9, 0.12, 4.28], 4)

      addCabinetRow([-8.08, 0.55, -3.78], 4, 0.74, 'x', [0.62, 1.02, 0.52])
      addCabinetRow([-8.08, 0.52, -1.42], 5, 0.72, 'z', [0.62, 0.95, 0.48])
      addCabinetRow([-2.8, 0.55, 0.82], 8, 0.78, 'x', [0.55, 0.98, 0.48])
      addCabinetRow([5.65, 0.52, 2.94], 4, 0.72, 'x', [0.62, 0.96, 0.5])
      addCabinetRow([6.22, 0.48, 3.95], 3, 0.72, 'x', [0.56, 0.82, 0.46])

      addProductionLine()
      addWallPipes()
      addHepaCluster()
      addAHUBlock([5.86, 1.28, -2.78])

      const topFilter = new THREE.Group()
      topFilter.position.set(-5.75, 0.82, -2.92)
      root.add(topFilter)
      addBox([1.1, 0.68, 0.9], [0, 0, 0], materials.equipmentLight, topFilter, 0.18)
      addBox([0.64, 0.38, 0.04], [0.05, 0.0, 0.47], materials.screen, topFilter, 0)
      addCylinderBetween(new THREE.Vector3(0.62, 0.2, 0), new THREE.Vector3(2.6, 0.2, 0), 0.16, materials.pipe, topFilter, 32)

      const upperCabinet = new THREE.Group()
      upperCabinet.position.set(-3.4, 0.82, -3.54)
      root.add(upperCabinet)
      addBox([1.35, 0.78, 0.64], [0, 0, 0], materials.equipmentLight, upperCabinet, 0.18)
      addBox([0.64, 0.28, 0.04], [0.0, 0.04, 0.34], materials.bluePanel, upperCabinet, 0)
      addBox([0.34, 0.28, 0.04], [0.46, 0.04, 0.34], materials.screen, upperCabinet, 0)
      addCylinderBetween(new THREE.Vector3(-0.88, 0.22, 0), new THREE.Vector3(-2.4, 0.22, 0), 0.14, materials.pipe, upperCabinet, 32)

      addCylinderBetween(new THREE.Vector3(-4.2, 1.18, -4.6), new THREE.Vector3(-0.9, 1.18, -4.6), 0.13, materials.pipe)
      addCylinderBetween(new THREE.Vector3(-4.2, 1.03, -3.12), new THREE.Vector3(-4.2, 1.03, -0.18), 0.12, materials.pipe)
      addCylinderBetween(new THREE.Vector3(3.22, 1.12, -2.3), new THREE.Vector3(8.05, 1.12, -2.3), 0.19, materials.pipe)
      addCylinderBetween(new THREE.Vector3(8.05, 1.12, -2.3), new THREE.Vector3(8.05, 1.12, 0.86), 0.19, materials.pipe)
      addCylinderBetween(new THREE.Vector3(1.58, 0.72, 3.62), new THREE.Vector3(7.25, 0.72, 3.62), 0.08, materials.pipeDark)
      addCylinderBetween(new THREE.Vector3(-7.25, 0.78, 1.96), new THREE.Vector3(-4.78, 0.78, 1.96), 0.12, materials.pipe)

      for (let index = 0; index < 14; index += 1) {
        addBox([0.14, 0.42, 0.14], [-7.8 + index * 0.5, 0.24, -3.12], materials.metal, root, 0.03)
      }

      addDetailDensityPass()
      flowRoutes.forEach(addOrthogonalFlowPath)

      anchorObjects.hepa.position.set(-2.75, 3.05, -4.38)
      anchorObjects.supply.position.set(7.92, 2.2, -3.0)
      anchorObjects.return.position.set(-8.35, 1.38, 0.82)
      anchorObjects.pressure.position.set(5.1, 1.18, 4.1)
      Object.values(anchorObjects).forEach((object) => root.add(object))

      let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
        reduceMotion = event.matches
      }
      reducedMotionQuery.addEventListener('change', onMotionPreferenceChange)

      const fixedCameraZoom = 0.7
      const rotation = {
        dragging: false,
        lastX: 0,
        lastY: 0,
        yaw: 0,
        pitch: 0,
        targetYaw: 0,
        targetPitch: 0,
      }
      const idleRotation = {
        yaw: 0,
        pitch: 0,
        pauseUntil: 0,
      }

      const resize = () => {
        const width = Math.max(container.clientWidth, 360)
        const height = Math.max(container.clientHeight, 430)
        const aspect = width / height
        const viewHeight = width <= 520 ? 11.45 : width <= 900 ? 10.75 : 10.15
        camera.left = (-viewHeight * aspect) / 2
        camera.right = (viewHeight * aspect) / 2
        camera.top = viewHeight / 2
        camera.bottom = -viewHeight / 2
        camera.zoom = fixedCameraZoom
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }

      const onPointerDown = (event: PointerEvent) => {
        rotation.dragging = true
        idleRotation.pauseUntil = Number.POSITIVE_INFINITY
        rotation.lastX = event.clientX
        rotation.lastY = event.clientY
        container.setPointerCapture(event.pointerId)
        container.classList.add('is-dragging')
      }

      const onPointerMove = (event: PointerEvent) => {
        if (!rotation.dragging) return
        const dx = event.clientX - rotation.lastX
        const dy = event.clientY - rotation.lastY
        rotation.lastX = event.clientX
        rotation.lastY = event.clientY
        rotation.targetYaw = Math.min(Math.max(rotation.targetYaw + dx * 0.0042, -0.34), 0.34)
        rotation.targetPitch = Math.min(Math.max(rotation.targetPitch + dy * 0.0024, -0.1), 0.14)
      }

      const endPointerDrag = (event: PointerEvent) => {
        rotation.dragging = false
        idleRotation.pauseUntil = performance.now() / 1000 + 1.35
        if (container.hasPointerCapture(event.pointerId)) {
          container.releasePointerCapture(event.pointerId)
        }
        container.classList.remove('is-dragging')
      }

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', endPointerDrag)
      container.addEventListener('pointercancel', endPointerDrag)

      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(container)
      resize()

      let frame = 0
      let lastCallouts = defaultAnchors
      const tempPosition = new THREE.Vector3()
      const upVector = new THREE.Vector3(0, 1, 0)

      const updateCalloutAnchors = () => {
        const next = {} as Record<CalloutKey, AnchorPosition>
        let changed = false

        ;(Object.keys(anchorObjects) as CalloutKey[]).forEach((key) => {
          anchorObjects[key].getWorldPosition(tempPosition)
          tempPosition.project(camera)
          const projected = {
            x: (tempPosition.x * 0.5 + 0.5) * 100,
            y: (-tempPosition.y * 0.5 + 0.5) * 100,
            visible: tempPosition.z > -1 && tempPosition.z < 1,
          }
          next[key] = projected

          const previous = lastCallouts[key]
          if (
            Math.abs(previous.x - projected.x) > 0.24 ||
            Math.abs(previous.y - projected.y) > 0.24 ||
            previous.visible !== projected.visible
          ) {
            changed = true
          }
        })

        if (changed && !cancelled && frame % 8 === 0) {
          lastCallouts = next
          setAnchors(next)
        }
      }

      const animate = (time: number) => {
        if (cancelled) return
        if (!sceneVisible) return

        const seconds = time / 1000
        frame = window.requestAnimationFrame(animate)
        const visual = getOptionVisuals(activeOptionRef.current)

        rotation.yaw += (rotation.targetYaw - rotation.yaw) * 0.1
        rotation.pitch += (rotation.targetPitch - rotation.pitch) * 0.1

        const idleActive = !reduceMotion && !rotation.dragging && seconds > idleRotation.pauseUntil
        const targetIdleYaw = idleActive ? Math.sin(seconds * 0.48) * 0.11 : 0
        const targetIdlePitch = idleActive ? Math.sin(seconds * 0.34 + 0.8) * 0.024 : 0
        idleRotation.yaw += (targetIdleYaw - idleRotation.yaw) * 0.045
        idleRotation.pitch += (targetIdlePitch - idleRotation.pitch) * 0.045
        root.rotation.y = rotation.yaw + idleRotation.yaw
        root.rotation.x = rotation.pitch + idleRotation.pitch
        camera.zoom = fixedCameraZoom
        camera.updateProjectionMatrix()

        flowMaterials.forEach(({ material, baseOpacity, pathIndex }) => {
          const strength = visual.pathStrength[pathIndex] ?? 0.36
          const pulse = reduceMotion ? 1 : 0.9 + Math.sin(seconds * 1.9 + pathIndex) * 0.1
          material.opacity += (baseOpacity * strength * pulse - material.opacity) * 0.08
        })

        pressureZones.forEach(({ material, baseOpacity, zoneIndex }) => {
          const strength = visual.zoneStrength[zoneIndex] ?? 0.2
          const pulse = reduceMotion ? 1 : 0.82 + Math.sin(seconds * 2.1 + zoneIndex * 0.8) * 0.18
          material.opacity += (baseOpacity * strength * pulse - material.opacity) * 0.08
        })

        if (!reduceMotion) {
          fanRotors.forEach((fan, index) => {
            fan.rotation.y -= (0.08 + index * 0.0015) * visual.fanSpeed
          })
        }

        flowParticles.forEach((particle) => {
          const strength = visual.pathStrength[particle.pathIndex] ?? 0.24
          const travel = reduceMotion ? 0 : seconds * particle.speed * visual.particleSpeed
          const sample = getPolylinePointAtDistance(
            particle.points,
            particle.segmentLengths,
            particle.totalLength,
            travel + particle.offset * particle.totalLength,
          )
          particle.mesh.position.copy(sample.point)
          particle.mesh.quaternion.setFromUnitVectors(upVector, sample.tangent)
          particle.mesh.visible = strength > 0.16
          particle.material.opacity += (0.92 * strength - particle.material.opacity) * 0.12
        })

        if (frame % 4 === 0) updateCalloutAnchors()
        renderer.render(scene, camera)
      }

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          sceneVisible = entry.isIntersecting
          if (sceneVisible && !cancelled) {
            frame = window.requestAnimationFrame(animate)
          }
        },
        { rootMargin: '200px' },
      )
      visibilityObserver.observe(container)

      frame = window.requestAnimationFrame(animate)
      setHasError(false)
      setIsLoaded(true)
      notifyHvacReady()

      runtimeRef.current = {
        resetView: () => {
          rotation.targetYaw = 0
          rotation.targetPitch = 0
          idleRotation.yaw = 0
          idleRotation.pitch = 0
          idleRotation.pauseUntil = performance.now() / 1000 + 0.5
        },
      }

      cleanup = () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        visibilityObserver.disconnect()
        resizeObserver.disconnect()
        reducedMotionQuery.removeEventListener('change', onMotionPreferenceChange)
        container.removeEventListener('pointerdown', onPointerDown)
        container.removeEventListener('pointermove', onPointerMove)
        container.removeEventListener('pointerup', endPointerDrag)
        container.removeEventListener('pointercancel', endPointerDrag)
        runtimeRef.current = null

        scene.traverse(disposeObjectResources)
        renderer.dispose()
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    setupScene().catch(() => {
      if (cancelled) return
      setHasError(true)
      setIsLoaded(false)
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [shouldMount])

  const resetView = () => runtimeRef.current?.resetView()

  return (
    <div
      className={`cleanroom-visual gmp-hvac-model option-${activeOption} ${isLoaded ? 'is-loaded' : ''} ${hasError ? 'is-model-error' : ''}`}
      ref={mountRef}
      aria-label="Interactive 3D GMP HVAC cleanroom model"
    >
      <div className="gmp-model-loading">Building GMP HVAC model</div>
      <div className="gmp-model-error">HVAC model could not be rendered.</div>
      <button className="gmp-model-reset" type="button" aria-label="Reset HVAC model view" title="Reset view" onClick={resetView}>
        <RotateCcw size={17} aria-hidden="true" />
      </button>

      {(Object.keys(calloutCopy) as CalloutKey[]).map((key) => {
        const copy = calloutCopy[key]
        return (
          <button
            key={key}
            type="button"
            className={`gmp-callout-card callout-${key}`}
            style={formatCalloutStyle(anchors[key])}
            aria-pressed={activeCallout === key}
            onClick={() => setActiveCallout(key)}
          >
            <span>{copy.title}</span>
            <strong>{copy.detail}</strong>
          </button>
        )
      })}
    </div>
  )
}
