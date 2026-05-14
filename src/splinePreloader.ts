const splineViewerScriptSrc = 'https://unpkg.com/@splinetool/viewer@1.12.92/build/spline-viewer.js'
const splineRobotSceneUrl = 'https://prod.spline.design/MyyGlMKNvEm8rRdZ/scene.splinecode'
let splineViewerScriptPromise: Promise<void> | null = null

export function loadSplineViewerScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve()
  }

  if (window.customElements.get('spline-viewer')) {
    return Promise.resolve()
  }

  if (splineViewerScriptPromise) {
    return splineViewerScriptPromise
  }

  splineViewerScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${splineViewerScriptSrc}"]`
    )

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Spline viewer failed to load')),
        { once: true }
      )
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = splineViewerScriptSrc
    script.async = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener(
      'error',
      () => reject(new Error('Spline viewer failed to load')),
      { once: true }
    )
    document.head.appendChild(script)
  })

  return splineViewerScriptPromise
}

let splineSceneResolve: (() => void) | null = null
const splineSceneLoadedPromise = new Promise<void>((resolve) => {
  splineSceneResolve = resolve
})

export function notifySplineSceneLoaded(): void {
  if (splineSceneResolve) {
    splineSceneResolve()
    splineSceneResolve = null
  }
}

export function waitForSplineScene(): Promise<void> {
  return splineSceneLoadedPromise
}

export function getSplineSceneUrl(): string {
  return splineRobotSceneUrl
}

loadSplineViewerScript()
