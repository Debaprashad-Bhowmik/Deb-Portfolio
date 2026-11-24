import { useEffect, useState, useRef, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import LunarMissionTimeline, { type MissionTimeline } from './LunarMissionTimeline'
import { coordinate, hour, metric, priorityLabels, utc, type ComparisonSnapshot, type Patch, type Priority, type Rankings } from './lunarMission'

type Props = Rankings & {
  epoch: number
  timeline: MissionTimeline
  snapshot: ComparisonSnapshot | null
  onVisit: (id: string) => void
}

const priorities: Priority[] = ['earth', 'solar', 'balanced']
const percent = (value: number, total: number) => Math.min(100, Math.max(0, value / total * 100))
const degrees = (value: number) => `${value > 0 ? '+' : ''}${metric(value, 2)}°`
const mapLayers = [
  { id: 'sun', label: 'Sunlight now' },
  { id: 'earth', label: 'Earth in view now' },
  { id: 'shadows', label: 'Crater shadows' },
] as const

function ComparisonMap({ patch, vectors, onVisit, ready }: {
  patch: Patch
  vectors: ComparisonSnapshot['vectors'] | undefined
  onVisit: () => void
  ready: boolean
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [layers, setLayers] = useState({ sun: false, earth: false, shadows: true })
  const { id, name, lat, lon } = patch

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type !== 'lunar-comparison-map-status') return
      if (event.data.status === 'ready' || event.data.status === 'error') setStatus(event.data.status)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])

  useEffect(() => {
    if (status === 'ready') {
      frame.current?.contentWindow?.postMessage({
        type: 'lunar-comparison-map', action: 'update', patch: { id, name, lat, lon }, vectors, layers,
      }, window.location.origin)
    }
  }, [id, name, lat, lon, status, vectors, layers])

  function move(action: 'zoom-in' | 'zoom-out' | 'center') {
    frame.current?.contentWindow?.postMessage({ type: 'lunar-comparison-map', action }, window.location.origin)
  }

  return (
    <>
      <div className="lunar-comparison-layers" role="group" aria-label={`Map layers for ${patch.name}`}>
        {mapLayers.map(layer => (
          <label key={layer.id}>
            <input type="checkbox" data-layer={layer.id} checked={layers[layer.id]} disabled={status !== 'ready' || !vectors}
              onChange={event => setLayers({ ...layers, [layer.id]: event.target.checked })} />
            {layer.label}
          </label>
        ))}
      </div>
      <div className="lunar-comparison-stage">
        <iframe ref={frame} src="/lunar-scene/compare.html" loading="lazy" title={`South Pole map for ${patch.name}`} />
        {status === 'error' && <p className="lunar-scene-overlay">3D map unavailable</p>}
      </div>
      <div className="lunar-comparison-actions" role="group" aria-label={`Controls for ${patch.name}`}>
        <button className="lunar-scene-button" type="button" aria-label="Zoom in" title="Zoom in" disabled={status !== 'ready'} onClick={() => move('zoom-in')}><Plus size={15} aria-hidden="true" /></button>
        <button className="lunar-scene-button" type="button" aria-label="Zoom out" title="Zoom out" disabled={status !== 'ready'} onClick={() => move('zoom-out')}><Minus size={15} aria-hidden="true" /></button>
        <button className="lunar-scene-button" type="button" disabled={status !== 'ready'} onClick={() => move('center')}>Center site</button>
        <button className="lunar-scene-button" type="button" disabled={!ready} onClick={onVisit}>Open Surface</button>
      </div>
    </>
  )
}

function MissionBar({ label, value, fraction, kind }: { label: string; value: string; fraction: number; kind: 'sun' | 'earth' }) {
  return (
    <div className={`lunar-comparison-score is-${kind}`}>
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="lunar-comparison-track" aria-hidden="true"><span style={{ width: `${fraction}%` }} /></div>
    </div>
  )
}

function Availability({ label, windows, total, duration, elapsed, kind }: {
  label: string
  windows: [number, number][]
  total: number
  duration: number
  elapsed: number
  kind: 'sun' | 'earth'
}) {
  const share = percent(total, duration)
  return (
    <div className={`lunar-comparison-availability is-${kind}`}>
      <span>{label}</span>
      <div className="lunar-comparison-track" aria-hidden="true">
        {windows.map(([start, end]) => <span key={start} style={{
          left: `${percent(start, duration)}%`, width: `${percent(end, duration) - percent(start, duration)}%`,
        }} />)}
        <i style={{ left: `${percent(elapsed, duration)}%` }} />
      </div>
      <strong>{metric(total, 1)} h · {metric(share, 1)}%</strong>
    </div>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return <div><dt>{label}</dt><dd>{children}</dd></div>
}

export default function LunarComparison({ recommendations, patches, epoch, timeline, snapshot, onVisit }: Props) {
  const { duration, elapsed } = timeline
  const [selection, setSelection] = useState<Partial<Record<Priority, string>>>({})
  const scenarios = priorities.flatMap(priority => {
    const recommendation = recommendations.find(entry => entry.priority === priority)
    const patch = patches.find(entry => entry.id === (selection[priority] ?? recommendation?.id))
    return recommendation && patch ? [{ priority, recommendation, patch }] : []
  })
  const maxEnergy = Math.max(0, ...scenarios.map(({ patch }) => patch.energy)) || 1
  const sceneTime = snapshot?.epoch ?? epoch + elapsed * hour

  return (
    <div className="lunar-comparison-panel">
      <div className="lunar-comparison-header">
        <div>
          <p>{utc.format(epoch)} UTC · {metric(duration, 0)} h mission</p>
          <p>Drag a map to rotate it.</p>
          <p>Violet marks crater shadows on the day side within the outline. The broad dark area is lunar night.</p>
          <p>Gold shows sunlight, blue shows Earth visibility, and teal shows where both are available.</p>
        </div>
        <button className="lunar-scene-button" type="button" onClick={() => setSelection({})}>Use recommended patches</button>
      </div>
      <LunarMissionTimeline context="comparison" {...timeline} />
      <div className="lunar-comparison-grid">
        {scenarios.map(({ priority, recommendation, patch }) => {
          const sample = snapshot?.samples[patch.id]
          return (
            <article className="lunar-comparison-card" key={priority} aria-label={priorityLabels[priority]}>
              <h4>{priorityLabels[priority]}</h4>
              <label className="lunar-comparison-choice">Site
                <select value={patch.id} onChange={event => setSelection({ ...selection, [priority]: event.target.value })}>
                  {patches.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                </select>
              </label>
              <p className="lunar-comparison-location">
                {coordinate(patch.lat, 'N', 'S')}, {coordinate(patch.lon, 'E', 'W')}
                {patch.id === recommendation.id && <span>{recommendation.qualifies ? 'Recommended' : 'Closest match'}</span>}
              </p>
              <ComparisonMap patch={patch} vectors={snapshot?.vectors} ready={!timeline.disabled} onVisit={() => onVisit(patch.id)} />
              <time dateTime={new Date(sceneTime).toISOString()}>{utc.format(sceneTime)} UTC</time>
              <dl className="lunar-comparison-live">
                <Stat label="Sun elevation">{sample ? `${degrees(sample.sun)} · ${sample.sunStatus}` : '—'}</Stat>
                <Stat label="Earth view">{sample ? `${sample.earthStatus} · ${degrees(sample.earth)}` : '—'}</Stat>
                <Stat label="Solar power">{sample ? `${metric(sample.power, 1)} W/m²` : '—'}</Stat>
              </dl>
              <div className="lunar-comparison-totals">
                <h5>Over the mission</h5>
                <MissionBar label="Solar energy" value={`${metric(patch.energy, 2)} kWh/m²`}
                  fraction={percent(patch.energy, maxEnergy)} kind="sun" />
                <MissionBar label="Continuous Earth view" value={`${metric(patch.earthHours, 1)} h`}
                  fraction={percent(patch.earthHours, duration)} kind="earth" />
                <div className="lunar-comparison-windows">
                  <Availability label="Sunlight" windows={patch.sunWindows} total={patch.sunHours} duration={duration} elapsed={elapsed} kind="sun" />
                  <Availability label="Earth view" windows={patch.earthWindows} total={patch.earthTotal} duration={duration} elapsed={elapsed} kind="earth" />
                </div>
                <p className="lunar-comparison-slope">Slope <strong>{metric(patch.slope, 2)}°</strong> over 100 m</p>
                <details className="lunar-comparison-details">
                  <summary>More metrics</summary>
                  <dl>
                    <Stat label="Average solar power">{metric(patch.averageWatts, 2)} W/m²</Stat>
                    <Stat label="Longest Earth blackout">{metric(patch.longestEarthGap, 2)} h</Stat>
                  </dl>
                </details>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
