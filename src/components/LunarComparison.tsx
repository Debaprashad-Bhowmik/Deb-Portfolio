import { useCallback, useEffect, useState, useRef, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'
import LunarMissionTimeline, { type MissionTimeline } from './LunarMissionTimeline'
import { coordinate, hour, metric, priorityLabels, utc, type ComparisonSnapshot, type MissionSite, type Priority, type Rankings } from './lunarMission'

type Props = Rankings & {
  epoch: number
  timeline: MissionTimeline
  snapshot: ComparisonSnapshot | null
}

const priorities: Priority[] = ['earth', 'solar', 'balanced']
const percent = (value: number, total: number) => Math.min(100, Math.max(0, value / total * 100))
const degrees = (value: number) => `${value > 0 ? '+' : ''}${metric(value, 2)}°`
const mapLayers = [
  { id: 'sun', label: 'Sunlight now' },
  { id: 'earth', label: 'Earth in view now' },
  { id: 'shadows', label: 'Crater shadows' },
] as const

function ComparisonViewer({ site, snapshot }: {
  site: MissionSite
  snapshot: ComparisonSnapshot | null
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [onSurface, setOnSurface] = useState(false)
  const [layers, setLayers] = useState({ sun: false, earth: false, shadows: true })
  const { id, name, kind, lat, lon, surface } = site
  const vectors = snapshot?.vectors
  const epoch = snapshot?.epoch
  const rotation = snapshot?.rotation
  const requestStatus = useCallback(() => {
    frame.current?.contentWindow?.postMessage({ type: 'lunar-comparison-map', action: 'status' }, window.location.origin)
  }, [])
  const syncViewer = useCallback(() => {
    const patch = { id, name, kind, lat, lon }
    frame.current?.contentWindow?.postMessage({
      type: 'lunar-comparison-map', action: 'update',
      patch: onSurface ? { ...patch, ...surface } : patch, vectors, layers, epoch, rotation,
    }, window.location.origin)
  }, [id, name, kind, lat, lon, onSurface, surface, vectors, layers, epoch, rotation])

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return
      if (event.data?.type !== 'lunar-comparison-map-status') return
      if (['loading', 'ready', 'error'].includes(event.data.status)) setStatus(event.data.status)
    }
    window.addEventListener('message', receive)
    requestStatus()
    return () => window.removeEventListener('message', receive)
  }, [requestStatus])

  useEffect(() => {
    if (onSurface || status === 'ready') syncViewer()
  }, [onSurface, status, syncViewer])

  function move(action: 'zoom-in' | 'zoom-out' | 'center' | 'reset') {
    frame.current?.contentWindow?.postMessage({ type: 'lunar-comparison-map', action }, window.location.origin)
  }

  return (
    <>
      {onSurface ? <p className="lunar-comparison-surface-help">Drag to look. Click the view to walk with <strong>WASD</strong>.</p> : (
        <div className="lunar-comparison-layers" role="group" aria-label={`Map layers for ${site.name}`}>
          {mapLayers.map(layer => (
            <label key={layer.id}>
              <input type="checkbox" data-layer={layer.id} checked={layers[layer.id]} disabled={status !== 'ready' || !vectors}
                onChange={event => setLayers({ ...layers, [layer.id]: event.target.checked })} />
              {layer.label}
            </label>
          ))}
        </div>
      )}
      <div className="lunar-comparison-stage">
        <iframe key={onSurface ? 'surface' : 'map'} ref={frame}
          src={onSurface ? '/lunar-scene/compare-surface.html' : '/lunar-scene/compare.html'}
          loading={onSurface ? 'eager' : 'lazy'}
          title={onSurface ? `Surface at ${name}` : `Moon map for ${name}`}
          onLoad={() => { requestStatus(); syncViewer() }} />
        {onSurface && status === 'loading' && <p className="lunar-scene-overlay" role="status">Loading terrain…</p>}
        {status === 'error' && <p className="lunar-scene-overlay" role="status">{onSurface ? 'Surface unavailable' : '3D map unavailable'}</p>}
      </div>
      <div className="lunar-comparison-actions" role="group" aria-label={`Controls for ${site.name}`}>
        {onSurface ? (
          <button className="lunar-scene-button" type="button" disabled={status !== 'ready'} onClick={() => move('reset')}>Return to landing</button>
        ) : (
          <>
            <button className="lunar-scene-button" type="button" aria-label="Zoom in" title="Zoom in" disabled={status !== 'ready'} onClick={() => move('zoom-in')}><Plus size={15} aria-hidden="true" /></button>
            <button className="lunar-scene-button" type="button" aria-label="Zoom out" title="Zoom out" disabled={status !== 'ready'} onClick={() => move('zoom-out')}><Minus size={15} aria-hidden="true" /></button>
            <button className="lunar-scene-button" type="button" disabled={status !== 'ready'} onClick={() => move('center')}>Center site</button>
          </>
        )}
        <button className="lunar-scene-button" type="button" disabled={!onSurface && (status !== 'ready' || !vectors)}
          onClick={() => { setStatus('loading'); setOnSurface(!onSurface) }}>
          {onSurface ? 'Back to Moon Map' : 'Open Surface'}
        </button>
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

export default function LunarComparison({ recommendations, sites, epoch, timeline, snapshot }: Props) {
  const { duration, elapsed } = timeline
  const [selection, setSelection] = useState<Partial<Record<Priority, string>>>({})
  const scenarios = priorities.flatMap((priority, index) => {
    const recommendation = recommendations.find(entry => entry.priority === priority)
    const site = sites.find(entry => entry.id === selection[priority])
      ?? sites.find(entry => entry.id === recommendation?.id) ?? sites[index]
    return site ? [{ priority, recommendation, site }] : []
  })
  const optionGroups = [
    { label: 'Suggested patches', sites: sites.filter(site => site.kind === 'Landing suggestion') },
    { label: 'Historic landings', sites: sites.filter(site => site.kind.startsWith('Historic')) },
    { label: 'Study sites and landmarks', sites: sites.filter(site => site.kind !== 'Landing suggestion' && !site.kind.startsWith('Historic')) },
  ]
  const maxEnergy = Math.max(0, ...scenarios.map(({ site }) => site.energy)) || 1
  const sceneTime = snapshot?.epoch ?? epoch + elapsed * hour

  return (
    <div className="lunar-comparison-panel">
      <div className="lunar-comparison-header">
        <div>
          <p>{utc.format(epoch)} UTC · {metric(duration, 0)} h mission</p>
          <p>Pick a site in each column. Drag a map to rotate it.</p>
          <p>Violet marks crater shadows on the day side within the outline. The broad dark area is lunar night.</p>
          <p>Gold shows sunlight, blue shows Earth visibility, and teal shows where both are available.</p>
        </div>
        {recommendations.length > 0 && (
          <button className="lunar-scene-button" type="button" onClick={() => setSelection({})}>Use recommended patches</button>
        )}
      </div>
      <LunarMissionTimeline context="comparison" {...timeline} />
      <div className="lunar-comparison-grid">
        {scenarios.map(({ priority, recommendation, site }) => {
          const sample = snapshot?.samples[site.id]
          const isRecommended = recommendation?.id === site.id
          const heading = isRecommended && recommendation.qualifies ? priorityLabels[priority] : site.name
          return (
            <article className="lunar-comparison-card" key={priority} aria-label={heading}>
              <h4>{heading}</h4>
              <label className="lunar-comparison-choice">Site
                <select value={site.id} onChange={event => setSelection({ ...selection, [priority]: event.target.value })}>
                  {optionGroups.filter(group => group.sites.length > 0).map(group => (
                    <optgroup key={group.label} label={group.label}>
                      {group.sites.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>
              <p className="lunar-comparison-location">
                {coordinate(site.lat, 'N', 'S')}, {coordinate(site.lon, 'E', 'W')}
                {isRecommended && <span>{recommendation.qualifies ? 'Recommended' : 'Closest match'}</span>}
              </p>
              <ComparisonViewer site={site} snapshot={snapshot} />
              <time dateTime={new Date(sceneTime).toISOString()}>{utc.format(sceneTime)} UTC</time>
              <dl className="lunar-comparison-live">
                <Stat label="Sun elevation">{sample ? `${degrees(sample.sun)} · ${sample.sunStatus}` : '—'}</Stat>
                <Stat label="Earth view">{sample ? `${sample.earthStatus} · ${degrees(sample.earth)}` : '—'}</Stat>
                <Stat label="Solar power">{sample ? `${metric(sample.power, 1)} W/m²` : '—'}</Stat>
              </dl>
              <div className="lunar-comparison-totals">
                <h5>Over the mission</h5>
                <MissionBar label="Solar energy" value={`${metric(site.energy, 2)} kWh/m²`}
                  fraction={percent(site.energy, maxEnergy)} kind="sun" />
                <MissionBar label="Continuous Earth view" value={`${metric(site.earthHours, 1)} h`}
                  fraction={percent(site.earthHours, duration)} kind="earth" />
                <div className="lunar-comparison-windows">
                  <Availability label="Sunlight" windows={site.sunWindows} total={site.sunHours} duration={duration} elapsed={elapsed} kind="sun" />
                  <Availability label="Earth view" windows={site.earthWindows} total={site.earthTotal} duration={duration} elapsed={elapsed} kind="earth" />
                </div>
                <p className="lunar-comparison-slope">
                  {site.slope === null ? '100 m slope unavailable' : <>Slope <strong>{metric(site.slope, 2)}°</strong> over 100 m</>}
                </p>
                <details className="lunar-comparison-details">
                  <summary>More metrics</summary>
                  <dl>
                    <Stat label="Average solar power">{metric(site.averageWatts, 2)} W/m²</Stat>
                    <Stat label="Longest Earth blackout">{metric(site.longestEarthGap, 2)} h</Stat>
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
