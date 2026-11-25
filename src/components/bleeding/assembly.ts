import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { parts, type PartId } from './parts'

type Point = readonly [number, number, number]
type Section = readonly [number, number, number, number, number]

const up = new THREE.Vector3(0, 1, 0)
const point = (xyz: Point) => new THREE.Vector3(...xyz)

function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material, xyz: Point) {
  const object = new THREE.Mesh(geometry, material)
  object.position.copy(point(xyz))
  object.castShadow = !material.transparent
  object.receiveShadow = true
  parent.add(object)
  return object
}

function box(parent: THREE.Object3D, size: Point, radius: number, material: THREE.Material, xyz: Point) {
  return mesh(parent, new RoundedBoxGeometry(...size, 2, radius), material, xyz)
}

function detailGrid(
  parent: THREE.Object3D,
  size: Point,
  material: THREE.Material,
  origin: Point,
  columns: number,
  rows: number,
  spacing: readonly [number, number],
) {
  const instances = new THREE.InstancedMesh(new THREE.BoxGeometry(...size), material, columns * rows)
  const transform = new THREE.Matrix4()
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      transform.makeTranslation(origin[0] + column * spacing[0], origin[1], origin[2] + row * spacing[1])
      instances.setMatrixAt(row * columns + column, transform)
    }
  }
  parent.add(instances)
}

function rod(parent: THREE.Object3D, from: Point, to: Point, radius: number, material: THREE.Material, sides = 20) {
  const axis = point(to).sub(point(from))
  const center = point(from).addScaledVector(axis, 0.5)
  const object = mesh(parent, new THREE.CylinderGeometry(radius, radius, axis.length(), sides), material, [center.x, center.y, center.z])
  object.quaternion.setFromUnitVectors(up, axis.normalize())
  return object
}

function oval(parent: THREE.Object3D, dimensions: Point, material: THREE.Material, xyz: Point) {
  const object = mesh(parent, new THREE.SphereGeometry(1, 28, 18), material, xyz)
  object.scale.set(...dimensions)
  return object
}

function tube(parent: THREE.Object3D, points: Point[], radius: number, material: THREE.Material) {
  const path = new THREE.CatmullRomCurve3(points.map(point))
  mesh(parent, new THREE.TubeGeometry(path, Math.max(24, points.length * 10), radius, 10, false), material, [0, 0, 0])
  return path
}

function loft(parent: THREE.Object3D, sections: Section[], material: THREE.Material) {
  const spine = new THREE.CatmullRomCurve3(sections.map(([x, y, z]) => point([x, y, z])), false, 'catmullrom')
  const profile = new THREE.CatmullRomCurve3(sections.map(([, , , height, width], i) => point([height, width, i])), false, 'catmullrom')
  const steps = sections.length * 8
  const sides = 32
  const vertices: number[] = []
  const indices: number[] = []

  for (let step = 0; step <= steps; step++) {
    const at = step / steps
    const center = spine.getPoint(at)
    const radius = profile.getPoint(at)
    const tangent = spine.getTangent(at)
    const side = tangent.clone().cross(up).normalize()
    const top = side.clone().cross(tangent).normalize()
    for (let edge = 0; edge < sides; edge++) {
      const angle = edge / sides * Math.PI * 2
      const vertex = center.clone()
        .addScaledVector(top, Math.cos(angle) * Math.max(0.001, radius.x))
        .addScaledVector(side, Math.sin(angle) * Math.max(0.001, radius.y))
      vertices.push(vertex.x, vertex.y, vertex.z)
      if (step === steps) continue
      const a = step * sides + edge
      const b = step * sides + (edge + 1) % sides
      indices.push(a, b, a + sides, b, b + sides, a + sides)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return mesh(parent, geometry, material, [0, 0, 0])
}

export function buildAssembly(screenTexture: THREE.Texture) {
  const root = new THREE.Group()
  const groups = {} as Record<PartId, THREE.Group>
  for (const id of Object.keys(parts) as PartId[]) {
    const group = new THREE.Group()
    group.name = id
    root.add(group)
    groups[id] = group
  }

  const metal = new THREE.MeshStandardMaterial({ color: '#aebbc2', roughness: 0.33, metalness: 0.68 })
  const black = new THREE.MeshStandardMaterial({ color: '#202630', roughness: 0.49, metalness: 0.12 })
  const dark = new THREE.MeshStandardMaterial({ color: '#343c47', roughness: 0.69, metalness: 0.08 })
  const foam = new THREE.MeshStandardMaterial({ color: '#252b32', roughness: 0.94 })
  const plastic = new THREE.MeshStandardMaterial({ color: '#eee8dc', roughness: 0.56 })
  const gold = new THREE.MeshStandardMaterial({ color: '#c9a355', roughness: 0.39, metalness: 0.48 })
  const circuit = new THREE.MeshStandardMaterial({ color: '#157280', roughness: 0.62, metalness: 0.12 })
  const silicone = new THREE.MeshPhysicalMaterial({ color: '#dec39e', roughness: 0.49, clearcoat: 0.2, sheen: 0.35 })
  const wrap = new THREE.MeshPhysicalMaterial({ color: '#e9f3eb', opacity: 0.18, transparent: true, depthWrite: false, roughness: 0.22, clearcoat: 0.85 })
  const translucent = new THREE.MeshPhysicalMaterial({ color: '#c6d7d3', opacity: 0.35, transparent: true, depthWrite: false, roughness: 0.22, clearcoat: 0.86 })
  const liquid = new THREE.MeshPhysicalMaterial({ color: '#761c35', roughness: 0.33, clearcoat: 0.65 })
  const fluidTube = new THREE.MeshPhysicalMaterial({ color: '#9a4051', roughness: 0.23, clearcoat: 0.81 })
  const signalWire = new THREE.MeshStandardMaterial({ color: '#207e84', roughness: 0.46, metalness: 0.16 })
  const fluidPaths: THREE.CatmullRomCurve3[] = []
  const signalPaths: THREE.CatmullRomCurve3[] = []
  const fluidLines = new THREE.Group()
  const signalLines = new THREE.Group()
  root.add(fluidLines, signalLines)

  box(root, [11, 0.31, 4.96], 0.15, dark, [0, 0.155, 0])
  box(root, [10.75, 0.23, 3.04], 0.13, black, [0, 0.398, -0.78])
  box(root, [9.95, 0.035, 0.026], 0.012, metal, [0, 0.22, 2.487])
  for (const x of [-4.82, 4.82]) {
    for (const z of [-2.03, 2.03]) {
      box(root, [0.52, 0.12, 0.5], 0.055, foam, [x, 0.012, z])
      rod(root, [x, 0.303, z], [x, 0.328, z], 0.071, metal, 12)
    }
  }

  const bag = groups.bag
  box(bag, [0.63, 0.09, 0.69], 0.045, metal, [-5.02, 0.55, -1.34])
  rod(bag, [-5.02, 0.56, -1.34], [-5.02, 3.64, -1.34], 0.065, metal)
  rod(bag, [-5.02, 3.51, -1.34], [-4.12, 3.51, -1.34], 0.047, metal)
  tube(bag, [[-4.16, 3.51, -1.34], [-4.14, 3.39, -1.26], [-4.15, 3.26, -1.25]], 0.026, metal)
  const pouch = new THREE.Shape()
  pouch.moveTo(-0.49, -0.69)
  pouch.bezierCurveTo(-0.61, -0.45, -0.42, 0.30, -0.54, 0.68)
  pouch.quadraticCurveTo(-0.37, 0.76, -0.17, 0.72)
  pouch.quadraticCurveTo(0.03, 0.56, 0.23, 0.72)
  pouch.quadraticCurveTo(0.41, 0.78, 0.52, 0.69)
  pouch.bezierCurveTo(0.44, 0.27, 0.58, -0.47, 0.47, -0.69)
  pouch.quadraticCurveTo(0.04, -0.77, -0.49, -0.69)
  const fill = new THREE.Shape()
  fill.moveTo(-0.41, -0.63)
  fill.quadraticCurveTo(0, -0.75, 0.4, -0.63)
  fill.quadraticCurveTo(0.49, -0.50, 0.42, -0.18)
  fill.bezierCurveTo(0.09, -0.23, -0.19, -0.17, -0.43, -0.22)
  fill.quadraticCurveTo(-0.47, -0.52, -0.41, -0.63)
  mesh(bag, new THREE.ExtrudeGeometry(fill, { depth: 0.103, bevelSize: 0.026, bevelThickness: 0.027, bevelSegments: 4 }), liquid, [-4.15, 2.59, -1.43])
  mesh(bag, new THREE.ExtrudeGeometry(pouch, { depth: 0.145, bevelSize: 0.016, bevelThickness: 0.02, bevelSegments: 3 }), translucent, [-4.15, 2.59, -1.45])
  const bagSeam = pouch.getPoints(52).map(({ x, y }) => point([-4.15 + x, 2.59 + y, -1.286]))
  bag.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(bagSeam), new THREE.LineBasicMaterial({ color: '#7f9290', transparent: true, opacity: 0.43 })))
  mesh(bag, new THREE.TorusGeometry(0.073, 0.016, 10, 24), metal, [-4.15, 3.25, -1.29])
  rod(bag, [-4.15, 1.69, -1.32], [-4.15, 1.91, -1.32], 0.085, translucent)
  // Small graduations make the clear pouch read as a fluid bag.
  for (let i = 0; i < 5; i++) {
    box(bag, [i % 2 ? 0.095 : 0.141, 0.013, 0.007], 0.002, plastic, [-4.46, 2.19 + i * 0.145, -1.285])
  }

  const pump = groups.pump
  box(pump, [1.43, 0.10, 0.86], 0.055, metal, [-4.34, 0.38, 1.46])
  rod(pump, [-4.91, 0.68, 1.46], [-4.15, 0.68, 1.46], 0.252, black)
  for (const x of [-4.87, -4.66, -4.47]) {
    rod(pump, [x, 0.68, 1.46], [x + 0.05, 0.68, 1.46], 0.263, dark)
  }
  box(pump, [0.48, 0.57, 0.61], 0.115, black, [-4.02, 0.69, 1.46])
  box(pump, [0.30, 0.10, 0.3], 0.02, dark, [-4.02, 0.956, 1.46])
  rod(pump, [-3.79, 0.54, 1.50], [-3.57, 0.54, 1.50], 0.091, metal, 12)
  rod(pump, [-4.18, 0.855, 1.24], [-4.18, 1.02, 1.24], 0.092, metal, 12)
  for (const [x, z] of [[-4.97, 1.80], [-4.97, 1.10], [-3.75, 1.80], [-3.75, 1.10]]) {
    rod(pump, [x, 0.43, z], [x, 0.47, z], 0.045, black, 6)
  }

  const transducer = groups.transducer
  rod(transducer, [-3.20, 0.54, 1.50], [-2.56, 0.54, 1.50], 0.102, metal)
  for (const x of [-3.19, -2.58]) {
    rod(transducer, [x - 0.055, 0.54, 1.50], [x + 0.055, 0.54, 1.50], 0.123, metal, 6)
  }
  rod(transducer, [-2.9, 0.58, 1.50], [-2.9, 0.84, 1.50], 0.092, metal, 6)
  rod(transducer, [-2.9, 0.79, 1.50], [-2.9, 1.16, 1.50], 0.146, metal)
  rod(transducer, [-2.9, 1.16, 1.50], [-2.9, 1.32, 1.50], 0.104, black)
  rod(transducer, [-2.9, 1.31, 1.50], [-2.9, 1.37, 1.50], 0.053, black)

  const flow = groups.flow
  rod(flow, [-2.22, 0.54, 1.50], [-1.58, 0.54, 1.50], 0.101, metal, 12)
  const meter = rod(flow, [-1.90, 0.58, 1.35], [-1.90, 0.58, 1.67], 0.251, black)
  meter.rotateY(Math.PI / 9)
  rod(flow, [-1.90, 0.58, 1.65], [-1.90, 0.58, 1.70], 0.228, metal)
  rod(flow, [-1.90, 0.58, 1.695], [-1.90, 0.58, 1.717], 0.176, dark)
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2
    const x = -1.90 + Math.cos(angle) * 0.202
    const y = 0.58 + Math.sin(angle) * 0.202
    rod(flow, [x, y, 1.69], [x, y, 1.73], 0.023, black, 8)
  }
  mesh(flow, new THREE.TorusGeometry(0.125, 0.012, 10, 32), metal, [-1.90, 0.58, 1.723])
  for (let i = 0; i < 5; i++) {
    const angle = i / 5 * Math.PI * 2
    rod(flow, [-1.90, 0.58, 1.726], [-1.90 + Math.cos(angle) * 0.103, 0.58 + Math.sin(angle) * 0.103, 1.726], 0.013, metal)
  }

  const arm = groups.arm
  box(arm, [0.86, 0.47, 0.79], 0.10, foam, [-2.48, 0.74, -0.37])
  box(arm, [0.72, 0.35, 0.71], 0.11, foam, [1.66, 0.68, -0.19])
  loft(arm, [
    [-3.59, 1.22, -0.39, 0.47, 0.50],
    [-3.25, 1.22, -0.38, 0.63, 0.59],
    [-2.64, 1.16, -0.38, 0.57, 0.57],
    [-1.96, 1.10, -0.36, 0.44, 0.47],
    [-1.51, 1.02, -0.35, 0.37, 0.40],
    [-1.10, 1.00, -0.29, 0.40, 0.45],
    [-0.49, 1.01, -0.17, 0.42, 0.42],
    [0.14, 1.025, -0.074, 0.365, 0.35],
    [0.78, 1.02, -0.045, 0.29, 0.29],
    [1.35, 1.005, -0.08, 0.215, 0.255],
    [1.78, 0.99, -0.12, 0.198, 0.298],
    [2.18, 0.97, -0.14, 0.19, 0.429],
    [2.53, 0.92, -0.17, 0.153, 0.413],
    [2.74, 0.9, -0.18, 0.08, 0.30],
    [2.80, 0.9, -0.18, 0.001, 0.001],
  ], silicone)
  rod(arm, [-3.63, 1.22, -0.39], [-3.51, 1.22, -0.39], 0.51, plastic, 36)
  rod(arm, [-3.77, 1.21, -0.39], [-3.61, 1.21, -0.39], 0.094, metal, 6)
  for (const angle of [-0.95, 0.95, Math.PI - 0.95, Math.PI + 0.95]) {
    const y = 1.22 + Math.cos(angle) * 0.421
    const z = -0.39 + Math.sin(angle) * 0.421
    rod(arm, [-3.64, y, z], [-3.613, y, z], 0.038, metal, 10)
  }
  for (const [z, length, radius, spread] of [[-0.50, 0.68, 0.106, -0.18], [-0.28, 0.96, 0.109, -0.075], [-0.05, 1.04, 0.113, 0.061], [0.17, 0.85, 0.108, 0.151]]) {
    loft(arm, [
      [2.49, 0.94, z, radius * 1.38, radius * 1.10],
      [2.70, 0.91, z + spread * 0.16, radius, radius],
      [2.6 + length * 0.55, 0.87, z + spread * 0.55, radius * 0.84, radius * 0.85],
      [2.6 + length, 0.80, z + spread, radius * 0.68, radius * 0.69],
      [2.66 + length, 0.79, z + spread * 1.04, 0.002, 0.002],
    ], silicone)
  }
  loft(arm, [
    [1.84, 0.97, 0.04, 0.159, 0.18],
    [2.03, 0.924, 0.31, 0.143, 0.159],
    [2.26, 0.86, 0.46, 0.112, 0.119],
    [2.58, 0.82, 0.57, 0.09, 0.094],
    [2.64, 0.81, 0.58, 0.002, 0.002],
  ], silicone)

  const pads = groups.pads
  loft(pads, [
    [-0.90, 1.01, -0.245, 0.428, 0.46],
    [-0.49, 1.01, -0.169, 0.434, 0.436],
    [0.14, 1.025, -0.074, 0.376, 0.365],
    [0.48, 1.025, -0.056, 0.336, 0.329],
  ], wrap)
  oval(pads, [0.244, 0.022, 0.092], liquid, [-0.20, 1.43, -0.15])
  const padPositions: Array<[number, number, number, number]> = [
    [-0.67, 1.412, -0.33, -0.22],
    [-0.53, 1.365, 0.064, 0.51],
    [-0.18, 1.42, -0.283, -0.48],
    [0.146, 1.34, 0.103, 0.59],
    [0.29, 1.369, -0.15, -0.26],
  ]
  padPositions.forEach(([x, y, z, tilt], i) => {
    box(pads, [0.172, 0.047, 0.155], 0.023, gold, [x, y, z]).rotation.x = tilt
    box(pads, [0.080, 0.025, 0.098], 0.011, black, [x + 0.033, y + 0.018, z + 0.068]).rotation.x = tilt
    const shift = i * 0.051
    signalPaths.push(tube(signalLines, [[x + 0.032, y + 0.024, z + 0.072], [x + 0.05, y - 0.03, z + 0.24], [x + 0.06, 1.04, 0.51], [0.64 + shift, 0.41, 1.16], [1.4 + shift, 0.422, 1.47], [1.81 + shift, 0.506, 1.47]], 0.014, signalWire))
  })

  const controller = groups.controller
  box(controller, [2.97, 0.084, 1.07], 0.053, metal, [3.05, 0.369, 1.47])
  box(controller, [1.43, 0.075, 0.99], 0.045, circuit, [2.25, 0.468, 1.46])
  box(controller, [0.39, 0.20, 0.31], 0.027, metal, [1.63, 0.55, 1.72])
  box(controller, [0.33, 0.10, 0.26], 0.017, black, [2.74, 0.535, 1.81])
  box(controller, [0.58, 0.074, 0.22], 0.017, black, [2.33, 0.545, 1.53])
  // Two pin headers and smaller components make the breakout board recognizable.
  for (const z of [1.06, 1.91]) {
    box(controller, [0.94, 0.099, 0.105], 0.02, black, [2.36, 0.536, z])
    for (let i = 0; i < 9; i++) {
      rod(controller, [1.97 + i * 0.092, 0.586, z], [1.97 + i * 0.092, 0.603, z], 0.027, gold, 8)
    }
  }
  for (const [x, z] of [[2.61, 1.21], [2.74, 1.21], [2.25, 1.28], [2.48, 1.79]]) {
    rod(controller, [x, 0.499, z], [x, 0.58, z], 0.052, metal, 12)
  }
  box(controller, [1.28, 0.106, 0.82], 0.04, plastic, [3.84, 0.466, 1.52])
  detailGrid(controller, [0.028, 0.006, 0.028], dark, [3.33, 0.522, 1.24], 12, 5, [0.092, 0.143])
  const ledColors = ['#f05854', '#5ade8c', '#ffb349', '#4fa7eb']
  const leds = ledColors.map((color, i) => {
    const material = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: 0.08, roughness: 0.28, clearcoat: 0.7 })
    const x = 3.40 + i * 0.295
    rod(controller, [x, 0.52, 1.46], [x, 0.639, 1.46], 0.026, metal, 8)
    oval(controller, [0.061, 0.094, 0.061], material, [x, 0.658, 1.46])
    return material
  })
  tube(controller, [[2.88, 0.56, 1.37], [3.08, 0.53, 1.13], [3.52, 0.532, 1.03], [3.84, 0.541, 1.20]], 0.018, black)
  tube(controller, [[2.88, 0.58, 1.45], [3.11, 0.55, 1.15], [3.69, 0.544, 1.07], [4.07, 0.542, 1.21]], 0.016, fluidTube)

  const laptop = groups.screen
  box(laptop, [2.97, 0.105, 1.61], 0.072, dark, [3.43, 0.565, -1.46])
  box(laptop, [2.82, 0.045, 1.42], 0.038, black, [3.43, 0.636, -1.46])
  box(laptop, [0.86, 0.012, 0.325], 0.020, dark, [3.43, 0.664, -0.98])
  detailGrid(laptop, [0.148, 0.029, 0.12], dark, [2.25, 0.671, -1.89], 13, 4, [0.185, 0.16])
  const lid = new THREE.Group()
  lid.position.set(3.43, 0.638, -2.195)
  lid.rotation.x = -0.16
  laptop.add(lid)
  box(lid, [2.94, 1.83, 0.118], 0.072, black, [0, 0.92, 0])
  box(lid, [2.76, 1.67, 0.016], 0.025, dark, [0, 0.91, 0.065])
  const displayMaterial = new THREE.MeshBasicMaterial({ map: screenTexture, toneMapped: false })
  mesh(lid, new THREE.PlaneGeometry(2.65, 1.53), displayMaterial, [0, 0.915, 0.075])
  oval(lid, [0.026, 0.026, 0.012], metal, [0, 1.764, 0.063])

  fluidPaths.push(
    tube(fluidLines, [[-4.15, 1.72, -1.32], [-4.11, 1.50, -1.31], [-4.28, 0.80, -0.87], [-4.90, 0.57, -0.15], [-4.94, 0.59, 0.71], [-4.58, 0.86, 1.10], [-4.18, 1.03, 1.24]], 0.057, fluidTube),
    tube(fluidLines, [[-3.62, 0.54, 1.50], [-2.91, 0.54, 1.50], [-1.88, 0.54, 1.50], [-1.31, 0.55, 1.46], [-1.10, 0.55, 1.08], [-1.75, 0.56, 0.77], [-2.63, 0.58, 0.71], [-3.65, 0.73, 0.66], [-3.92, 1.04, 0.27], [-3.79, 1.21, -0.39]], 0.049, fluidTube),
  )
  signalPaths.push(
    tube(signalLines, [[-2.9, 1.36, 1.50], [-2.9, 1.49, 1.35], [-2.52, 0.64, 0.97], [-1.31, 0.39, 1.09], [0.01, 0.39, 1.11], [1.78, 0.48, 1.19]], 0.022, signalWire),
    tube(signalLines, [[-1.94, 0.60, 1.35], [-1.76, 0.48, 1.18], [-0.82, 0.385, 0.96], [0.60, 0.40, 1.06], [1.84, 0.50, 1.24]], 0.017, signalWire),
    tube(signalLines, [[1.53, 0.55, 1.73], [1.31, 0.52, 1.79], [1.04, 0.43, 1.35], [0.84, 0.53, 0.53], [0.64, 0.58, -0.89], [1.19, 0.61, -1.36], [1.97, 0.605, -1.54]], 0.037, black),
  )

  return { root, groups, leds, fluidLines, fluidPaths, signalLines, signalPaths, displayMaterial }
}
