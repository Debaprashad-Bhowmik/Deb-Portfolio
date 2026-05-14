/**
 * enginePreloader.ts
 *
 * Pre-loads and pre-parses the CAT C32 engine GLB model during the loading
 * screen so it's immediately available when the EngineModelViewer mounts.
 *
 * This avoids the sequential chain of:
 *   dynamic import(three) → import(GLTFLoader) → import(DRACOLoader)
 *   → fetch DRACO decoder JS → fetch GLB → DRACO decode → mesh construction
 * all happening after the loading screen dismisses.
 */

import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/models/CAT_C32_1417KW_Engine-optimized.glb'

let preloadPromise: Promise<GLTF | null> | null = null
let cachedGLTF: GLTF | null = null

/**
 * Kicks off the full model preload pipeline (imports, DRACO init, GLB parse).
 * Returns a promise that resolves to the parsed GLTF, or null on failure.
 * Safe to call multiple times — only runs once.
 */
export function startModelPreload(): Promise<GLTF | null> {
  if (preloadPromise) return preloadPromise

  preloadPromise = (async () => {
    try {
      // Import Three.js modules in parallel
      const [, gltfModule, dracoModule] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
        import('three/examples/jsm/loaders/DRACOLoader.js'),
      ])

      const { GLTFLoader } = gltfModule
      const { DRACOLoader } = dracoModule

      // Set up DRACO decoder
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('/draco/')
      dracoLoader.setDecoderConfig({ type: 'js' })

      // Set up GLTF loader
      const loader = new GLTFLoader()
      loader.setDRACOLoader(dracoLoader)

      // Load and parse the model
      const gltf = await new Promise<GLTF>((resolve, reject) => {
        loader.load(MODEL_URL, resolve, undefined, reject)
      })

      cachedGLTF = gltf
      return gltf
    } catch (err) {
      console.warn('[enginePreloader] Model preload failed:', err)
      return null
    }
  })()

  return preloadPromise
}

/**
 * Returns the pre-loaded GLTF if available, or null.
 */
export function getPreloadedGLTF(): GLTF | null {
  return cachedGLTF
}

/**
 * Returns the preload promise (or null if not started).
 * Allows EngineModelViewer to await the result if the
 * preload was started but hasn't finished yet.
 */
export function getPreloadPromise(): Promise<GLTF | null> | null {
  return preloadPromise
}
