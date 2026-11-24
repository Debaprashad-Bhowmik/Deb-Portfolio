// Display focus only. No terrain elevations or planning inputs are changed.
export function distantFocusRange(height = 2, zoom = 1) {
  const lift = Math.max(0, height - 2)
  const scale = Math.max(1, zoom)
  return [60 * scale + lift * 8, 800 * scale + lift * 30]
}

const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position,0.0,1.0); }
`
const fragment = `
precision highp float;
uniform sampler2D scene;
uniform vec2 texel, focusRange;
uniform float radius;
varying vec2 uv;
void main() {
  vec4 center = texture2D(scene,uv);
  if (center.a < .02) { gl_FragColor = vec4(0.0); return; }
  float depth = exp2((center.a - .0625) * 20.0) - 1.0;
  float amount = smoothstep(focusRange.x,focusRange.y,depth);
  float blur = radius * amount;
  if (blur < .15) { gl_FragColor = vec4(center.rgb,1.0); return; }
  vec3 color = vec3(0.0);
  float total = 0.0;
  // A bounded, depth-aware gather: keep the lunar silhouette and foreground
  // sharp, and never pull black sky or another depth layer into the terrain.
  for (int x=-2; x<=2; x++) for (int y=-2; y<=2; y++) {
    vec2 offset = vec2(float(x),float(y));
    // Fixed tap positions and continuously varying weights avoid kernel
    // sampling jumps as camera depth changes between neighboring frames.
    vec4 tap = texture2D(scene,uv + offset * texel * radius * .5);
    float weight = exp(-dot(offset,offset) / max(.01,2.0*amount*amount));
    weight *= step(.02,tap.a) * (1.0-smoothstep(.025,.065,abs(tap.a-center.a)));
    color += tap.rgb * weight;
    total += weight;
  }
  gl_FragColor = vec4(color / max(total,.001),1.0);
}
`

export function createDistantFocus(gl) {
  // A 16-bit depth attachment can introduce new ground/rock z-fighting.
  // Keep the original sharp renderer on devices without 24/32-bit depth.
  if (!gl.getExtension('WEBGL_depth_texture')) return null
  const program = gl.createProgram()
  for (const [type, source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=gl.createShader(type)
    gl.shaderSource(shader,source); gl.compileShader(shader)
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) { gl.deleteShader(shader); gl.deleteProgram(program); return null }
    gl.attachShader(program,shader); gl.deleteShader(shader)
  }
  gl.bindAttribLocation(program,0,'position'); gl.linkProgram(program)
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) { gl.deleteProgram(program); return null }
  const uniforms=Object.fromEntries(['scene','texel','focusRange','radius'].map(name=>[name,gl.getUniformLocation(program,name)]))
  const quad=gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,quad)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
  const target=gl.createFramebuffer(),color=gl.createTexture(),depth=gl.createTexture()
  let size='',ready=false
  return {
    begin(width,height) {
      if (size!==`${width}/${height}`) {
        size=`${width}/${height}`
        gl.bindFramebuffer(gl.FRAMEBUFFER,target)
        gl.activeTexture(gl.TEXTURE6)
        for (const [texture,format,type,attachment] of [[color,gl.RGBA,gl.UNSIGNED_BYTE,gl.COLOR_ATTACHMENT0],
          [depth,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,gl.DEPTH_ATTACHMENT]]) {
          gl.bindTexture(gl.TEXTURE_2D,texture)
          gl.texImage2D(gl.TEXTURE_2D,0,format,width,height,0,format,type,null)
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST)
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
          gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
          gl.framebufferTexture2D(gl.FRAMEBUFFER,attachment,gl.TEXTURE_2D,texture,0)
        }
        ready=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER,ready?target:null)
      return ready
    },
    finish(width,height,pixel,range,enabled) {
      gl.bindFramebuffer(gl.FRAMEBUFFER,null)
      gl.viewport(0,0,width,height)
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
      gl.disable(gl.DEPTH_TEST)
      gl.useProgram(program)
      gl.activeTexture(gl.TEXTURE6); gl.bindTexture(gl.TEXTURE_2D,color)
      gl.uniform1i(uniforms.scene,6)
      gl.uniform2f(uniforms.texel,1/width,1/height)
      gl.uniform2fv(uniforms.focusRange,range)
      gl.uniform1f(uniforms.radius,enabled?5.2*pixel:0)
      gl.bindBuffer(gl.ARRAY_BUFFER,quad)
      gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0)
      for (const index of [1,2,3]) gl.disableVertexAttribArray(index)
      gl.drawArrays(gl.TRIANGLES,0,6)
      gl.enable(gl.DEPTH_TEST); gl.enableVertexAttribArray(1)
    },
  }
}
