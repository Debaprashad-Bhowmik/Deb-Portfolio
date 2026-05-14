let hvacResolve: (() => void) | null = null
let cubesatResolve: (() => void) | null = null

const hvacPromise = new Promise<void>((resolve) => { hvacResolve = resolve })
const cubesatPromise = new Promise<void>((resolve) => { cubesatResolve = resolve })

export function notifyHvacReady(): void {
  if (hvacResolve) { hvacResolve(); hvacResolve = null }
}

export function notifyCubesatReady(): void {
  if (cubesatResolve) { cubesatResolve(); cubesatResolve = null }
}

export function waitForAllScenes(): Promise<void[]> {
  return Promise.all([
    hvacPromise,
    cubesatPromise,
  ])
}
