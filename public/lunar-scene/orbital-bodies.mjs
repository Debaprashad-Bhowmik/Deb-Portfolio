import { sphereIntersectionGLSL } from './orbital-geometry.mjs'

export function createOrbitalBodies(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, preserveDrawingBuffer:true })
  if (!gl) throw new Error('WebGL is required for the orbital view.')
  const vertex = 'attribute vec2 point; void main(){gl_Position=vec4(point,0.,1.);}'
  const fragment = `
    precision highp float;
    uniform vec2 viewport;
    uniform float lens, sunGlow;
    uniform vec4 earth, sun, moon;
    uniform vec3 light;
    uniform mat3 earthFrame;
    uniform sampler2D earthMap, sunMap;
    const float pi=3.14159265359;
    ${sphereIntersectionGLSL}
    void main() {
      vec2 pixel=gl_FragCoord.xy-viewport*.5;
      vec3 ray=normalize(vec3(pixel/lens,1.0));
      float earthHit=hitSphere(ray,earth);
      float sunHit=hitSphere(ray,sun);
      float moonHit=hitSphere(ray,moon);
      vec4 color=vec4(0.);
      if(earthHit<min(sunHit,moonHit) && earthHit<1.0e19) {
        vec3 normal=normalize(ray*earthHit-earth.xyz);
        vec3 local=earthFrame*normal;
        vec2 uv=vec2(atan(local.y,local.x)/(2.*pi)+.5,.5-asin(clamp(local.z,-1.,1.))/pi);
        vec3 albedo=texture2D(earthMap,uv).rgb;
        float incidence=dot(normal,light);
        float diffuse=sqrt(max(0.,incidence));
        float day=smoothstep(-.05,.12,incidence);
        float atmosphere=pow(1.-max(0.,dot(normal,-ray)),3.8)*day;
        float ocean=step(albedo.r*1.15,albedo.b)*step(albedo.g*.8,albedo.b);
        float specular=pow(max(0.,dot(normal,normalize(light-ray))),65.)*ocean*.25*day;
        color=vec4(pow(albedo,vec3(.82))*(.035+.965*diffuse)+vec3(.07,.20,.46)*atmosphere+specular,1.);
      } else if(sunHit<min(earthHit,moonHit) && sunHit<1.0e19) {
        vec3 normal=normalize(ray*sunHit-sun.xyz);
        vec2 uv=vec2(.5)+vec2(normal.x,-normal.y)*(404./1024.);
        vec3 archive=texture2D(sunMap,uv).rgb;
        float intensity=clamp(dot(archive,vec3(.2126,.7152,.0722))/.58,0.,1.);
        color=vec4(vec3(1.,.94,.78)*pow(intensity,.75),1.);
      } else if(min(earthHit,moonHit)>1.0e19 && sunGlow>0.0) {
        // Decorative glare never paints over a nearer opaque body, and a
        // fully occulted Sun has no glare. Its physical disk is never enlarged.
        float sr=length(cross(ray,normalize(sun.xyz)))*length(sun.xyz)/sun.w;
        if(dot(ray,sun.xyz)>0. && sr>1. && sr<4.) {
          float glow=exp(-(sr-1.)*3.)*.28;
          color=vec4(vec3(1.,.84,.55)*glow,glow);
        }
      }
      gl_FragColor=color;
    }`
  const program=gl.createProgram()
  for (const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]) {
    const shader=gl.createShader(type)
    gl.shaderSource(shader,source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
    gl.attachShader(program,shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
  gl.useProgram(program)
  const buffer=gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
  const attribute=gl.getAttribLocation(program,'point')
  gl.enableVertexAttribArray(attribute)
  gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0)
  const uniforms=Object.fromEntries(['viewport','lens','sunGlow','earth','sun','moon','light','earthFrame','earthMap','sunMap'].map(name=>[name,gl.getUniformLocation(program,name)]))
  let latest
  const ready=Promise.all([['earthMap','./assets/earth-clouds.webp'],['sunMap','./assets/sun-sdo.jpg']].map(([name,path],unit)=>
    new Promise(resolve=>{
      const texture=gl.createTexture()
      gl.activeTexture(gl.TEXTURE0+unit)
      gl.bindTexture(gl.TEXTURE_2D,texture)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([80,100,130,255]))
      for(const option of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D,option,gl.LINEAR)
      for(const option of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D,option,gl.CLAMP_TO_EDGE)
      gl.uniform1i(uniforms[name],unit)
      const image=new Image()
      image.onload=()=>{
        gl.activeTexture(gl.TEXTURE0+unit)
        gl.bindTexture(gl.TEXTURE_2D,texture)
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)
        resolve()
        if(latest) draw(latest)
      }
      image.onerror=()=>resolve()
      image.src=new URL(path,import.meta.url).href
    })
  ))
  function draw({ earth, sun, moon, lens, sunGlow = 1, light, basis }) {
    latest={earth,sun,moon,lens,sunGlow,light,basis}
    const ratio=Math.min(devicePixelRatio||1,2)
    const width=Math.round(canvas.clientWidth*ratio),height=Math.round(canvas.clientHeight*ratio)
    if(!width||!height)return
    if(canvas.width!==width||canvas.height!==height) {canvas.width=width;canvas.height=height}
    gl.viewport(0,0,width,height)
    gl.uniform2f(uniforms.viewport,width,height)
    gl.uniform4fv(uniforms.earth,earth)
    gl.uniform4fv(uniforms.sun,sun)
    gl.uniform4fv(uniforms.moon,moon)
    gl.uniform1f(uniforms.lens,lens*ratio)
    gl.uniform1f(uniforms.sunGlow,sunGlow)
    gl.uniform3fv(uniforms.light,light)
    gl.uniformMatrix3fv(uniforms.earthFrame,false,basis.flat())
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
  }
  return {draw,ready}
}
