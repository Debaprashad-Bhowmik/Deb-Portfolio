export type Patch = {
  id: string
  name: string
  slope: number
  lat: number
  lon: number
  energy: number
  earthHours: number
  earthTotal: number
  sunHours: number
  sunWindows: [number, number][]
  earthWindows: [number, number][]
  averageWatts: number
  longestEarthGap: number
}

export const priorityLabels = { earth: 'Best communications', solar: 'Best solar power', balanced: 'Best balance' }
export type Priority = keyof typeof priorityLabels
export type Recommendation = { priority: Priority; id: string; qualifies: boolean }
export type Rankings = { patches: Patch[]; recommendations: Recommendation[] }
export type ComparisonSnapshot = {
  epoch: number
  vectors: [number[], number[]]
  samples: Record<string, {
    sun: number
    sunStatus: string
    earth: number
    earthStatus: string
    power: number
  }>
}

export const hour = 3_600_000
export const missionTimeStep = (duration: number) => duration <= 720 ? .25 : 1
export const utc = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
export const metric = (value: number, digits: number) => value.toLocaleString('en', { maximumFractionDigits: digits })
export const coordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(4)}°${value < 0 ? negative : positive}`
