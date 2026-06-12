let engineResolve: (() => void) | null = null
let hvacResolve: (() => void) | null = null
let cubesatResolve: (() => void) | null = null

const enginePromise = new Promise<void>((resolve) => { engineResolve = resolve })
const hvacPromise = new Promise<void>((resolve) => { hvacResolve = resolve })
const cubesatPromise = new Promise<void>((resolve) => { cubesatResolve = resolve })

export function notifyEngineReady(): void {
  if (engineResolve) { engineResolve(); engineResolve = null }
}

export function notifyHvacReady(): void {
  if (hvacResolve) { hvacResolve(); hvacResolve = null }
}

export function notifyCubesatReady(): void {
  if (cubesatResolve) { cubesatResolve(); cubesatResolve = null }
}

export function waitForEngineReady(): Promise<void> {
  return enginePromise
}

export function waitForAllScenes(): Promise<void[]> {
  return Promise.all([
    hvacPromise,
    cubesatPromise,
  ])
}
