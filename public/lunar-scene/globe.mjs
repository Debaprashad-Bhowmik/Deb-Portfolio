import { sphereIntersectionGLSL } from './orbital-geometry.mjs'
import { earthshine } from './lunar-light.mjs'
import { astronomicalUnit, earthRadius, radius, referencePanelPower, sunRadius } from './planner.mjs'
import { coveragePalette, solarPowerPalette, solarPowerScaleMax, totalityPossible, visibilityRequirements } from './coverage-map.mjs'
import { artemisSouthLatitude, overlapColors } from './mission-heat.mjs'
import { loadPolarGrids, polarShadowShader, polarUniforms, uploadPolarGrids } from './polar-shadows.mjs'
export { artemisSouthLatitude } from './mission-heat.mjs'

const rad = Math.PI / 180
export const southPoleView = { lat: -90, lon: 0 }
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const position = (latitude, longitude) => {
  const phi = latitude * rad
  const lambda = longitude * rad
  return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)]
}

export function globeOrientation(latitude, longitude) {
  const phi = latitude * rad
  const lambda = longitude * rad
  return {
    front: position(latitude, longitude),
    east: [-Math.sin(lambda), Math.cos(lambda), 0],
    north: [-Math.sin(phi) * Math.cos(lambda), -Math.sin(phi) * Math.sin(lambda), Math.cos(phi)],
  }
}

export function projectSite(site, orientation) {
  const normal = position(site.lat, site.lon)
  return [dot(normal, orientation.east), dot(normal, orientation.north), dot(normal, orientation.front)]
}

export function pointOnGlobe(x, y, { east, north, front }) {
  const r2 = x * x + y * y
  if (r2 > 1) return null
  const depth = Math.sqrt(1 - r2)
  const [nx, ny, nz] = front.map((value, axis) => value * depth + east[axis] * x + north[axis] * y)
  return { lat: Math.asin(clamp(nz, -1, 1)) / rad, lon: Math.atan2(ny, nx) / rad }
}

const vertex = `
attribute vec2 point;
void main() { gl_Position = vec4(point, 0.0, 1.0); }
`
const fragment = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
uniform sampler2D lunarMap;
uniform sampler2D polarRelief;
uniform sampler2D globalElevation;
uniform bool elevationReady;
uniform vec4 imageBounds;
uniform bool tileReady;
uniform sampler2D missionHeat;
uniform sampler2D detailHeat;
uniform vec3 detailEast, detailNorth, detailFront;
uniform vec3 detailSize;
uniform bool showDetail;
uniform vec2 heatContrast;
uniform float northLatitude, heatHeight, powerMax, regionNorthLatitude;
uniform float polarExtent;
uniform vec2 viewport;
uniform float sphereRadius;
uniform vec2 sphereCenter;
uniform vec3 foregroundBody;
uniform vec4 orbitMoon, orbitEarth, orbitSun;
uniform float orbitLens, orbitMapBlend;
uniform bool annotations;
uniform bool analysis;
uniform bool terrainAnalysis;
uniform vec3 east;
uniform vec3 north;
uniform vec3 front;
uniform vec3 sun, earth;
uniform float earthshine;
uniform bool dayNight;
uniform vec2 visibility;
uniform bool showPower, showHeat, colorByPower;
uniform bool possibleEclipse;
const float pi = 3.14159265359;
${sphereIntersectionGLSL}
${polarShadowShader}
void conditions(vec3 normal, out bool sunlight, out bool earthView, out float powerFraction, out bool craterShadow) {
  vec3 toSun = sun - normal;
  vec3 toEarth = earth - normal;
  sunlight = dot(normal, toSun) > 0.0;
  earthView = dot(normal, toEarth) > 0.0;
  if (sunlight && earthView && possibleEclipse) {
    vec3 s = normalize(toSun);
    vec3 e = normalize(toEarth);
    float separation = atan(length(cross(s, e)), dot(s, e));
    sunlight = separation + asin(${(sunRadius / radius).toFixed(8)} / length(toSun)) > asin(${(earthRadius / radius).toFixed(8)} / length(toEarth));
  }
  bool smoothSun = sunlight;
  craterShadow = false;
  if (polarShadows && terrainAnalysis && normal.z <= ${Math.sin(artemisSouthLatitude * rad).toFixed(8)}) {
    float spacing;
    float height = terrainHeight(normal, spacing);
    if (height > missingHeight) {
      vec3 start = normal * (1.0 + (height + 2.0) / moonRadius);
      toSun = sun - start;
      toEarth = earth - start;
      vec3 solarDirection = normalize(toSun);
      vec3 earthDirection = normalize(toEarth);
      bool totality = possibleEclipse && atan(length(cross(solarDirection, earthDirection)), dot(solarDirection, earthDirection)) +
        asin(${(sunRadius / radius).toFixed(8)} / length(toSun)) <= asin(${(earthRadius / radius).toFixed(8)} / length(toEarth));
      sunlight = !totality && dot(normal, solarDirection) > -.20 && clearOfTerrain(start, solarDirection, spacing);
      craterShadow = smoothSun && !sunlight && !totality;
      if (visibility.y > 0.0) {
        earthView = dot(normal, earthDirection) > -.20 && clearOfTerrain(start, earthDirection, spacing);
      }
    }
  }
  powerFraction = 0.0;
  if (showPower && sunlight && powerMax > 0.0) {
    float distanceAu = length(toSun) / ${(astronomicalUnit / radius).toFixed(8)};
    float incidence = max(0.0, dot(normal, normalize(toSun)));
    float power = ${referencePanelPower.toFixed(2)} * incidence / (distanceAu * distanceAu);
    powerFraction = clamp(power / powerMax, 0.0, 1.0);
  }
}
vec3 powerInk(float fraction) {
  float scaled = sqrt(fraction) * 2.0;
  if (scaled < 1.0) return mix(${glslColor(solarPowerPalette[0])}, ${glslColor(solarPowerPalette[1])}, scaled);
  return mix(${glslColor(solarPowerPalette[1])}, ${glslColor(solarPowerPalette[2])}, scaled - 1.0);
}
vec3 overlapInk(float value) {
  float lo = heatContrast.x;
  float hi = heatContrast.y;
  float start = lo > 0.0 ? .15 : 0.0;
  float end = hi < 1.0 ? .85 : 1.0;
  float fraction = value < lo ? value / lo * start : value > hi ? end + (value - hi) / (1.0 - hi) * (1.0 - end) :
    mix(start, end, (value - lo) / (hi - lo));
  float band = clamp(fraction, 0.0, 1.0) * ${(overlapColors.length - 1).toFixed(1)};
  ${overlapColors.slice(0, -1).map((color, i) => `${i < overlapColors.length - 2 ? `if (band < ${(i + 1).toFixed(1)}) ` : ''}return mix(${glslColor(color)}, ${glslColor(overlapColors[i + 1])}, band - ${i.toFixed(1)});`).join('\n  ')}
}
float globalHeight(vec3 normal) {
  if(!elevationReady) return 0.0;
  vec2 uv=vec2(fract(atan(normal.y,normal.x)/(2.0*pi)+.5),.5-asin(clamp(normal.z,-1.0,1.0))/pi);
  return dot(texture2D(globalElevation,uv).rg,vec2(32640.0,127.5))-10000.0;
}
bool globalClear(vec3 start,vec3 light) {
  if(!elevationReady) return true;
  float distance=1900.0;
  for(int i=0;i<52;i++) {
    vec3 samplePoint=start+light*(distance/moonRadius);
    float radial=length(samplePoint);
    float height=(radial-1.0)*moonRadius;
    if(height>11000.0) return true;
    if(globalHeight(samplePoint/radial)>height) return false;
    distance+=max(1900.0,distance*.09);
  }
  return true;
}
void main() {
  vec2 p = (gl_FragCoord.xy - sphereCenter) / sphereRadius;
  vec2 screenPixel=vec2(gl_FragCoord.x,viewport.y-gl_FragCoord.y);
  if(foregroundBody.z>0.0 && length(screenPixel-foregroundBody.xy)<foregroundBody.z) discard;
  float distanceSquared = dot(p, p);
  float depth = sqrt(max(0.0, 1.0-distanceSquared));
  vec3 normal;
  if(orbitLens>0.0) {
    vec3 ray=normalize(vec3((gl_FragCoord.xy-viewport*.5)/orbitLens,1.0));
    float hit=hitSphere(ray,orbitMoon);
    if(hit>1.0e19 || min(hitSphere(ray,orbitEarth),hitSphere(ray,orbitSun))<hit) discard;
    vec3 cameraNormal=normalize(ray*hit-orbitMoon.xyz);
    normal=cameraNormal.x*east+cameraNormal.y*north-cameraNormal.z*front;
    // The flight ends in the map's orthographic projection without a texture jump.
    vec3 mapNormal=p.x*east+p.y*north+depth*front;
    normal=normalize(mix(normal,mapNormal,orbitMapBlend));
    depth=max(0.0,-cameraNormal.z);
  } else {
    if(distanceSquared>1.0) discard;
    normal=p.x*east+p.y*north+depth*front;
  }
  float longitude = atan(normal.y, normal.x);
  float latitude = asin(clamp(normal.z, -1.0, 1.0));
  if (latitude > regionNorthLatitude) discard;
  vec2 uv = vec2(longitude / (2.0 * pi) + 0.5, 0.5 - latitude / pi);
  vec3 reflectance = texture2D(lunarMap, uv).rgb;
  vec2 tileUv=(uv-imageBounds.xy)/imageBounds.zw;
  if(tileReady && min(tileUv.x,tileUv.y)>.002 && max(tileUv.x,tileUv.y)<.998) {
    reflectance=texture2D(polarRelief,tileUv).rgb;
  }
  float shading = 0.50 + 0.50 * max(0.0, dot(vec3(p, depth), normalize(vec3(-0.5, 0.7, 1.0))));
  vec3 surface = reflectance * shading * 1.21;
  if (dayNight) {
    vec3 toSun=normalize(sun-normal);
    vec3 localEast=normalize(vec3(-normal.y,normal.x,0.0000001));
    vec3 localNorth=normalize(cross(normal,localEast));
    float h=globalHeight(normal);
    float spacing=1900.0;
    if(polarShadows && normal.z<-.99) {
      float polar=terrainHeight(normal,spacing);
      if(polar>missingHeight) h=polar;
    }
    vec3 nEast=normalize(normal+localEast*(spacing/moonRadius));
    vec3 nNorth=normalize(normal+localNorth*(spacing/moonRadius));
    float e=globalHeight(nEast), n=globalHeight(nNorth);
    if(polarShadows && normal.z<-.99) {
      float unused;
      float pe=terrainHeight(nEast,unused), pn=terrainHeight(nNorth,unused);
      if(pe>missingHeight) e=pe;
      if(pn>missingHeight) n=pn;
    }
    vec3 slope=normalize(normal-localEast*((e-h)/spacing)-localNorth*((n-h)/spacing));
    float elevation=dot(normal,toSun);
    float incidence=dot(slope,toSun);
    bool illuminated=elevation>-.12 && incidence>0.0;
    if(illuminated && elevation<.30) {
      vec3 start=normal*(1.0+(h+3.0)/moonRadius);
      illuminated=polarShadows && normal.z<-.99
        ? clearOfTerrain(start,toSun,spacing) : globalClear(start,toSun);
    }
    if(illuminated && possibleEclipse) {
      vec3 earthDirection=normalize(earth-normal);
      float separation=atan(length(cross(toSun,earthDirection)),dot(toSun,earthDirection));
      if(separation+asin(${(sunRadius/radius).toFixed(8)}/length(sun-normal))<=asin(${(earthRadius/radius).toFixed(8)}/length(earth-normal))) illuminated=false;
    }
    float diffuse=illuminated?sqrt(max(0.0,incidence)):0.0;
    float reflected=sqrt(earthshine*max(0.0,dot(slope,normalize(earth-normal))));
    surface=reflectance*(vec3(.025,.028,.035)+vec3(1.12)*diffuse+vec3(.80,.91,1.0)*reflected);
  }
  if (analysis && latitude <= northLatitude) {
    vec4 heat = vec4(0.0);
    if (showHeat) {
      float fraction = (northLatitude - latitude) / (northLatitude + pi * .5);
      float heatLat = (fraction * (heatHeight - 1.0) + .5) / heatHeight;
      heat = texture2D(missionHeat, vec2(uv.x, heatLat));
      if (showDetail && dot(normal, detailFront) > 0.0) {
        vec2 local = vec2(dot(normal, detailEast), -dot(normal, detailNorth)) / detailSize.xy;
        float distanceFromEdge = max(abs(local.x), abs(local.y));
        if (distanceFromEdge <= 1.0) {
          vec2 sampleUv = ((local * .5 + .5) * (detailSize.z - 1.0) + .5) / detailSize.z;
          vec4 detail = texture2D(detailHeat, sampleUv);
          if (detail.a > .99) heat = detail;
        }
      }
    }
    bool needsSun = visibility.x > 0.0;
    bool needsEarth = visibility.y > 0.0;
    bool showVisibility = needsSun || needsEarth;
    bool live = showPower || showVisibility;
    bool sunlight = false, earthView = false, craterShadow = false;
    float powerFraction = 0.0;
    if (live || (polarShadows && terrainAnalysis && !showHeat && normal.z <= ${Math.sin(artemisSouthLatitude * rad).toFixed(8)})) {
      conditions(normal, sunlight, earthView, powerFraction, craterShadow);
    }
    // Decode the sampled hours before masking them by the live conditions.
    float overlap = dot(heat.rg, vec2(65280.0, 255.0)) / 65535.0;
    bool matches = (!needsSun || sunlight) && (!needsEarth || earthView) &&
      (!showHeat || !live || overlap > 0.0) &&
      (!showPower || !(showHeat || showVisibility) || powerFraction > 0.0);
    if (matches) {
      float shade = .56 + reflectance.r * (255.0 / 360.0);
      if (colorByPower) surface = powerInk(powerFraction) * shade;
      else if (showHeat) surface = mix(surface, overlapInk(overlap), .83 * heat.a);
      else if (showVisibility) surface = (needsSun && needsEarth ? ${coverageInk(3)} : needsSun ? ${coverageInk(1)} : ${coverageInk(2)}) * shade;
      else if (craterShadow) surface = mix(surface, vec3(.20, .18, .47), .78);
    }
  }
  float edge = abs(latitude - ${(artemisSouthLatitude * rad).toFixed(10)});
  float pixel = max(length(vec2(dFdx(latitude), dFdy(latitude))), .00002);
  float ring = 1.0 - smoothstep(.65 * pixel, 1.55 * pixel, edge);
  float outline = 1.0 - smoothstep(1.75 * pixel, 2.75 * pixel, edge);
  if (annotations) {
    surface = mix(surface, vec3(.12,.065,.17), outline * .72);
    surface = mix(surface, vec3(.91,.69,1.0), ring);
  }
  gl_FragColor = vec4(surface, 1.0);
}
`

function coverageInk(index) {
  return glslColor(coveragePalette[index])
}

function glslColor(color) {
  return 'vec3(' + color.map(value => (value / 255).toFixed(6)).join(',') + ')'
}

export function createGlobe(canvas, markerLayer, featureCanvas, poleMarker, polarExtent, onSelect, onPoint, onFeature, {
  detail = true, onViewChange, onCameraChange, onTerrainStatus, directions,
  globalElevation = Boolean(directions), regionNorthLatitude = 90,
} = {}) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, preserveDrawingBuffer:true })
  if (!gl || !gl.getExtension('OES_standard_derivatives')) throw new Error('3D is unavailable in this browser. Use the polar map to select sites.')
  const program = gl.createProgram()
  for (const [source, kind] of [[vertex, gl.VERTEX_SHADER], [fragment, gl.FRAGMENT_SHADER]]) {
    const shader = gl.createShader(kind)
    gl.shaderSource(shader, gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)>=9 ? source :
      source.replace('uniform sampler2D globalElevation;', '').replace('dot(texture2D(globalElevation,uv).rg,vec2(32640.0,127.5))-10000.0', '0.0'))
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('3D rendering failed. Use the polar map to select sites.')
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('3D rendering failed. Use the polar map to select sites.')
  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const point = gl.getAttribLocation(program, 'point')
  gl.enableVertexAttribArray(point)
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0)
  const uniforms = Object.fromEntries(['viewport', 'sphereRadius', 'sphereCenter', 'foregroundBody', 'orbitMoon', 'orbitEarth', 'orbitSun', 'orbitLens', 'orbitMapBlend', 'annotations', 'analysis', 'terrainAnalysis', 'east', 'north', 'front',
    'sun', 'earth', 'earthshine', 'dayNight', 'visibility', 'showPower', 'showHeat', 'colorByPower', 'possibleEclipse', 'lunarMap', 'polarRelief', 'missionHeat', 'northLatitude', 'heatHeight', 'powerMax',
    'globalElevation','elevationReady','tileReady','imageBounds','polarExtent', 'detailHeat', 'detailEast', 'detailNorth', 'detailFront', 'detailSize', 'showDetail', 'heatContrast', 'regionNorthLatitude', ...polarUniforms].map(name => [name, gl.getUniformLocation(program, name)]))
  gl.uniform1f(uniforms.regionNorthLatitude, regionNorthLatitude * rad)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  for (const parameter of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE)
  for (const parameter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR)
  const reliefTexture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, reliefTexture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  for (const parameter of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE)
  for (const parameter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR)
  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1i(uniforms.lunarMap, 0)
  gl.uniform1i(uniforms.polarRelief, 1)
  gl.uniform1i(uniforms.missionHeat, 2)
  gl.uniform1i(uniforms.detailHeat, 3)
  const heatTexture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE2)
  gl.bindTexture(gl.TEXTURE_2D, heatTexture)
  for (const parameter of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE)
  for (const parameter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
  gl.activeTexture(gl.TEXTURE3)
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  for (const parameter of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE)
  for (const parameter of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4))
  gl.activeTexture(gl.TEXTURE0)
  gl.uniform1f(uniforms.polarExtent, polarExtent / radius)

  let flightCamera = null
  let latitude = Math.min(-12, regionNorthLatitude)
  let longitude = 17
  let zoom = regionNorthLatitude < 0 ? 7.6 : 1
  let sites = []
  let labels = []
  let feature
  let featureHits = []
  let overlayFrame
  let heatImage
  let detailImageData
  let viewKey
  let shadowRequested = false
  let polarState = 'idle'
  let northLatitude = 90
  let powerMax = solarPowerScaleMax
  let appliedScores
  let scoresDirty = false
  let visibility = 0
  let power = false
  let powerColors = false
  let heatVisible = false
  let selected
  let drag
  const pointers = new Map()
  let ready = false
  let imageTile
  let wantedTile
  const markers = new Map()
  const featureContext = featureCanvas?.getContext('2d')
  const globeImage = new Image()
  globeImage.onload = () => {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D,texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, globeImage)
    ready = true
    draw()
  }
  globeImage.onerror = () => canvas.dispatchEvent(new Event('textureerror'))
  globeImage.src = new URL('./assets/moon-color-4k.webp', import.meta.url).href
  const detailImage = new Image()
  if(globalElevation && gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS)>=9 && gl.getParameter(gl.MAX_TEXTURE_SIZE)>=5760) {
    gl.activeTexture(gl.TEXTURE8)
    gl.bindTexture(gl.TEXTURE_2D,gl.createTexture())
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([78,32,0,255]))
    for(const parameter of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,parameter,gl.LINEAR)
    for(const parameter of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,parameter,gl.CLAMP_TO_EDGE)
    gl.uniform1i(uniforms.globalElevation,8)
    gl.activeTexture(gl.TEXTURE0)
    const elevations=new Image()
    elevations.onload=()=>{
      gl.activeTexture(gl.TEXTURE8)
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,elevations)
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.BROWSER_DEFAULT_WEBGL)
      gl.uniform1i(uniforms.elevationReady,1)
      gl.activeTexture(gl.TEXTURE0)
      draw()
    }
    elevations.src=new URL('./assets/moon-elevation.png',import.meta.url).href
  }
  function requestImageTile(orientation,size,height) {
    if(!detail || flightCamera?.moving || size<height*.9 || gl.getParameter(gl.MAX_TEXTURE_SIZE)<4096) return
    const normal=orientation.front
    const u=((Math.atan2(normal[1],normal[0])/(2*Math.PI)+.5)%1+1)%1
    const v=.5-Math.asin(normal[2])/Math.PI
    const x=Math.min(3,Math.floor(u*4)),y=Math.min(1,Math.floor(v*2))
    if (detail === 'south' && y === 0) return
    const tile=x+'-'+y
    if(wantedTile===tile) return
    wantedTile=tile
    const image=new Image()
    image.onload=()=>{
      if(wantedTile!==tile)return
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D,reliefTexture)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)
      gl.uniform4f(uniforms.imageBounds,x/4,y/2,.25,.5)
      gl.uniform1i(uniforms.tileReady,1)
      gl.activeTexture(gl.TEXTURE0)
      imageTile=tile
      canvas.dataset.texture='16K regional detail'
      draw()
    }
    image.onerror=()=>{if(wantedTile===tile)wantedTile=imageTile}
    image.src=new URL('./assets/moon-tiles/'+tile+'.webp',import.meta.url).href
  }
  detailImage.onload = () => {
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D,texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, detailImage)
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR)
    canvas.dataset.texture=detailImage.naturalWidth+" px global imagery"
    ready = true
    draw()
  }
  if (detail === true && gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096) {
    globeImage.addEventListener('load', () => {
      const high=gl.getParameter(gl.MAX_TEXTURE_SIZE)>=8192 && (navigator.deviceMemory??8)>=8
      detailImage.src = new URL(high?'./assets/moon-color-8k.webp':'./assets/moon-color-4k.webp', import.meta.url).href
    }, { once: true })
  }

  function draw() {
    if (canvas.closest('.viewer-layer')?.inert && !flightCamera) return
    const { clientWidth: width, clientHeight: height } = canvas
    if (!width || !height) return
    const ratio = flightCamera?.moving ? Math.min(1,720/Math.max(width,height)) : Math.min(devicePixelRatio || 1, 2)
    const size = flightCamera?.radius ?? Math.min(width, height) * .46 * zoom
    const orientation = flightCamera?.orientation ?? globeOrientation(latitude, longitude)
    const center = flightCamera?.center ?? [width / 2, height / 2]
    onCameraChange?.({radius:size,center,orientation})
    requestImageTile(orientation,size,height)
    const annotations = !flightCamera
    markerLayer.hidden = !annotations
    if (featureCanvas) featureCanvas.style.visibility = annotations ? '' : 'hidden'
    if (poleMarker && !annotations) poleMarker.hidden = true
    if (directions) for (const label of Object.values(directions)) label.style.visibility = annotations ? '' : 'hidden'
    if (onViewChange && !flightCamera) {
      const key = `${latitude}/${longitude}/${zoom}/${width}/${height}`
      if (viewKey !== key) {
        viewKey = key
        onViewChange()
      }
    }
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
    }
    if (ready) {
      const reach = Math.asin(Math.min(1, Math.hypot(width, height) / (2 * size))) / rad
      const viewLatitude=Math.asin(orientation.front[2])/rad
      const showShadows = Boolean(directions) && shadowRequested && viewLatitude - reach <= artemisSouthLatitude
      if (showShadows && polarState === 'idle') {
        polarState = 'loading'
        onTerrainStatus?.('loading')
        loadPolarGrids().then(grids => {
          if (grids.some(grid => Math.max(grid.width, grid.height) > gl.getParameter(gl.MAX_TEXTURE_SIZE))) throw new Error('The polar textures exceed this device’s limit.')
          uploadPolarGrids(gl, uniforms, grids)
          polarState = 'ready'
          onTerrainStatus?.('ready')
          draw()
        }).catch(() => { polarState = 'failed'; onTerrainStatus?.('failed') })
      }
      gl.uniform1i(uniforms.polarShadows, Number(showShadows && polarState === 'ready'))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform2f(uniforms.viewport, canvas.width, canvas.height)
      gl.uniform1f(uniforms.sphereRadius, size * ratio)
      gl.uniform2f(uniforms.sphereCenter, center[0] * ratio, (height - center[1]) * ratio)
      gl.uniform3fv(uniforms.foregroundBody,(flightCamera?.foregroundBody??[0,0,0]).map(value=>value*ratio))
      const perspective=flightCamera?.perspective
      gl.uniform1f(uniforms.orbitLens,(perspective?.lens??0)*ratio)
      gl.uniform1f(uniforms.orbitMapBlend,perspective?.mapBlend??0)
      for(const name of ['moon','earth','sun']) gl.uniform4fv(uniforms['orbit'+name[0].toUpperCase()+name.slice(1)],perspective?.[name]??[0,0,0,0])
      gl.uniform1i(uniforms.annotations, Number(annotations))
      gl.uniform1i(uniforms.analysis, Number(!flightCamera))
      gl.uniform1i(uniforms.terrainAnalysis,Number(shadowRequested))
      for (const [name, direction] of Object.entries(orientation)) gl.uniform3fv(uniforms[name], direction)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    if (flightCamera) return
    const [poleX, poleY, poleDepth] = projectSite(southPoleView, orientation)
    const poleLeft = width / 2 + size * poleX
    const poleTop = height / 2 - size * poleY
    if (poleMarker) {
      poleMarker.hidden = poleDepth <= .05 || poleLeft < 6 || poleLeft > width - 6 || poleTop < 6 || poleTop > height - 6
      poleMarker.style.left = poleLeft + 'px'
      poleMarker.style.top = poleTop + 'px'
      poleMarker.classList.toggle('pole-caption-left', poleLeft > width - 122)
    }
    for (const site of sites) {
      const [x, y, depth] = projectSite(site, orientation)
      const left = width / 2 + size * x
      const top = height / 2 - size * y
      const marker = markers.get(site.id)
      marker.hidden = site.lat > northLatitude || depth <= 0 || left < 10 || left > width - 10 || top < 10 || top > height - 10
      marker.style.setProperty('--x', left + 'px')
      marker.style.setProperty('--y', top + 'px')
      marker.classList.toggle('selected', selected === site.id)
      const nearPoleMarker = poleMarker && !poleMarker.hidden && top > poleTop - 18 && top < poleTop + 37 && Math.abs(left - poleLeft) < 55
      marker.classList.toggle('secondary', selected !== site.id && (zoom < 2.4 || nearPoleMarker))
      const label = marker.firstChild.textContent
      marker.classList.toggle('flip', left > width - Math.min(width * .62, label.length * 6.6 + 24))
      marker.setAttribute('aria-pressed', String(selected === site.id))
    }
    if (directions) positionDirections(width, height, size, orientation)
    drawFeatures(width, height, size, ratio, orientation)
  }

  function positionDirections(width, height, size, orientation) {
    for (const [index, name] of ['sun', 'earth'].entries()) {
      const label = directions[name]
      label.hidden = !overlayFrame
      if (!overlayFrame) continue
      const vector = overlayFrame[index]
      const length = Math.hypot(...vector)
      const x = dot(vector, orientation.east) / length
      const y = -dot(vector, orientation.north) / length
      const front = dot(vector, orientation.front) > 0
      const direction = Math.hypot(x, y) < .08 ? (front ? '⊙' : '⊗')
        : ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][(Math.round(Math.atan2(y, x) * 4 / Math.PI) + 8) % 8]
      const title = name === 'sun' ? 'Sun' : 'Earth'
      label.textContent = `${direction} ${title} ${front ? '· near side' : '· far side'}`
      label.style.setProperty('--direction-x', clamp(x * size, 64 - width / 2, width / 2 - 64) + 'px')
      const top = height / 2 + y * size
      label.style.top = clamp(top, 18, height - 52) + (index * 24) + 'px'
    }
  }

  function drawFeatures(width, height, size, ratio, orientation) {
    featureHits = []
    if (!featureContext || featureCanvas.hidden) return
    featureCanvas.width = Math.round(width * ratio)
    featureCanvas.height = Math.round(height * ratio)
    const ctx = featureContext
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.font = '600 11px DM Sans, sans-serif'
    ctx.textBaseline = 'middle'
    const occupied = []
    function label(item, chosen) {
      if (item.lat > northLatitude) return
      const [x, y, depth] = projectSite(item, orientation)
      if (depth < .12) return
      const left = width / 2 + size * x
      const top = height / 2 - size * y
      const textWidth = ctx.measureText(item.name).width
      const textX = left + textWidth + 14 < width ? left + 8 : left - textWidth - 8
      const edge = Math.min(left - 4, textX)
      const end = Math.max(left + 4, textX + textWidth)
      if (edge < 4 || end > width - 4 || top < 10 || top > height - 10) return
      if (occupied.some(box => Math.abs(box.top - top) < 18 && box.left < end + 8 && box.right > edge - 8)) return
      occupied.push({ top, left: edge, right: end })
      featureHits.push({ feature: item, top, left: edge, right: end })
      ctx.fillStyle = chosen ? '#dfaaff' : '#f3f1f7'
      ctx.strokeStyle = '#171321'
      ctx.lineWidth = 3
      ctx.strokeText(item.name, textX, top)
      ctx.fillText(item.name, textX, top)
      ctx.beginPath()
      ctx.arc(left, top, chosen ? 3.5 : 2, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fill()
    }
    if (feature) label(feature, true)
    const minimumDiameter = 320 / zoom ** 1.8
    for (const item of labels) {
      if (item.diameter < minimumDiameter || occupied.length >= 27) break
      if (item.id !== feature?.id) label(item, false)
    }
  }

  function rotate(north, east) {
    latitude = clamp(latitude + north, -90, regionNorthLatitude)
    longitude = (longitude + east) % 360
    draw()
  }
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return
    canvas.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, [event.clientX, event.clientY])
    if (pointers.size === 1) drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, travel: 0 }
    else drag = null
  })
  canvas.addEventListener('pointermove', event => {
    const previous = pointers.get(event.pointerId)
    if (!previous) return
    pointers.set(event.pointerId, [event.clientX, event.clientY])
    if (pointers.size === 2) {
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)[1]
      const before = Math.hypot(previous[0] - other[0], previous[1] - other[1])
      const after = Math.hypot(event.clientX - other[0], event.clientY - other[1])
      if (before > 1) changeZoom(after / before)
      return
    }
    if (drag?.pointer !== event.pointerId) return
    const distance = Math.hypot(event.clientX - drag.x, event.clientY - drag.y)
    if (drag.travel === 0 && distance < 5) return
    rotate((event.clientY - drag.y) * .33 / zoom, (drag.x - event.clientX) * .42 / zoom)
    drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, travel: drag.travel + distance }
  })
  canvas.addEventListener('pointerup', event => {
    pointers.delete(event.pointerId)
    if (drag?.pointer !== event.pointerId) return
    if (ready && !drag.travel) {
      const bounds = canvas.getBoundingClientRect()
      const size = Math.min(bounds.width, bounds.height) * .46 * zoom
      const clientX = event.clientX - bounds.left
      const clientY = event.clientY - bounds.top
      const label = featureHits.find(hit => Math.abs(hit.top - clientY) < 8 && clientX >= hit.left && clientX <= hit.right)
      if (label) {
        onFeature?.(label.feature)
        drag = null
        return
      }
      const x = (clientX - bounds.width / 2) / size
      const y = (bounds.height / 2 - clientY) / size
      const point = pointOnGlobe(x, y, globeOrientation(latitude, longitude))
      if (point) onPoint?.(point)
    }
    drag = null
  })
  canvas.addEventListener('lostpointercapture', event => {
    pointers.delete(event.pointerId)
    if (drag?.pointer === event.pointerId) drag = null
  })
  function changeZoom(factor) { zoom = clamp(zoom * factor, regionNorthLatitude < 0 ? 7.6 : .7, detail ? 120 : 12); draw() }
  canvas.addEventListener('wheel', event => {
    if (!event.ctrlKey) return
    event.preventDefault()
    changeZoom(Math.exp(-event.deltaY * .007))
  }, { passive: false })
  new ResizeObserver(draw).observe(canvas)

  return {
    draw, rotate,
    setLighting(frame) {
      gl.uniform1i(uniforms.dayNight,Number(Boolean(frame)))
      if(frame) {
        const [sun, earth] = frame
        const earthToSun = sun.map((value, i) => value - earth[i])
        const distance = Math.hypot(...earth)
        const phase = -dot(earthToSun, earth) / (Math.hypot(...earthToSun) * distance)
        gl.uniform1f(uniforms.earthshine, earthshine(phase, Math.asin(earthRadius / distance)))
        gl.uniform3fv(uniforms.sun,sun.map(value=>value/radius))
        gl.uniform3fv(uniforms.earth,earth.map(value=>value/radius))
        gl.uniform1i(uniforms.possibleEclipse,Number(totalityPossible(frame[0],frame[1])))
      }
    },
    flight(camera) { flightCamera = camera; draw() },
    camera() {
      const { clientWidth: width, clientHeight: height } = canvas
      return flightCamera ?? { radius: Math.min(width, height) * .46 * zoom, center: [width / 2, height / 2],
        orientation: globeOrientation(latitude, longitude) }
    },
    landCamera(site, scale = 1) {
      latitude = site.lat
      longitude = site.lon
      zoom = scale
      flightCamera = null
      draw()
    },
    viewCenter: () => ({ lat: latitude, lon: longitude }),
    siteAnchor(site) {
      if (!site) return null
      const { clientWidth: width, clientHeight: height } = canvas
      const [x, y, depth] = projectSite(site, globeOrientation(latitude, longitude))
      const size = Math.min(width, height) * .46 * zoom
      return depth > 0 && Math.abs(size * x) < width / 2 && Math.abs(size * y) < height / 2
        ? `calc(50% + ${x * size}px) calc(50% - ${y * size}px)` : null
    },
    heatViewport() {
      const { clientWidth: width, clientHeight: height } = canvas
      if (!width || !height || zoom < 2.5) return null
      const diameter = Math.min(width, height) * .92 * zoom
      return { lat: latitude, lon: longitude, zoom, x: Math.min(.95, 1.12 * width / diameter), y: Math.min(.95, 1.12 * height / diameter) }
    },
    setHeatDetail(patch) {
      if (patch === detailImageData) return
      detailImageData = patch
      gl.uniform1i(uniforms.showDetail, Number(Boolean(patch)))
      if (patch) {
        const { image, view, orientation } = patch
        gl.activeTexture(gl.TEXTURE3)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        gl.activeTexture(gl.TEXTURE0)
        gl.uniform3fv(uniforms.detailEast, orientation.east)
        gl.uniform3fv(uniforms.detailNorth, orientation.north)
        gl.uniform3fv(uniforms.detailFront, orientation.front)
        gl.uniform3f(uniforms.detailSize, view.x, view.y, image.width)
      }
      draw()
    },
    zoom: changeZoom,
    center(site) { latitude = clamp(site.lat, -90, regionNorthLatitude); longitude = site.lon; draw() },
    southPole() { latitude = southPoleView.lat; longitude = southPoleView.lon; zoom = 7.6; draw() },
    setLayers(frame, { visibility: nextVisibility = 0, power: nextPower = false, heatRaster, heatContrast = [0, 1],
      colorByPower = nextPower && !heatRaster, northLatitude: nextNorth = 90, powerMax: nextPowerMax = solarPowerScaleMax, terrainShadows = false } = {}) {
      if (overlayFrame === frame && visibility === nextVisibility && power === nextPower && powerColors === colorByPower && heatVisible === Boolean(heatRaster) &&
          (!heatRaster || heatImage === heatRaster) && northLatitude === nextNorth && powerMax === nextPowerMax && shadowRequested === terrainShadows) return
      overlayFrame = frame
      visibility = nextVisibility
      power = nextPower
      powerColors = colorByPower
      heatVisible = Boolean(heatRaster)
      shadowRequested = terrainShadows
      northLatitude = nextNorth
      powerMax = nextPowerMax
      const required = visibilityRequirements(visibility)
      gl.uniform2f(uniforms.visibility, required & 1, required & 2)
      gl.uniform1i(uniforms.showPower, Number(power))
      gl.uniform1i(uniforms.showHeat, Number(heatVisible))
      gl.uniform1i(uniforms.colorByPower, Number(powerColors))
      gl.uniform2fv(uniforms.heatContrast, heatContrast)
      gl.uniform1f(uniforms.northLatitude, northLatitude * rad)
      gl.uniform1f(uniforms.powerMax, powerMax)
      gl.uniform1i(uniforms.dayNight, Number(Boolean(directions && frame)))
      if (frame) {
        const [sun, earth] = frame
        gl.uniform3fv(uniforms.sun, sun.map(value => value / radius))
        gl.uniform3fv(uniforms.earth, earth.map(value => value / radius))
        gl.uniform1i(uniforms.possibleEclipse, Number(totalityPossible(sun, earth)))
      }
      if (heatRaster && heatImage !== heatRaster) {
        gl.activeTexture(gl.TEXTURE2)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, heatRaster)
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
        gl.activeTexture(gl.TEXTURE0)
        heatImage = heatRaster
        gl.uniform1f(uniforms.heatHeight, heatRaster.height)
      }
      draw()
    },
    reset() { latitude = -12; longitude = 17; zoom = 1; draw() },
    showFeatures(index, selectedFeature) {
      labels = index
      feature = selectedFeature
      featureCanvas.hidden = !labels.length && !feature
      draw()
    },
    setSiteScores(scores) {
      if (scores === appliedScores && !scoresDirty) return
      appliedScores = scores
      scoresDirty = false
      for (const [id, marker] of markers) {
        const score = scores?.get(id)
        marker.classList.toggle('mission-pin', Boolean(score?.color))
        marker.classList.toggle('overlap-pin', Boolean(score?.overlap))
        marker.classList.toggle('mission-zero', Boolean(score?.nearZero))
        marker.style.setProperty('--mission-color', score?.color ?? '')
        marker.setAttribute('aria-label', score ? marker.title + ' on the Moon · ' + score.label : marker.title + ' on the Moon')
        marker.firstChild.textContent = score ? marker.title + ' · ' + score.number : marker.title
      }
      draw()
    },
    setSites(newSites, active) {
      sites = newSites
      selected = active
      const ids = new Set(sites.map(site => site.id))
      for (const [id, marker] of markers) {
        if (!ids.has(id)) { marker.remove(); markers.delete(id) }
      }
      for (const site of sites) {
        if (!markers.has(site.id)) {
          const marker = document.createElement('button')
          marker.type = 'button'
          marker.className = 'pin globe-pin' + (site.kind.includes('Historic') ? '' : ' feature')
          if (site.kind === 'Landing suggestion') marker.classList.add('landing-pin')
          const label = document.createElement('span')
          label.className = 'pin-text'
          marker.append(label)
          if (onSelect) marker.addEventListener('click', () => onSelect(site.id))
          else marker.tabIndex = -1
          markers.set(site.id, marker)
          markerLayer.append(marker)
        }
        const marker = markers.get(site.id)
        if (marker.title !== site.displayName) {
          marker.setAttribute('aria-label', site.displayName + ' on the Moon')
          marker.title = site.displayName
          marker.firstChild.textContent = site.displayName
        }
      }
      scoresDirty = true
      draw()
    },
  }
}
