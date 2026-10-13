import * as THREE from 'three'

// The anatomical shell is context, never a selectable or simulated component.
// Its geometry is credited in public/brain/README.md and LICENSE.txt.
export const cortexMaterial = () => new THREE.ShaderMaterial({
  uniforms: { uVisibility: { value: 1 } },
  vertexShader: `
    varying vec3 vNormal; varying vec3 vEye; varying vec3 vPosition;
    void main() {
      vec4 eye = modelViewMatrix * vec4(position, 1.);
      vNormal = normalize(normalMatrix * normal);
      vEye = normalize(-eye.xyz); vPosition = position;
      gl_Position = projectionMatrix * eye;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal; varying vec3 vEye; varying vec3 vPosition;
    uniform float uVisibility;
    void main() {
      float facing = abs(dot(normalize(vNormal), normalize(vEye)));
      float rim = pow(1. - facing, 2.4);
      vec3 cyan = vec3(.12, .85, .9), pink = vec3(1., .28, .65);
      vec3 amber = vec3(1., .5, .12), lilac = vec3(.62, .43, 1.);
      vec3 color = mix(cyan, pink, smoothstep(-100., 110., vPosition.x));
      color = mix(color, amber, smoothstep(-40., 160., vPosition.z) * .78);
      color = mix(color, lilac, smoothstep(10., 140., vPosition.y) * .4);
      // The real cortical folds contribute their own interior silhouettes.
      gl_FragColor = vec4(color, (.015 + rim * .38) * uVisibility);
    }
  `,
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
})

export async function loadCortex(signal: AbortSignal) {
  const response = await fetch('/brain/cortex.bin', { signal })
  if (!response.ok) throw new Error('Cortical surface unavailable')
  const buffer = await response.arrayBuffer()
  const header = new DataView(buffer)
  const vertices = header.getUint32(0, true), indices = header.getUint32(4, true)
  if (buffer.byteLength !== 8 + vertices * 12 + indices * 2) throw new Error('Invalid cortical surface')
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(buffer, 8, vertices * 3), 3))
  geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(buffer, 8 + vertices * 12, indices), 1))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
