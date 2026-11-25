import { eclipticToEquatorial } from './body-textures.mjs'

const vertex = `
attribute vec2 point;
void main() { gl_Position = vec4(point, 0.0, 1.0); }
`

const fragment = `
precision highp float;
uniform sampler2D atlas;
uniform mat3 cameraToEquator;
uniform vec2 viewport;
uniform float focalLength, exposure, sunVisibility;
uniform vec3 sun;
const float pi = 3.14159265359;

void main() {
  vec3 ray = normalize(vec3((gl_FragCoord.xy - viewport * .5) / focalLength, 1.0));
  vec3 equatorial = cameraToEquator * ray;
  // NASA's celestial atlas is north-up, centered at 0h, with RA increasing leftward.
  vec2 uv = vec2(.5 - atan(equatorial.y, equatorial.x) / (2.0 * pi),
    .5 - asin(clamp(equatorial.z, -1.0, 1.0)) / pi);
  vec3 starlight = texture2D(atlas, uv).rgb;
  float peak = max(starlight.r, max(starlight.g, starlight.b));
  float glare = 1.0 - .48 * sunVisibility * smoothstep(.965, .9995, dot(ray, sun));
  float contrast = mix(.72, 1.6, smoothstep(.12, .88, peak));
  gl_FragColor = vec4(starlight * (contrast * exposure * glare), 1.0);
}
`

// A single backdrop sits behind the globe, orbital bodies and surface horizon.
// Use directions only so walking or dollying never gives the stars parallax.
export function createStarSky(canvas, { maxTextureSize = Infinity } = {}) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false })
  if (!gl) return null

  const program = gl.createProgram()
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]]) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  const quad = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const point = gl.getAttribLocation(program, 'point')
  gl.enableVertexAttribArray(point)
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0)
  const uniforms = Object.fromEntries(['cameraToEquator', 'viewport', 'focalLength', 'exposure', 'sun', 'sunVisibility']
    .map(name => [name, gl.getUniformLocation(program, name)]))
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

  let loaded = false
  let latest
  let exposure, glare, lastFrameTime
  let adaptationFrame = 0
  const adapt = (current, target, weight) =>
    current === undefined || Math.abs(current - target) < .001 ? target : current + (target - current) * weight

  function redrawExposure(now) {
    if (now - lastFrameTime >= 16) draw(latest, now)
    else adaptationFrame = requestAnimationFrame(redrawExposure)
  }

  function draw(view, now = performance.now()) {
    latest = view
    if (!loaded) return
    cancelAnimationFrame(adaptationFrame)
    const { axes, lens, sun, sunVisibility } = view
    const { clientWidth: width, clientHeight: height } = canvas
    if (!width || !height) return
    // Ease exposure through occultations and view changes, including clock jumps.
    const elapsed = Math.min(34, Math.max(0, now - (lastFrameTime ?? now)))
    const weight = 1 - Math.exp(-elapsed / 120)
    lastFrameTime = Math.max(lastFrameTime ?? now, now)
    exposure = adapt(exposure, view.exposure, weight)
    glare = adapt(glare, sunVisibility, weight)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, width, height)
    gl.uniform2f(uniforms.viewport, width, height)
    gl.uniformMatrix3fv(uniforms.cameraToEquator, false, axes.flatMap(eclipticToEquatorial))
    gl.uniform1f(uniforms.focalLength, lens)
    gl.uniform1f(uniforms.exposure, exposure)
    gl.uniform1f(uniforms.sunVisibility, glare)
    gl.uniform3fv(uniforms.sun, sun)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    if (exposure !== view.exposure || glare !== sunVisibility) {
      adaptationFrame = requestAnimationFrame(redrawExposure)
    }
  }

  const image = new Image()
  image.fetchPriority = 'low'
  image.onload = () => {
    let atlas = image
    const limit = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), maxTextureSize)
    if (image.width > limit) {
      const reduced = document.createElement('canvas')
      reduced.width = 2 ** Math.floor(Math.log2(limit))
      reduced.height = reduced.width / 2
      const context = reduced.getContext('2d')
      if (!context) return
      context.drawImage(image, 0, 0, reduced.width, reduced.height)
      atlas = reduced
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    gl.generateMipmap(gl.TEXTURE_2D)
    loaded = true
    if (latest) draw(latest)
  }
  image.src = new URL('./assets/nasa-deep-star-map.webp', import.meta.url).href

  return draw
}
