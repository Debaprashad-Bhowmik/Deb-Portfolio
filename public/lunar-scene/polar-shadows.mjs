import { radius } from './planner.mjs'

const radians = Math.PI / 180
const directory = new URL('./data/polar-shadows/', import.meta.url)
let loadPending
let illuminationPending

export function polarProjection(lat, lon) {
  const distance = 2 * radius * Math.tan((90 + lat) * radians / 2)
  return { x: distance * Math.sin(lon * radians), y: distance * Math.cos(lon * radians) }
}

export function samplePolarGrid(grid, x, y) {
  const col = (x - grid.left) / grid.spacing - .5
  const row = (grid.top - y) / grid.spacing - .5
  if (col < 0 || row < 0 || col >= grid.width - 1 || row >= grid.height - 1) return null
  const left = Math.floor(col)
  const top = Math.floor(row)
  const index = top * grid.width + left
  const [nw, ne, sw, se] = [grid.values[index], grid.values[index + 1], grid.values[index + grid.width], grid.values[index + grid.width + 1]]
  if (!nw || !ne || !sw || !se) return null
  const dx = col - left
  const dy = row - top
  const north = nw + (ne - nw) * dx
  const south = sw + (se - sw) * dx
  return (north + (south - north) * dy) * (grid.scale ?? .5) + (grid.offset ?? -10_000)
}

async function readPolarGrid(grid) {
  const data = await fetch(new URL(grid.file, directory))
  if (!data.ok) throw new Error(`LOLA data ${grid.name} are unavailable.`)
  const values = new Uint16Array(await new Response(data.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())
  if (values.length !== grid.width * grid.height) throw new Error(`LOLA data ${grid.name} are incomplete.`)
  return { ...grid, values }
}

async function readPolarData() {
  const response = await fetch(new URL('grids.json', directory))
  if (!response.ok) throw new Error('The LOLA terrain index is unavailable.')
  const manifest = await response.json()
  return Promise.all(manifest.map(readPolarGrid))
}

export function loadPolarGrids() {
  loadPending ??= readPolarData().catch(error => { loadPending = undefined; throw error })
  return loadPending
}

export async function polarIlluminationAt(lat, lon) {
  illuminationPending ??= fetch(new URL('illumination.json', directory)).then(response => {
    if (!response.ok) throw new Error('The NASA illumination index is unavailable.')
    return response.json()
  }).then(readPolarGrid).catch(error => { illuminationPending = undefined; throw error })
  const grid = await illuminationPending
  const { x, y } = polarProjection(lat, lon)
  return samplePolarGrid(grid, x, y)
}

export function polarTerrainSampler(grids) {
  const fineFirst = [...grids].reverse()
  return (lat, lon) => {
    const { x, y } = polarProjection(lat, lon)
    for (const grid of fineFirst) {
      const height = samplePolarGrid(grid, x, y)
      if (height !== null) return height
    }
    return null
  }
}

export const polarTileCount = 4
export const polarUniforms = ['polarShadows', ...Array.from({ length: polarTileCount }, (_, i) => [`polarHeight${i}`, `polarBounds${i}`]).flat()]

export const polarShadowShader = `
uniform bool polarShadows;
${Array.from({ length: polarTileCount }, (_, i) => `uniform sampler2D polarHeight${i}; uniform vec4 polarBounds${i};`).join('\n')}
const float moonRadius = ${radius.toFixed(1)};
const float missingHeight = -20000.0;

float gridHeight(sampler2D heights, vec4 bounds, vec2 meters) {
  vec2 uv = (vec2(meters.x, -meters.y) - bounds.xy) * bounds.zw;
  if (min(uv.x, uv.y) <= .00065 || max(uv.x, uv.y) >= .99935) return missingHeight;
  vec4 sampleValue = texture2D(heights, uv);
  return sampleValue.a < .999 ? missingHeight : dot(sampleValue.rg, vec2(32640.0, 127.5)) - 10000.0;
}

vec2 projectedTerrain(vec3 normal) {
  return normal.yx * ((2.0 * moonRadius) / (1.0 - normal.z));
}

float polarElevation(vec2 meters, out float spacing) {
  float height;
  ${[[3,10],[2,80],[1,240],[0,960]].map(([i, spacing]) => `height = gridHeight(polarHeight${i}, polarBounds${i}, meters); if (height > missingHeight) { spacing = ${spacing}.0; return height; }`).join('\n  ')}
  spacing = 960.0;
  return missingHeight;
}

float terrainHeight(vec3 normal, out float spacing) {
  return polarElevation(projectedTerrain(normal), spacing);
}

bool clearOfTerrain(vec3 start, vec3 direction, float spacing) {
  float distance = spacing;
  for (int i = 0; i < 220; i++) {
    if (distance > 350000.0) break;
    vec3 point = start + direction * (distance / moonRadius);
    float radial = length(point);
    float rayHeight = (radial - 1.0) * moonRadius;
    if (rayHeight > 11000.0 && dot(point, direction) > 0.0) return true;
    float nextSpacing;
    float surfaceHeight = terrainHeight(point / radial, nextSpacing);
    if (surfaceHeight > missingHeight && rayHeight <= surfaceHeight) return false;
    distance += clamp(distance * .07, nextSpacing, 2800.0);
  }
  return true;
}
`

export function uploadPolarGrids(gl, uniforms, grids) {
  for (const [i, grid] of grids.entries()) {
    gl.activeTexture(gl.TEXTURE0 + 4 + i)
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    for (const parameter of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE)
    for (const parameter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR)
    const bytes = new Uint8Array(grid.values.length * 4)
    for (const [index, value] of grid.values.entries()) {
      bytes[index * 4] = value >> 8
      bytes[index * 4 + 1] = value & 255
      bytes[index * 4 + 3] = value ? 255 : 0
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, grid.width, grid.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes)
    gl.uniform1i(uniforms[`polarHeight${i}`], 4 + i)
    gl.uniform4f(uniforms[`polarBounds${i}`], grid.left, -grid.top, 1 / (grid.spacing * grid.width), 1 / (grid.spacing * grid.height))
  }
  gl.activeTexture(gl.TEXTURE0)
}
