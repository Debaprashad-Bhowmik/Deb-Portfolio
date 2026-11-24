import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/CAT_C32_1417KW_Engine-optimized.glb'
const MODEL_LOAD_TIMEOUT_MS = 30000

let loadPromise: Promise<GLTF | null> | null = null
let cachedGLTF: GLTF | null = null

async function loadCatModel(): Promise<GLTF> {
  const [gltfModule, dracoModule] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/loaders/DRACOLoader.js'),
  ])
  const dracoLoader = new dracoModule.DRACOLoader()
  dracoLoader.setDecoderPath('/draco/')
  dracoLoader.setDecoderConfig({ type: 'js' })

  try {
    const loader = new gltfModule.GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    return await loader.loadAsync(MODEL_URL)
  } finally {
    dracoLoader.dispose()
  }
}

export function loadEngineModel(): Promise<GLTF | null> {
  if (cachedGLTF) return Promise.resolve(cachedGLTF)
  if (loadPromise) return loadPromise

  const model = loadCatModel().then((gltf) => {
    cachedGLTF = gltf
    return gltf
  }).catch((error: unknown) => {
    console.warn('Could not load the CAT engine model:', error)
    return null
  })
  let timeoutId = 0
  const timeout = new Promise<null>((resolve) => {
    timeoutId = window.setTimeout(() => resolve(null), MODEL_LOAD_TIMEOUT_MS)
  })
  loadPromise = Promise.race([model, timeout]).finally(() => window.clearTimeout(timeoutId))
  return loadPromise
}
