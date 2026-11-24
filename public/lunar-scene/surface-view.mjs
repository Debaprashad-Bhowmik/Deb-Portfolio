import { earthOrientation, loadBodyTexture, rotateBodyVector, textureOffset } from './body-textures.mjs'
import { earthRadius, observer, radius } from './planner.mjs'
import { horizonProfile, loadTerrainSampler, polarHorizon } from './terrain.mjs'
import { loadPolarGrids, polarProjection, samplePolarGrid } from './polar-shadows.mjs'
import { buildSurfaceDetail, surfaceDetailStride } from './surface-detail.mjs?v=3'
import { surfaceFocalLength } from './viewer-flight.mjs'
import { createDistantFocus, distantFocusRange } from './surface-focus.mjs?v=1.2.1'

const radians = Math.PI / 180
const spokes = 180
const globalSpacing = 1900
const walkLimit = 500
const localShadowExtent = [640, 640, 3500]
const detailShadowExtent = [48, 48, 125]
const detailTileSize = 12
const distance = [0, ...Array.from({ length: 184 }, (_, i) => (i + 1) * globalSpacing), 350_000]
const clamp = (value, low, high) => Math.max(low, Math.min(high, value))
const bearing = value => (value % 360 + 360) % 360
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0)
const earthDiskSize = 128
const regolithSize = 256
const stereoRegions = [
  { file: 'change5', product: 'NAC_DTM_CHANGE501', lat: 43.0576, lon: -51.9161 },
  { file: 'apollo12', product: 'NAC_DTM_APOLLO12', lat: -3.0128, lon: -23.4219,
    // Use the basin center visible in the DTM for aiming. Gazetteer coordinates are rounded to 0.01°.
    crater: { id: 5773, name: 'Surveyor crater', kind: 'Crater', lat: -3.0160, lon: -23.4201, diameter: .2 } },
]
const stereoRequests = new Map()
const groundRequests = new Map()
let terrainServerAvailable = false

// An unlit material with periodic relief. Elevation and reflectance at map scale come from NASA.
function regolithMaterial() {
  const size = regolithSize
  const relief = new Float32Array(size * size)
  const tone = new Float32Array(relief.length)
  const texels = new Uint8Array(relief.length * 4)
  let seed = 4073
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const index = (x, y) => (y & (size - 1)) * size + (x & (size - 1))
  for (let k = 0; k < relief.length; k++) {
    relief[k] = random() * .12
    tone[k] = .41 + random() * .22
  }
  for (let stone = 0; stone < 1250; stone++) {
    const cx = Math.floor(random() * size)
    const cy = Math.floor(random() * size)
    const extent = 1.3 + random() ** 4 * 12
    const flatten = .5 + random() * .5
    const angle = random() * Math.PI * 2
    const tint = .36 + random() * .42
    const span = Math.ceil(extent)
    for (let y = -span; y <= span; y++) {
      for (let x = -span; x <= span; x++) {
        const across = (x * Math.cos(angle) + y * Math.sin(angle)) / extent
        const along = (-x * Math.sin(angle) + y * Math.cos(angle)) / (extent * flatten)
        const edge = Math.max(Math.abs(across), Math.abs(along * .65 + across * .35), Math.abs(along * .7 - across * .3))
        if (edge >= 1) continue
        const k = index(cx + x, cy + y)
        const height = Math.min(.85, (1 - edge) * extent * .16)
        if (height > relief[k]) {
          relief[k] = height
          tone[k] = tint
        }
      }
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const k = index(x, y)
      texels[k * 4] = Math.round(tone[k] * 255)
      texels[k * 4 + 1] = Math.round(clamp(.5 + relief[index(x - 1, y)] - relief[index(x + 1, y)], 0, 1) * 255)
      texels[k * 4 + 2] = Math.round(clamp(.5 + relief[index(x, y - 1)] - relief[index(x, y + 1)], 0, 1) * 255)
      texels[k * 4 + 3] = 255
    }
  }
  return texels
}

function direction(az, el) {
  const a = az * radians
  const e = el * radians
  return [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)]
}

export function earthIllumination(sample) {
  const earth = direction(sample.earthAz, sample.earthEl)
  const sun = direction(sample.sunAz, sample.sunEl)
  const distance = earthRadius / Math.sin(sample.earthRadius)
  const earthToSun = sun.map((component, i) => component * sample.sunDistance - earth[i] * distance)
  const magnitude = Math.hypot(...earthToSun)
  const light = earthToSun.map(component => component / magnitude)
  return { light, fraction: (1 - clamp(dot(light, earth), -1, 1)) / 2 }
}

function earthIntersection(x, y, axis, radius) {
  // Intersect the camera ray with a sphere at unit distance. Its visible surface normal controls the light.
  const inverseLength = 1 / Math.hypot(x, y, 1)
  const along = (x * axis[0] + y * axis[1] + axis[2]) * inverseLength
  const discriminant = along * along - 1 + radius * radius
  if (discriminant < 0 || along <= 0) return null
  return (along - Math.sqrt(discriminant)) * inverseLength
}

export function earthDiskIncidence(x, y, axis, light, radius) {
  const distance = earthIntersection(x, y, axis, radius)
  if (distance === null) return null
  const rayLight = (x * light[0] + y * light[1] + light[2])
  return clamp((distance * rayLight - dot(axis, light)) / radius, -1, 1)
}

export function surfaceCamera(azimuth, elevation) {
  const forward = direction(azimuth, elevation)
  const right = direction(azimuth + 90, 0)
  const up = direction(azimuth + 180, 90 - elevation)
  const projectVector = point => [dot(point, right), dot(point, up), dot(point, forward)]
  return { forward, right, up, azimuth, elevation, projectVector, project: (az, el) => projectVector(direction(az, el)) }
}

export function solarShadowFrame(azimuth, elevation) {
  const camera = surfaceCamera(azimuth, elevation)
  return { right: camera.right, up: camera.up, depth: camera.forward.map(value => -value) }
}

export function nearbyCraters(site, features, spacingAt) {
  const basis = observer(site.lat, site.lon, 0)
  return features.filter(feature => feature.kind === 'Crater' && (feature.diameter >= 5 || spacingAt)).map(feature => {
    const { up } = observer(feature.lat, feature.lon, 0)
    const east = dot(up, basis.east)
    const north = dot(up, basis.north)
    const separation = radius * Math.atan2(Math.hypot(east, north), dot(up, basis.up)) / 1000
    const azimuth = separation < 1e-6 ? 0 : bearing(Math.atan2(east, north) / radians)
    const inside = separation <= feature.diameter / 2
    return { ...feature, distance: separation, bearing: azimuth, inside }
  }).filter(crater => crater.distance <= 200 &&
    (crater.diameter >= 5 || crater.diameter * 1000 >= 20 * spacingAt(crater.lat, crater.lon)))
    .sort((a, b) => Math.max(0, a.distance - a.diameter / 2) - Math.max(0, b.distance - b.diameter / 2) || a.distance - b.distance)
    .slice(0, 6)
}

export function surfaceTarget(camera, az, el, angularRadius, width, height, scale) {
  const [x, y, z] = camera.project(az, el)
  const cx = width / 2 + x / z * scale
  const cy = height / 2 - y / z * scale
  const radius = scale * Math.tan(angularRadius) / Math.max(.1, z)
  const inView = z > 0 && cx >= 0 && cx <= width && cy >= 0 && cy <= height
  const turn = bearing(az - camera.azimuth + 180) - 180
  const edge = z <= 0 || Math.abs(x / width) >= Math.abs(y / height) ? (turn < 0 ? 'left' : 'right') : (y > 0 ? 'up' : 'down')
  return { x: cx, y: cy, radius, inView, edge }
}

export function terrainVertices(site, sample, ranges = distance) {
  const phi = site.lat * radians
  const lam = site.lon * radians
  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)
  const vertices = new Float32Array(ranges.length * spokes * 3)
  let index = 0
  for (const length of ranges) {
    const arc = length / radius
    const sinArc = Math.sin(arc)
    const cosArc = Math.cos(arc)
    for (let i = 0; i < spokes; i++) {
      const angle = (i / spokes) * 2 * Math.PI
      const sinAngle = Math.sin(angle)
      const cosAngle = Math.cos(angle)
      const latitude = Math.asin(clamp(sinPhi * cosArc + cosPhi * sinArc * cosAngle, -1, 1))
      const longitude = lam + Math.atan2(sinAngle * sinArc, cosPhi * cosArc - sinPhi * sinArc * cosAngle)
      const ground = length ? sample(latitude / radians, longitude / radians, length) : site.height
      const distanceFromAxis = (radius + ground) * sinArc
      vertices[index++] = distanceFromAxis * sinAngle
      vertices[index++] = (radius + ground) * cosArc - radius - site.height - 2
      vertices[index++] = distanceFromAxis * cosAngle
    }
  }
  return vertices
}

function projectRegionalGrid(grid, lat, lon) {
  const deltaLon = bearing(lon - grid.centralMeridian + 180) - 180
  return {
    x: grid.falseEasting + deltaLon * radians * grid.radius * Math.cos(grid.standardParallel * radians),
    y: grid.falseNorthing + (lat - grid.latitudeOfOrigin) * radians * grid.radius,
  }
}

export function surfaceTerrainSampler(globalHeight, polarGrids, regionalGrids = []) {
  const grids = [...polarGrids, ...regionalGrids].sort((a, b) => b.spacing - a.spacing)
  function elevationAt(lat, lon) {
    let height = globalHeight(lat, lon)
    let bestGrid
    if (!grids.length) return { height, grid: bestGrid }
    const polar = polarGrids.length ? polarProjection(lat, lon) : null
    for (const grid of grids) {
      const regional = grid.centralMeridian !== undefined
      const { x, y } = regional ? projectRegionalGrid(grid, lat, lon) : polar
      const meters = samplePolarGrid(grid, x, y)
      if (meters === null) continue
      const fromLeft = (x - grid.left) / grid.spacing - .5
      const fromTop = (grid.top - y) / grid.spacing - .5
      const edge = Math.min(fromLeft, fromTop, grid.width - 1 - fromLeft, grid.height - 1 - fromTop)
      // Blend at the edge of the detailed window to avoid an artificial ridge.
      const fraction = clamp(edge / (regional ? 240 / grid.spacing : 8), 0, 1)
      const weight = fraction * fraction * (3 - 2 * fraction)
      height += (meters - height) * weight
      if (weight >= .5) bestGrid = grid
    }
    return { height, grid: bestGrid }
  }
  return {
    height: (lat, lon) => elevationAt(lat, lon).height,
    spacingAt: (lat, lon) => elevationAt(lat, lon).grid?.spacing ?? globalSpacing,
    gridAt: (lat, lon) => elevationAt(lat, lon).grid,
  }
}

function surfaceRanges(spacing) {
  if (spacing === globalSpacing) return distance
  const ranges = [0]
  const segments = spacing < 10
    ? [[130, Math.round(spacing)], [350, 5], [1120, 20], [3500, 60], [25000, 360], [350_000, 2900]]
    : [[500, clamp(spacing, 10, 50)], [5000, clamp(spacing, 80, 240)],
      [25000, clamp(spacing, 240, 960)], [350_000, 1900]]
  for (const [end, step] of segments) {
    for (let range = ranges.at(-1) + step; range < end; range += step) ranges.push(range)
    ranges.push(end)
  }
  return ranges
}

function indexTerrain(count) {
  const faces = []
  for (let base = 0; base < count - spokes; base += spokes) {
    for (let i = 0; i < spokes; i++) {
      const a = base + i
      const b = base + (i + 1) % spokes
      faces.push(a, b, a + spokes, b, b + spokes, a + spokes)
    }
  }
  return new Uint16Array(faces)
}

export function terrainGroundAt(mesh, east, north) {
  if (east === 0 && north === 0) return mesh[1]
  const sector = bearing(Math.atan2(east, north) / radians) / (360 / spokes)
  const spoke = Math.floor(sector)
  const next = (spoke + 1) % spokes
  const ringSize = spokes * 3
  function heightInTriangle(a, b, c) {
    const abx = mesh[b] - mesh[a]
    const abz = mesh[b + 2] - mesh[a + 2]
    const acx = mesh[c] - mesh[a]
    const acz = mesh[c + 2] - mesh[a + 2]
    const x = east - mesh[a]
    const z = north - mesh[a + 2]
    const area = abx * acz - abz * acx
    if (Math.abs(area) < 1e-8) return null
    const u = (x * acz - z * acx) / area
    const v = (z * abx - x * abz) / area
    if (u < -1e-5 || v < -1e-5 || u + v > 1 + 1e-5) return null
    return mesh[a + 1] * (1 - u - v) + mesh[b + 1] * u + mesh[c + 1] * v
  }
  const range = Math.hypot(east, north)
  for (let base = 0; base + ringSize < mesh.length; base += ringSize) {
    const a = base + spoke * 3
    const b = base + next * 3
    const c = a + ringSize
    const d = b + ringSize
    if (range > Math.max(Math.hypot(mesh[c], mesh[c + 2]), Math.hypot(mesh[d], mesh[d + 2])) + 1e-4) continue
    const height = heightInTriangle(a, b, c) ?? heightInTriangle(b, d, c)
    if (height !== null) return height
  }
  return null
}

function terrainNormals(mesh) {
  const normals = new Float32Array(mesh.length)
  const rings = mesh.length / (3 * spokes)
  for (let ring = 1; ring < rings; ring++) {
    for (let spoke = 0; spoke < spokes; spoke++) {
      const index = (ring * spokes + spoke) * 3
      const inner = index - spokes * 3
      const outer = ring === rings - 1 ? index : index + spokes * 3
      const left = (ring * spokes + (spoke + spokes - 1) % spokes) * 3
      const right = (ring * spokes + (spoke + 1) % spokes) * 3
      const x = mesh[outer] - mesh[inner]
      const y = mesh[outer + 1] - mesh[inner + 1]
      const z = mesh[outer + 2] - mesh[inner + 2]
      const dx = mesh[right] - mesh[left]
      const dy = mesh[right + 1] - mesh[left + 1]
      const dz = mesh[right + 2] - mesh[left + 2]
      const normal = [y * dz - z * dy, z * dx - x * dz, x * dy - y * dx]
      const length = Math.hypot(...normal)
      normals.set(length ? normal.map(component => component / length) : [0, 1, 0], index)
    }
  }
  const center = [0, 0, 0]
  for (let spoke = 0; spoke < spokes; spoke++) {
    const index = (spokes + spoke) * 3
    for (let axis = 0; axis < 3; axis++) center[axis] += normals[index + axis]
  }
  const length = Math.hypot(...center)
  const siteNormal = length ? center.map(component => component / length) : [0, 1, 0]
  for (let spoke = 0; spoke < spokes; spoke++) normals.set(siteNormal, spoke * 3)
  return normals
}

const detailPlacement = `
attribute vec2 detailPlacement;
uniform vec3 cameraPosition;
float detailCoverage(vec3 point) {
  return detailPlacement.x<=0.0?1.0:1.0-smoothstep(detailPlacement.x*.65,detailPlacement.x,length(point.xz-cameraPosition.xz));
}
vec3 placedDetail(vec3 point) {
  if (detailPlacement.x<=0.0) return point;
  // Only synthetic stones settle into their measured support at far distance.
  // Ground elevations and full-size near rocks are untouched; no noisy holes.
  return vec3(point.x,mix(detailPlacement.y-.005,point.y,detailCoverage(point)),point.z);
}
`
const vertex = `
attribute vec3 position, normal;
attribute float stoneTone;
uniform vec3 cameraRight, cameraUp, cameraForward;
uniform vec2 lens;
varying vec3 terrain;
varying vec3 groundNormal;
varying float stone;
varying float fadeRange;
${detailPlacement}
void main() {
  terrain = placedDetail(position);
  groundNormal = detailPlacement.x>0.0?normalize(vec3(normal.x,normal.y/max(.001,detailCoverage(position)),normal.z)):normal;
  stone = stoneTone;
  fadeRange = detailPlacement.x;
  vec3 view = terrain - cameraPosition;
  float z = dot(view, cameraForward);
  // The landing-point vertex can lie exactly on the camera plane. Keep its
  // clip-space w nonzero so clipping preserves the ground texture interpolation.
  if (abs(z) < .001) z = .001;
  gl_Position = vec4(dot(view, cameraRight) * lens.x, dot(view, cameraUp) * lens.y,
                     z * 1.000003 - 2.0, z);
}`
const detailFade = `
varying float fadeRange;
uniform vec3 cameraPosition;
bool fadedDetail() {
  if (fadeRange <= 0.0) return false;
  float coverage = 1.0 - smoothstep(fadeRange*.65,fadeRange,length(terrain.xz-cameraPosition.xz));
  if (coverage >= 1.0) return false;
  return coverage <= .001;
}
`
const fragment = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform vec3 sunDirection;
uniform float daylight, inkStyle;
uniform float outputDepth;
uniform vec3 cameraForward;
uniform vec3 siteEast, siteNorth, siteUp;
uniform float siteRadius;
uniform vec3 shadowRight, shadowUp, shadowDepth, shadowExtent, localShadowExtent;
uniform vec3 detailShadowExtent, detailShadowCenter;
uniform sampler2D albedoMap, shadowMap, localShadowMap, regolithMap, dustMap, detailShadowMap;
uniform float shadowPixel, localShadowPixel, detailShadowPixel;
varying vec3 terrain;
varying vec3 groundNormal;
varying float stone;
${detailFade}
vec4 terrainColor(vec3 color) {
  float depth=max(0.0,dot(terrain-cameraPosition,cameraForward));
  float encodedDepth=.0625+log2(1.0+depth)/20.0;
  return vec4(color,outputDepth>.5?clamp(encodedDepth,.0625,1.0):1.0);
}
const float pi = 3.14159265359;
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}
float grain(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(cell), hash(cell + vec2(1,0)), f.x),
    mix(hash(cell + vec2(0,1)), hash(cell + 1.0), f.x), f.y);
}
vec2 receiverDepthGradient(vec3 uv) {
  vec3 dx = dFdx(uv);
  vec3 dy = dFdy(uv);
  float determinant = dx.x * dy.y - dx.y * dy.x;
  if (abs(determinant) < 1e-14) return vec2(0.0);
  return clamp(vec2(dx.z * dy.y - dy.z * dx.y, dx.x * dy.z - dy.x * dx.z) / determinant,
    vec2(-16.0), vec2(16.0));
}

float shadowVisibility(sampler2D map, vec3 uv, float pixelSize, float bias, vec2 depthGradient) {
  if (pixelSize <= 0.0) return 1.0;
  if (any(lessThan(uv, vec3(0))) || any(greaterThan(uv, vec3(1)))) return 1.0;
  float depth = uv.z - bias;
  vec2 texel = uv.xy / pixelSize - .5;
  vec2 fraction = fract(texel);
  vec2 center = (floor(texel) + .5) * pixelSize;
  float sum = 0.0;
  for (int x = -1; x <= 2; x++) {
    for (int y = -1; y <= 2; y++) {
      vec2 offset = vec2(float(x),float(y));
      vec2 tap = center + offset * pixelSize;
      vec3 pixel = texture2D(map, tap).rgb;
      float occluder = dot(pixel, vec3(1.0, 1.0/255.0, 1.0/65025.0));
      vec2 weight = min(vec2(1.0), 2.0 - abs(offset - fraction));
      sum += step(depth + dot(depthGradient, tap - uv.xy), occluder) * weight.x * weight.y;
    }
  }
  return sum / 9.0;
}

float shadow(vec3 normal) {
  vec3 lightPoint = vec3(dot(terrain, shadowRight), dot(terrain, shadowUp), dot(terrain, shadowDepth));
  vec3 regional = lightPoint / shadowExtent * .5 + .5;
  vec2 regionalGradient = receiverDepthGradient(regional);
  float useLocal = 1.0 - smoothstep(480.0, 620.0, length(terrain.xz));
  if (localShadowPixel <= 0.0 || useLocal <= 0.0) {
    return shadowVisibility(shadowMap, regional, shadowPixel, 40.0 / (2.0 * shadowExtent.z), regionalGradient);
  }
  // Use a continuous receiver slope across triangles. Lift the shadow lookup
  // by less than a local texel to keep grazing light from shadowing its own mesh.
  vec3 lightNormal = vec3(dot(normal, shadowRight), dot(normal, shadowUp), dot(normal, shadowDepth));
  vec3 local = (lightPoint + .45 * lightNormal) / localShadowExtent * .5 + .5;
  vec2 localGradient = -lightNormal.xy * localShadowExtent.xy /
    (min(lightNormal.z, -.025) * localShadowExtent.z);
  float rim = shadowVisibility(localShadowMap, local, localShadowPixel, .45 / (2.0 * localShadowExtent.z), localGradient);
  // The regional pass only supplies casters upstream of the local depth volume.
  float distantBias = (lightPoint.z + localShadowExtent.z) / (2.0 * shadowExtent.z);
  float distant = shadowVisibility(shadowMap, regional, shadowPixel, distantBias, vec2(0.0));
  if (useLocal >= 1.0) return min(rim, distant);
  float broad = shadowVisibility(shadowMap, regional, shadowPixel, 40.0 / (2.0 * shadowExtent.z), regionalGradient);
  return mix(broad, min(rim, distant), useLocal);
}

float detailVisibility(vec3 normal) {
  vec3 relative = terrain - detailShadowCenter;
  float surroundings = 1.0 - smoothstep(24.0, 34.0, length(relative.xz));
  if (detailShadowPixel <= 0.0 || surroundings <= 0.0) return 1.0;
  vec3 lightNormal = vec3(dot(normal,shadowRight), dot(normal,shadowUp), dot(normal,shadowDepth));
  vec3 lightPoint = vec3(dot(relative,shadowRight), dot(relative,shadowUp), dot(relative,shadowDepth));
  vec3 uv = (lightPoint + .010 * lightNormal) / detailShadowExtent * .5 + .5;
  if (any(lessThan(uv, vec3(0))) || any(greaterThan(uv, vec3(1)))) return 1.0;
  vec2 gradient = -lightNormal.xy * detailShadowExtent.xy / (min(lightNormal.z, -.04) * detailShadowExtent.z);
  vec2 grid = uv.xy / detailShadowPixel - .5;
  vec2 fraction = fract(grid);
  vec2 center = (floor(grid) + .5) * detailShadowPixel;
  float visible = 0.0;
  for (int x = 0; x < 2; x++) {
    for (int y = 0; y < 2; y++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 tap = center + offset * detailShadowPixel;
      vec3 pixel = texture2D(detailShadowMap, tap).rgb;
      float occluder = dot(pixel, vec3(1.0, 1.0/255.0, 1.0/65025.0));
      float receiver = uv.z - .025 / (2.0 * detailShadowExtent.z) + dot(gradient, tap - uv.xy);
      vec2 weight = 1.0 - abs(offset - fraction);
      visible += step(receiver, occluder) * weight.x * weight.y;
    }
  }
  return mix(1.0, visible, surroundings);
}

float celStep(float value, float threshold) {
  float width = clamp(fwidth(value) * .6, .025, .09);
  return smoothstep(threshold - width, threshold + width, value);
}

vec3 celColor(vec3 normal, vec3 relief, float sunVisibility, float reflectance, float detail) {
  const vec3 fillDirection = vec3(-.50,.76,.42);
  float facing = dot(normal, fillDirection);
  float plane = clamp(.15 + .58 * facing, 0.0, 1.0);
  vec3 shaded = mix(vec3(.075,.087,.159), vec3(.162,.19,.30), celStep(plane,.49));
  shaded = mix(shaded, vec3(.29,.32,.44), celStep(plane,.70) * .65);
  shaded *= mix(.70,1.15,smoothstep(.28,.98,facing));
  float incidence = max(0.0, dot(normal, sunDirection));
  float beam = sqrt(incidence);
  vec3 sunlit = mix(vec3(.44,.425,.51), vec3(.64,.58,.53), celStep(beam,.20));
  sunlit = mix(sunlit, vec3(.77,.715,.64), celStep(beam,.43));
  sunlit = mix(sunlit, vec3(.89,.835,.75), celStep(beam,.67));
  sunlit *= mix(.83,1.16,beam);

  // Geometry and cast shadows select the cel bands. Material grain adds
  // continuous shading within a band so small stones cannot create stripes.
  float illuminated = sunVisibility * smoothstep(0.0,.045,incidence);
  vec3 color = mix(shaded, sunlit, illuminated);
  vec3 grainNormal = normalize(normal + relief * .85);
  float grainLight = dot(grainNormal - normal, mix(fillDirection, sunDirection, illuminated));
  float tone = .78 + reflectance * .44 + clamp(detail,-.38,.38) * .78 + grainLight * .85;
  return color * clamp(tone,.55,1.36);
}

void main() {
  if (fadedDetail()) discard;
  vec3 n = normalize(groundNormal);
  vec3 point = normalize(siteUp * (siteRadius + terrain.y) + siteEast * terrain.x + siteNorth * terrain.z);
  vec2 uv = vec2(atan(point.y, point.x) / (2.0*pi) + .5, .5 - asin(clamp(point.z,-1.0,1.0)) / pi);
  float reflectance = dot(texture2D(albedoMap, uv).rgb, vec3(.299,.587,.114));
  vec2 local = terrain.xz;
  vec3 grit = texture2D(regolithMap, local / 2.0).rgb;
  vec3 fragments = texture2D(regolithMap, local / 28.0 + vec2(.29,.53)).rgb;
  float footprint = max(length(dFdx(local)),length(dFdy(local)));
  float fine = 1.0 - smoothstep(.25,1.4,footprint);
  float coarse = 1.0 - smoothstep(1.0,6.0,footprint);
  float patches = (grain(local*.009)-.5) * (1.0-smoothstep(30.0,115.0,footprint));
  vec2 dustRelief = (grit.gb - .5) * .52 * fine + (fragments.gb - .5) * .42 * coarse;
  vec3 relief = vec3(dustRelief.x, 0.0, dustRelief.y);
  float direct = daylight > 0.0 ? min(shadow(n), detailVisibility(n)) : 0.0;
  const mat2 rotation = mat2(.8,.6,-.6,.8);

  float nearDust = texture2D(dustMap, local / 2.0).r;
  float coarseDust = texture2D(dustMap, rotation * local / 19.0 + vec2(.35,.81)).r;
  float fineDetail = (grit.r - .51) * .34 + (nearDust - .36) * .82;
  float coarseDetail = (fragments.r - .51) * .18 + (coarseDust - .36) * .30;
  float detail = fineDetail * fine + coarseDetail * coarse + patches * .10;
  float material = 1.0;
  if (stone > 0.0) {
    // Blend projections on three axes: vertical stone faces must not inherit
    // stretched, top-down ground texels. Detail is locked to local position.
    vec3 weight = pow(abs(n), vec3(4.0));
    weight /= max(.001, weight.x + weight.y + weight.z);
    vec3 rx = texture2D(regolithMap, terrain.zy / 1.3).rgb;
    vec3 ry = texture2D(regolithMap, terrain.xz / 1.3).rgb;
    vec3 rz = texture2D(regolithMap, terrain.xy / 1.3).rgb;
    vec3 chips = rx * weight.x + ry * weight.y + rz * weight.z;
    float mottling = texture2D(dustMap, terrain.zy / .65).r * weight.x
      + texture2D(dustMap, terrain.xz / .65).r * weight.y
      + texture2D(dustMap, terrain.xy / .65).r * weight.z;
    relief = (vec3(0.0, rx.b-.5, rx.g-.5) * weight.x
      + vec3(ry.g-.5, 0.0, ry.b-.5) * weight.y
      + vec3(rz.g-.5, rz.b-.5, 0.0) * weight.z) * .72 * fine;
    relief -= n * dot(n, relief);
    material = stone * .90;
    detail = ((chips.r - .51) * .8 + (mottling - .36) * .9) * fine;

  }
  if (inkStyle > .5) {
    gl_FragColor = terrainColor(celColor(n, relief, direct, reflectance, detail + patches * .16) * material);
    return;
  }
  vec3 textured = normalize(n + relief * .25);
  float lit = max(0.0, dot(textured, sunDirection)) * direct;
  float albedo = (.20 + reflectance*.83) * clamp(1.0 + detail*.38, .8, 1.18) * material;
  // Display exposure and a faint fill preserve shape in modeled shadow.
  float exposure = mix(1.88, 1.48, smoothstep(.02,.6,sunDirection.y));
  vec3 shade = vec3(.031,.034,.041) + vec3(1.03,1.0,.97) * (exposure * pow(lit,.55));
  vec3 exposed = albedo * shade;
  gl_FragColor = terrainColor(exposed / (1.0 + exposed * .38));
}`

const shadowVertex = `
attribute vec3 position;
varying vec3 terrain;
varying float fadeRange;
uniform vec3 shadowRight, shadowUp, shadowDepth, shadowExtent, shadowCenter;
${detailPlacement}
void main() {
  terrain=placedDetail(position);
  fadeRange=detailPlacement.x;
  vec3 relative = terrain - shadowCenter;
  gl_Position = vec4(vec3(dot(relative,shadowRight),dot(relative,shadowUp),dot(relative,shadowDepth)) / shadowExtent, 1.0);
}`
const shadowFragment = `
precision highp float;
varying vec3 terrain;
${detailFade}
void main() {
  if (fadedDetail()) discard;
  vec3 depth = fract(gl_FragCoord.z * vec3(1.0, 255.0, 65025.0));
  depth.xy -= depth.yz / 255.0;
  gl_FragColor = vec4(depth, 1.0);
}`

function terrainProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram()
  for (const [kind, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
    const shader = gl.createShader(kind)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('The 3D terrain renderer could not start. Use the skyline plot.')
    gl.attachShader(program, shader)
  }
  gl.bindAttribLocation(program, 0, 'position')
  gl.bindAttribLocation(program, 1, 'normal')
  gl.bindAttribLocation(program, 2, 'stoneTone')
  gl.bindAttribLocation(program, 3, 'detailPlacement')
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('The 3D terrain renderer could not start. Use the skyline plot.')
  return program
}

export function createSurfaceView(canvas, skyCanvas, overlay, showHeading) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
  const sky = skyCanvas.getContext('2d')
  const ctx = overlay.getContext('2d')
  if (!gl || !sky || !ctx || !gl.getExtension('OES_standard_derivatives')) throw new Error('3D terrain is unavailable in this browser. Use the skyline plot.')
  const program = terrainProgram(gl, vertex, fragment)
  const shadowProgram = terrainProgram(gl, shadowVertex, shadowFragment)
  const distantFocus = createDistantFocus(gl)
  const shadowNames = ['shadowRight', 'shadowUp', 'shadowDepth', 'shadowExtent']
  const locations = (owner, names) => Object.fromEntries(names.map(name => [name, gl.getUniformLocation(owner, name)]))
  const uniforms = locations(program, ['cameraRight', 'cameraUp', 'cameraForward', 'cameraPosition', 'lens', 'sunDirection', 'daylight', 'inkStyle',
    'siteEast', 'siteNorth', 'siteUp', 'siteRadius', 'albedoMap', 'shadowMap', 'localShadowMap', 'regolithMap', 'dustMap',
    'shadowPixel', 'localShadowPixel', 'localShadowExtent', 'detailShadowMap', 'detailShadowPixel', 'detailShadowExtent',
    'detailShadowCenter', 'outputDepth', ...shadowNames])
  const shadowUniforms = locations(shadowProgram, [...shadowNames, 'shadowCenter', 'cameraPosition'])
  const vertices = gl.createBuffer()
  const normals = gl.createBuffer()
  const elements = gl.createBuffer()
  const detailBuffer = gl.createBuffer()
  function bindTerrain() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, normals)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
    gl.disableVertexAttribArray(2)
    gl.vertexAttrib1f(2, 0)
    gl.disableVertexAttribArray(3)
    gl.vertexAttrib2f(3, 0, 0)
  }
  function bindDetail() {
    const bytes = Float32Array.BYTES_PER_ELEMENT
    const stride = surfaceDetailStride * bytes
    gl.bindBuffer(gl.ARRAY_BUFFER, detailBuffer)
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0)
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 3 * bytes)
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 6 * bytes)
    gl.enableVertexAttribArray(2)
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, stride, 7 * bytes)
    gl.enableVertexAttribArray(3)
  }
  gl.useProgram(program)
  gl.enableVertexAttribArray(0)
  gl.enableVertexAttribArray(1)
  bindTerrain()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements)
  gl.enable(gl.DEPTH_TEST)
  const albedo = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, albedo)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([122, 122, 122, 255]))
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const shadowSize = Math.min(2048, gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE))
  const detailShadowSize = Math.min(3072, gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE))
  function createShadowTarget(unit, size = shadowSize) {
    const target = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, target)
    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0)
    const buffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, buffer)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buffer)
    const ready = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return ready ? target : null
  }
  const regionalTarget = createShadowTarget(1)
  const localTarget = createShadowTarget(3)
  const detailTarget = createShadowTarget(5, detailShadowSize)
  const anisotropy = gl.getExtension('EXT_texture_filter_anisotropic')
  function uploadMaterial(unit, texture, size, data) {
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    if (size) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    if (anisotropy) gl.texParameterf(gl.TEXTURE_2D, anisotropy.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT)))
  }
  const groundDust = gl.createTexture()
  uploadMaterial(2, gl.createTexture(), regolithSize, regolithMaterial())
  uploadMaterial(4, groundDust, 1, new Uint8Array([92, 92, 92, 255]))
  gl.uniform1i(uniforms.albedoMap, 0)
  gl.uniform1i(uniforms.shadowMap, 1)
  gl.uniform1i(uniforms.localShadowMap, 3)
  gl.uniform1i(uniforms.regolithMap, 2)
  gl.uniform1i(uniforms.dustMap, 4)
  gl.uniform1i(uniforms.detailShadowMap, 5)
  gl.uniform1f(uniforms.shadowPixel, regionalTarget ? 1 / shadowSize : 0)
  gl.uniform1f(uniforms.localShadowPixel, localTarget ? 1 / shadowSize : 0)
  gl.uniform3fv(uniforms.localShadowExtent, localShadowExtent)
  gl.uniform1f(uniforms.detailShadowPixel, detailTarget ? 1 / detailShadowSize : 0)
  gl.uniform3fv(uniforms.detailShadowExtent, detailShadowExtent)

  let sample
  let count = 0
  let terrainMesh
  let siteFrame
  let detailCenter
  let detailCount = 0
  let detailShadowSample
  let walkEast = 0
  let walkNorth = 0
  let groundHeight = -2
  let azimuth = 0
  let elevation = 1
  let flying = false
  let cameraHeight = 2
  let zoom = 1
  let illustrated = true
  let softDistance = true
  let drag
  let paths
  let shadowSample
  const earthDisk = document.createElement('canvas')
  earthDisk.width = earthDisk.height = earthDiskSize
  const earthContext = earthDisk.getContext('2d')
  const earthPixels = earthContext.createImageData(earthDiskSize, earthDiskSize)
  let earthTexture
  let earthFrame
  void loadBodyTexture('./assets/earth-clouds.webp').then(texture => {
    earthTexture = texture
    draw()
  })
  const moonPhoto = new Image()
  const dustPhoto = new Image()
  dustPhoto.addEventListener('load', () => {
    uploadMaterial(4, groundDust, 0, dustPhoto)
    draw()
  })
  dustPhoto.src = new URL('./assets/lunar-regolith.webp', import.meta.url).href
  moonPhoto.addEventListener('load', () => {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, albedo)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, moonPhoto)
    if (moonPhoto.naturalWidth === 4096) {
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    }
    draw()
  })
  moonPhoto.src = new URL(gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096 ? './assets/moon-color-4k.webp' : './assets/moon-color.jpg', import.meta.url).href

  function drawEarth(limb, camera, scale, width, height) {
    const xs = limb.map(([x]) => x)
    const ys = limb.map(([, y]) => y)
    const left = Math.min(...xs)
    const top = Math.min(...ys)
    const diskWidth = Math.max(...xs) - left
    const diskHeight = Math.max(...ys) - top
    const axis = camera.project(sample.earthAz, sample.earthEl)
    const light = camera.projectVector(earthIllumination(sample).light)
    const radius = Math.sin(sample.earthRadius)
    const basis = earthFrame?.map(axis => camera.projectVector(axis))
    const image = basis && earthTexture
    const shaded = earthPixels.data
    const fallbackColor = [139, 184, 251]
    for (let row = 0; row < earthDiskSize; row++) {
      const y = (height / 2 - top - diskHeight * (row + .5) / earthDiskSize) / scale
      for (let col = 0; col < earthDiskSize; col++) {
        const x = (left + diskWidth * (col + .5) / earthDiskSize - width / 2) / scale
        const offset = (row * earthDiskSize + col) * 4
        const intersection = earthIntersection(x, y, axis, radius)
        shaded[offset + 3] = intersection === null ? 0 : 255
        if (intersection === null) continue
        const nx = (x * intersection - axis[0]) / radius
        const ny = (y * intersection - axis[1]) / radius
        const nz = (intersection - axis[2]) / radius
        const incidence = nx * light[0] + ny * light[1] + nz * light[2]
        const twilight = clamp((incidence + .13) / .20, 0, 1)
        const fade = twilight * twilight * (3 - 2 * twilight)
        const brightness = .025 + .075 * fade + .9 * Math.sqrt(Math.max(0, incidence))
        const saturation = .2 + .8 * fade
        const channels = image?.data ?? fallbackColor
        const index = image ? textureOffset(image,
          nx * basis[0][0] + ny * basis[0][1] + nz * basis[0][2],
          nx * basis[1][0] + ny * basis[1][1] + nz * basis[1][2],
          nx * basis[2][0] + ny * basis[2][1] + nz * basis[2][2]) : 0
        const gray = .2126 * channels[index] + .7152 * channels[index + 1] + .0722 * channels[index + 2]
        for (let channel = 0; channel < 3; channel++) {
          shaded[offset + channel] = brightness * (gray + saturation * (channels[index + channel] - gray))
        }
      }
    }
    earthContext.putImageData(earthPixels, 0, 0)
    sky.drawImage(earthDisk, left, top, diskWidth, diskHeight)
  }

  function updateDetail() {
    const east = Math.round(walkEast / detailTileSize) * detailTileSize
    const north = Math.round(walkNorth / detailTileSize) * detailTileSize
    if (detailCenter?.[0] === east && detailCenter[2] === north) return
    const heightAt = (x, z) => terrainGroundAt(terrainMesh, x, z)
    detailCenter = [east, heightAt(east, north) ?? groundHeight, north]
    const mesh = buildSurfaceDetail(siteFrame, east, north, heightAt)
    gl.bindBuffer(gl.ARRAY_BUFFER, detailBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.DYNAMIC_DRAW)
    detailCount = mesh.length / surfaceDetailStride
    detailShadowSample = null
  }

  function prepareShadowTarget(target, size, extent, center) {
    gl.uniform3fv(shadowUniforms.shadowExtent, extent)
    gl.uniform3fv(shadowUniforms.shadowCenter, center)
    gl.bindFramebuffer(gl.FRAMEBUFFER, target)
    gl.viewport(0, 0, size, size)
    gl.clearColor(1, 1, 1, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  }

  function drawShadows() {
    const refreshTerrain = (regionalTarget || localTarget) && shadowSample !== sample
    const refreshDetail = detailTarget && detailShadowSample !== sample
    if (sample.eclipse || (!refreshTerrain && !refreshDetail)) return
    const frame = solarShadowFrame(sample.sunAz, sample.sunEl)
    const width = 390_000
    const height = 40_000 + width * Math.abs(Math.sin(sample.sunEl * radians))
    for (const [owner, bindings] of [[shadowProgram, shadowUniforms], [program, uniforms]]) {
      gl.useProgram(owner)
      gl.uniform3fv(bindings.shadowRight, frame.right)
      gl.uniform3fv(bindings.shadowUp, frame.up)
      gl.uniform3fv(bindings.shadowDepth, frame.depth)
      gl.uniform3f(bindings.shadowExtent, width, height, width)
    }
    gl.useProgram(shadowProgram)
    gl.uniform3f(shadowUniforms.cameraPosition, walkEast, groundHeight + cameraHeight, walkNorth)
    if (refreshTerrain) {
      bindTerrain()
      for (const [target, extent] of [[regionalTarget, [width, height, width]], [localTarget, localShadowExtent]]) {
        if (!target) continue
        prepareShadowTarget(target, shadowSize, extent, [0, 0, 0])
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
      }
      shadowSample = sample
    }
    if (refreshDetail) {
      bindDetail()
      prepareShadowTarget(detailTarget, detailShadowSize, detailShadowExtent, detailCenter)
      gl.drawArrays(gl.TRIANGLES, 0, detailCount)
      detailShadowSample = sample
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  function draw() {
    const { clientWidth: width, clientHeight: height } = canvas
    if (!sample || !count || !width || !height || canvas.closest('.viewer-layer')?.inert) return
    const pixel = flying ? Math.min(1,1280/Math.max(width,height)) : Math.min(devicePixelRatio || 1, 2)
    const pixelWidth = Math.round(width * pixel)
    const pixelHeight = Math.round(height * pixel)
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = skyCanvas.width = overlay.width = pixelWidth
      canvas.height = skyCanvas.height = overlay.height = pixelHeight
    }
    const camera = surfaceCamera(azimuth, elevation)
    const scale = surfaceFocalLength(width, height, zoom)
    updateDetail()
    drawShadows()
    const focused = !flying && distantFocus?.begin(pixelWidth,pixelHeight)
    gl.useProgram(program)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniform3fv(uniforms.cameraRight, camera.right)
    gl.uniform3fv(uniforms.cameraUp, camera.up)
    gl.uniform3fv(uniforms.cameraForward, camera.forward)
    gl.uniform3f(uniforms.cameraPosition, walkEast, groundHeight + cameraHeight, walkNorth)
    gl.uniform2f(uniforms.lens, 2 * scale / width, 2 * scale / height)
    gl.uniform3fv(uniforms.sunDirection, direction(sample.sunAz, sample.sunEl))
    gl.uniform1f(uniforms.daylight, sample.eclipse ? 0 : 1)
    gl.uniform1f(uniforms.inkStyle, Number(illustrated))
    gl.uniform1f(uniforms.outputDepth, Number(!!focused))
    gl.uniform3fv(uniforms.detailShadowCenter, detailCenter)
    bindTerrain()
    gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0)
    if (detailCount) {
      bindDetail()
      gl.drawArrays(gl.TRIANGLES, 0, detailCount)
    }
    if (focused) distantFocus.finish(pixelWidth,pixelHeight,pixel,distantFocusRange(cameraHeight,zoom),softDistance)

    sky.setTransform(pixel, 0, 0, pixel, 0, 0)
    sky.clearRect(0, 0, width, height)
    ctx.setTransform(pixel, 0, 0, pixel, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.font = '700 13px DM Sans, sans-serif'
    ctx.textBaseline = 'middle'
    const colors = { sun: '#ffc975', earth: '#acc4ff' }
    function project(point) {
      const [x, y, depth] = camera.projectVector(point)
      if (depth <= .12) return null
      return [width / 2 + x / depth * scale, height / 2 - y / depth * scale]
    }
    if (paths) {
      ctx.setLineDash([4, 5])
      ctx.lineWidth = 1.3
      ctx.globalAlpha = .67
      for (const [body, points] of Object.entries(paths)) {
        ctx.beginPath()
        let connected = false
        for (const direction of points) {
          const position = project(direction)
          if (position) {
            if (connected) ctx.lineTo(...position)
            else ctx.moveTo(...position)
          }
          connected = Boolean(position)
        }
        ctx.strokeStyle = colors[body]
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.setLineDash([])
    }
    const status = {}
    for (const [body, name, az, el, angle, horizon, eclipsed] of [
      ['sun', 'Sun', sample.sunAz, sample.sunEl, sample.sunRadius, sample.sunHorizon, sample.eclipse],
      ['earth', 'Earth', sample.earthAz, sample.earthEl, sample.earthRadius, sample.earthHorizon, false],
    ]) {
      const target = surfaceTarget(camera, az, el, angle, width, height, scale)
      status[body] = target
      if (!target.inView) continue
      const { x: cx, y: cy } = target
      const axis = direction(az, el)
      const horizontal = direction(az + 90, 0)
      const vertical = direction(az + 180, 90 - el)
      const sin = Math.sin(angle)
      const cos = Math.cos(angle)
      const color = colors[body]
      const visible = el > horizon && !eclipsed
      // Away from the landing point, the terrain drawn in front of the sky occludes the disk.
      const visualHorizon = walkEast || walkNorth ? -90 : horizon
      const vectors = Array.from({ length: 32 }, (_, i) => {
        const roll = i * Math.PI / 16
        return axis.map((v, j) => cos * v + sin * (Math.cos(roll) * horizontal[j] + Math.sin(roll) * vertical[j]))
      })
      const limb = vectors.map(project).filter(Boolean)
      function traceDisk(targetContext, points) {
        targetContext.beginPath()
        targetContext.moveTo(...points[0])
        for (const point of points.slice(1)) targetContext.lineTo(...point)
        targetContext.closePath()
      }
      if (!limb.length) continue
      let exposed = limb
      if (Math.abs(el - visualHorizon) < angle / radians) {
        const cutoff = Math.sin(visualHorizon * radians)
        exposed = vectors.flatMap((from, i) => {
          const to = vectors[(i + 1) % vectors.length]
          const above = from[1] >= cutoff
          const points = above ? [from] : []
          if (above !== (to[1] >= cutoff)) {
            const fraction = (cutoff - from[1]) / (to[1] - from[1])
            points.push(from.map((v, j) => v + (to[j] - v) * fraction))
          }
          return points
        }).map(project).filter(Boolean)
      }
      if (!eclipsed && exposed.length && el + angle / radians > visualHorizon) {
        if (body === 'sun') {
          if (visible) {
            const reach = clamp(target.radius * 16, 22, 76)
            const bloom = sky.createRadialGradient(cx, cy, target.radius * .5, cx, cy, reach)
            bloom.addColorStop(0, 'rgba(255,238,203,.66)')
            bloom.addColorStop(.15, 'rgba(247,212,165,.24)')
            bloom.addColorStop(.44, 'rgba(233,183,135,.068)')
            bloom.addColorStop(1, 'rgba(232,171,112,0)')
            sky.fillStyle = bloom
            sky.fillRect(cx - reach, cy - reach, reach * 2, reach * 2)
          }
          traceDisk(sky, exposed)
          sky.fillStyle = '#fff9e9'
          sky.fill()
        } else {
          sky.save()
          traceDisk(sky, exposed)
          sky.clip()
          drawEarth(limb, camera, scale, width, height)
          sky.restore()
        }
      }
      if (!paths) continue
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      if (!visible) {
        traceDisk(ctx, limb)
        ctx.stroke()
      }
      ctx.fillStyle = color
      const text = visible ? name : `${name} (${eclipsed ? 'eclipsed' : 'blocked'})`
      const labelX = clamp(cx + 11, 5, width - ctx.measureText(text).width - 8)
      const labelY = cy < 21 ? cy + 21 : cy - 13
      ctx.beginPath()
      ctx.moveTo(cx + 3, cy - 2)
      ctx.lineTo(labelX, labelY + 5)
      ctx.lineWidth = .8
      ctx.stroke()
      ctx.lineWidth = 3
      ctx.strokeStyle = '#09090e'
      ctx.strokeText(text, labelX, labelY)
      ctx.fillText(text, labelX, labelY)
    }
    showHeading(bearing(Math.round(azimuth)), status, Math.hypot(walkEast, walkNorth))
  }

  function aim(az, el) {
    azimuth = bearing(az)
    elevation = clamp(el, -89.9, 89.9)
    draw()
  }
  function turn(dx, dy) { aim(azimuth + dx, elevation + dy) }

  function walk(forward, right, meters = 10) {
    if (!terrainMesh || !(forward || right)) return
    const heading = azimuth * radians
    const distance = meters / Math.hypot(forward, right)
    let east = walkEast + distance * (forward * Math.sin(heading) + right * Math.cos(heading))
    let north = walkNorth + distance * (forward * Math.cos(heading) - right * Math.sin(heading))
    const range = Math.hypot(east, north)
    if (range > walkLimit) {
      east *= walkLimit / range
      north *= walkLimit / range
    }
    const ground = terrainGroundAt(terrainMesh, east, north)
    if (ground === null) return
    walkEast = east
    walkNorth = north
    groundHeight = ground
    detailShadowSample = null
    draw()
  }

  function returnToLanding() {
    walkEast = walkNorth = 0
    groundHeight = terrainMesh?.[1] ?? -2
    draw()
  }

  const keys = new Set()
  let walkFrame = null
  let previousWalk
  function animateWalk(now) {
    const dt = Math.min(.05, (now - previousWalk) / 1000)
    previousWalk = now
    walk(Number(keys.has('w')) - Number(keys.has('s')), Number(keys.has('d')) - Number(keys.has('a')), 6 * dt)
    walkFrame = requestAnimationFrame(animateWalk)
  }
  function stopWalking() {
    keys.clear()
    if (walkFrame !== null) cancelAnimationFrame(walkFrame)
    walkFrame = null
  }
  canvas.addEventListener('keydown', event => {
    const key = event.key.toLowerCase()
    if (!['w', 'a', 's', 'd'].includes(key) || event.ctrlKey || event.metaKey || event.altKey) return
    event.preventDefault()
    keys.add(key)
    if (walkFrame !== null) return
    previousWalk = performance.now()
    walkFrame = requestAnimationFrame(animateWalk)
  })
  canvas.addEventListener('keyup', event => {
    keys.delete(event.key.toLowerCase())
    if (!keys.size) stopWalking()
  })
  canvas.addEventListener('blur', stopWalking)
  canvas.addEventListener('pointerdown', event => {
    canvas.focus({ preventScroll: true })
    canvas.setPointerCapture(event.pointerId)
    drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
  })
  canvas.addEventListener('pointermove', event => {
    if (drag?.pointer !== event.pointerId) return
    turn((drag.x - event.clientX) * .25, (event.clientY - drag.y) * .25)
    drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
  })
  canvas.addEventListener('lostpointercapture', () => { drag = null })
  new ResizeObserver(draw).observe(canvas)

  return { draw, turn, aim, walk, returnToLanding,
    prepareFlight() { gl.finish() },
    camera: () => ({height:cameraHeight,azimuth,elevation,zoom}),
    flight({height,azimuth:heading,elevation:pitch,zoom:scale=1,moving=false}) {
      flying=moving
      cameraHeight=height
      azimuth=heading
      elevation=pitch
      zoom=scale
      draw()
    },
    aimAtGround(east, north, pitch) {
      const x = east - walkEast
      const z = north - walkNorth
      const range = Math.hypot(x, z)
      const ground = terrainGroundAt(terrainMesh, east, north) ?? -2
      const heading = range > .1 ? Math.atan2(x, z) / radians : azimuth
      aim(heading, pitch ?? Math.atan2(ground - groundHeight - cameraHeight, Math.max(range, 1)) / radians)
    },
    setZoom(value) { zoom = value; draw() }, setStyle(value) { illustrated = value === 'illustrated'; draw() },
    setDistantSoftness(value) { softDistance = value; draw() },
    setHeight(value) {
      if (value > 2 && cameraHeight === 2) elevation = Math.min(elevation, -12)
      if (value === 2 && cameraHeight > 2) elevation = 2
      cameraHeight = value
      draw()
    },
    update(value, track = null, epoch = 0, rotation = null) {
      sample = value
      paths = track
      if (rotation && siteFrame) {
        const toEarth = earthOrientation(epoch)
        const axes = [siteFrame.east, siteFrame.up, siteFrame.north].map(axis => toEarth(rotateBodyVector(axis, rotation)))
        earthFrame = axes[0].map((_, index) => axes.map(axis => axis[index]))
      } else {
        earthFrame = null
      }
      draw()
    },
    setTerrain(mesh, site, initialAzimuth) {
    sample = null
    terrainMesh = mesh
    stopWalking()
    returnToLanding()
    const indices = indexTerrain(mesh.length / 3)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
    gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, normals)
    gl.bufferData(gl.ARRAY_BUFFER, terrainNormals(mesh), gl.STATIC_DRAW)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)
    count = indices.length
    siteFrame = observer(site.lat, site.lon, 0)
    detailCenter = null
    gl.useProgram(program)
    gl.uniform3fv(uniforms.siteEast, siteFrame.east)
    gl.uniform3fv(uniforms.siteNorth, siteFrame.north)
    gl.uniform3fv(uniforms.siteUp, siteFrame.up)
    gl.uniform1f(uniforms.siteRadius, radius + site.height + 2)
    shadowSample = null
    aim(initialAzimuth, 2)
  } }
}

export function surfacePaths(samples, stride = 4) {
  return Object.fromEntries(['sun', 'earth'].map(body => [body, samples.filter((_, i) => i % stride === 0 || i === samples.length - 1)
    .map(item => direction(item[`${body}Az`], item[`${body}El`]))]))
}

function loadStereoTerrain(region) {
  if (stereoRequests.has(region)) return stereoRequests.get(region)
  const directory = new URL('./data/surface/', import.meta.url)
  const request = Promise.all([
    fetch(new URL(`${region.file}-elevation.json`, directory)),
    fetch(new URL(`${region.file}-elevation.bin.gz`, directory)),
  ]).then(async ([metadata, data]) => {
    if (!metadata.ok || !data.ok) throw new Error('Local stereo terrain is unavailable.')
    const descriptor = await metadata.json()
    const decoded = new Response(data.body.pipeThrough(new DecompressionStream('gzip')))
    const values = new Uint16Array(await decoded.arrayBuffer())
    if (values.length !== descriptor.width * descriptor.height) throw new Error('Local stereo terrain is incomplete.')
    return [{ ...descriptor, values, dataset: 'LROC stereo terrain',
      sourceUrl: `https://data.lroc.im-ldi.com/lroc/view_rdr/${region.product}` }]
  }).catch(error => { stereoRequests.delete(region); throw error })
  stereoRequests.set(region, request)
  return request
}

async function fetchFocusedGrid(lat, lon) {
  if (!terrainServerAvailable) return null
  const url = new URL('./api/terrain', import.meta.url)
  url.search = new URLSearchParams({ lat, lon })
  const response = await fetch(url, { signal: AbortSignal.timeout(24_000) })
  if (response.status === 404) terrainServerAvailable = false
  if (!response.ok) return null
  const buffer = await response.arrayBuffer()
  const length = new DataView(buffer).getUint32(0, true)
  if (length < 1 || length > 4096 || buffer.byteLength <= length + 4) throw new Error('Invalid elevation window.')
  const grid = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 4, length)))
  const values = new Uint16Array(buffer.slice(4 + length))
  if (values.length !== grid.width * grid.height || !Number.isFinite(grid.spacing) || grid.spacing <= 0) {
    throw new Error('Incomplete elevation window.')
  }
  return { ...grid, values }
}

async function readGround(lat, lon) {
  const region = stereoRegions.find(candidate => Math.abs(lat - candidate.lat) < .2 &&
    Math.abs(bearing(lon - candidate.lon + 180) - 180) < .2)
  const [globalHeight, polar, stereo, focused] = await Promise.all([
    loadTerrainSampler(lat, lon, true),
    lat <= -52 ? loadPolarGrids().catch(() => []) : [],
    region ? loadStereoTerrain(region).catch(() => []) : [],
    fetchFocusedGrid(lat, lon).catch(() => null),
  ])
  const [polarGrids, regionalGrids] = [[...polar], [...stereo]]
  if (focused) (focused.centralMeridian === undefined ? polarGrids : regionalGrids).push(focused)
  const terrain = surfaceTerrainSampler(globalHeight, polarGrids, regionalGrids)
  const grid = terrain.gridAt(lat, lon)
  const spacing = grid?.spacing ?? globalSpacing
  const source = grid?.dataset ? `${grid.dataset} · ${Math.round(spacing)} m/pixel` :
    grid ? `NASA LOLA · ${spacing} m grid` : 'Global LOLA · 16 px/°'
  return { terrain, grid, spacing, source, focused, region: stereo.length ? region : null }
}

function loadGround(lat, lon) {
  const key = `${lat}/${lon}`
  if (groundRequests.has(key)) return groundRequests.get(key)
  const request = readGround(lat, lon).then(data => {
    if (!data.focused && terrainServerAvailable) groundRequests.delete(key)
    return data
  }).catch(error => {
    groundRequests.delete(key)
    throw error
  })
  groundRequests.set(key, request)
  if (groundRequests.size > 12) groundRequests.delete(groundRequests.keys().next().value)
  return request
}

export async function surfaceHorizon(lat, lon) {
  const { terrain, grid, spacing, source } = await loadGround(lat, lon)
  if (!grid?.dataset) {
    const result = grid ? polarHorizon(lat, lon, terrain.height) : horizonProfile(lat, lon, terrain.height)
    return { ...result, terrain: source }
  }
  // Sample the highest-detail window close to the observer, then extend the rays through the broader terrain.
  const distances = [[1500, Math.min(118, spacing)], [6000, 60], [25_000, 240], [350_000, 960]]
    .flatMap(([end, step], index, segments) => {
      const start = index ? segments[index - 1][0] : 0
      return Array.from({ length: Math.floor((end - start) / step) }, (_, i) => start + (i + 1) * step)
    })
  return { ...horizonProfile(lat, lon, terrain.height, distances), terrain: source, detailed: true }
}

export async function loadSurfaceMesh(site) {
  const { terrain, grid, spacing, source, region } = await loadGround(site.lat, site.lon)
  const preparedTerrain = !grid?.dataset && site.terrain === 'LOLA 80/240 m' ||
    spacing >= 5 && site.terrain === 'LOLA 5/80/240 m'
  if (preparedTerrain) {
    const prepared = await fetch(new URL(`./data/surface/${site.id}.bin`, import.meta.url))
      .then(response => response.ok ? response.arrayBuffer() : null).catch(() => null)
    const count = (prepared?.byteLength ?? 0) / (3 * Float32Array.BYTES_PER_ELEMENT)
    if (count >= spokes * 2 && count % spokes === 0 && count <= 65535) {
      return { mesh: new Float32Array(prepared), site, source: site.terrain }
    }
  }
  const cameraSite = { ...site, height: terrain.height(site.lat, site.lon) }
  return {
    mesh: terrainVertices(cameraSite, terrain.height, surfaceRanges(spacing)),
    site: cameraSite, source: source + ' near the camera', coarse: spacing === globalSpacing,
    sourceUrl: grid?.sourceUrl ?? (grid ? 'https://pgda.gsfc.nasa.gov/products/90' : undefined),
    crater: region?.crater,
    spacingAt: grid ? terrain.spacingAt : undefined,
  }
}
