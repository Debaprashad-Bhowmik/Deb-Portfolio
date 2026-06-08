import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/CAT_C32_1417KW_Engine-optimized.glb'
const MODEL_PRELOAD_TIMEOUT_MS = 30000

export type EnginePreloadStatus = 'loaded' | 'failed' | 'timed-out'

export type EnginePreloadResult = {
  status: EnginePreloadStatus
  gltf: GLTF | null
  error?: unknown
}

let preloadPromise: Promise<EnginePreloadResult> | null = null
let cachedGLTF: GLTF | null = null

async function loadCatModel(): Promise<EnginePreloadResult> {
  try {
    const [, gltfModule, dracoModule] = await Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
    ])

    const { GLTFLoader } = gltfModule
    const { DRACOLoader } = dracoModule

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/draco/')
    dracoLoader.setDecoderConfig({ type: 'js' })

    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)

    const gltf = await new Promise<GLTF>((resolve, reject) => {
      loader.load(MODEL_URL, resolve, undefined, reject)
    })

    cachedGLTF = gltf
    return { status: 'loaded', gltf }
  } catch (error) {
    console.warn('[enginePreloader] Model preload failed:', error)
    return { status: 'failed', gltf: null, error }
  }
}

export function startModelPreload(): Promise<EnginePreloadResult> {
  if (preloadPromise) return preloadPromise

  const loadPromise = loadCatModel()

  preloadPromise = new Promise<EnginePreloadResult>((resolve) => {
    let settled = false
    const timeoutId = window.setTimeout(() => {
      settled = true
      console.warn('[enginePreloader] Model preload timed out')
      resolve({
        status: 'timed-out',
        gltf: null,
        error: new Error('CAT model preload timed out'),
      })
    }, MODEL_PRELOAD_TIMEOUT_MS)

    loadPromise.then((result) => {
      if (result.status === 'loaded') {
        cachedGLTF = result.gltf
      }

      if (settled) return
      settled = true
      window.clearTimeout(timeoutId)
      resolve(result)
    })
  })

  return preloadPromise
}

export function getPreloadedGLTF(): GLTF | null {
  return cachedGLTF
}

export function getPreloadPromise(): Promise<EnginePreloadResult> | null {
  return preloadPromise
}
