import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, RotateCcw } from 'lucide-react'
import { useNearViewport } from '../useNearViewport'
import LunarComparison from './LunarComparison'
import LunarMissionTimeline, { type MissionTimeline } from './LunarMissionTimeline'
import { coordinate, hour, metric, missionTimeStep, priorityLabels, utc, type ComparisonSnapshot, type Priority, type Rankings } from './lunarMission'

const views = [
  { id: 'orbit', name: 'Orbit' },
  { id: 'map', name: 'Moon Map' },
  { id: 'surface', name: 'Surface' },
] as const

const walkDirections = [
  { id: 'left', label: 'Walk left', Icon: ArrowLeft },
  { id: 'forward', label: 'Walk forward', Icon: ArrowUp },
  { id: 'back', label: 'Walk backward', Icon: ArrowDown },
  { id: 'right', label: 'Walk right', Icon: ArrowRight },
] as const

type SceneState = {
  mode: (typeof views)[number]['id']
  phase: 'loading' | 'ready' | 'moving' | 'error'
  message: string
  distance: number
  sky: string[]
  siteName: string
}

const priorityOrder: Priority[] = ['balanced', 'earth', 'solar']
const windows = [
  { id: '24', label: 'First 24 hours' }, { id: '72', label: 'First 3 days' },
  { id: '168', label: 'First 7 days' }, { id: '336', label: 'First 14 days' },
  { id: '708', label: 'One lunar day (29.5 days)' }, { id: '720', label: 'First 30 days' },
  { id: 'year', label: 'Full year' },
]
const defaultDate = '2026-12-25'
const defaultTime = '00:00'
const defaultMission = { epoch: Date.parse(`${defaultDate}T${defaultTime}Z`), duration: 168, maxSlope: 10 }
const initialScene: SceneState = { mode: 'map', phase: 'loading', message: '', distance: 0, sky: [], siteName: '' }
const playbackIntervalMs = 125
const playbackUpdates = 180

export default function LunarScene() {
  const frame = useRef<HTMLIFrameElement>(null)
  const initializedFrame = useRef<HTMLIFrameElement>(null)
  const pendingMission = useRef(defaultMission)
  const stage = useRef<HTMLDivElement>(null)
  const shouldLoad = useNearViewport(stage)
  const [scene, setScene] = useState(initialScene)
  const [instance, setInstance] = useState(0)
  const [date, setDate] = useState(defaultDate)
  const [time, setTime] = useState(defaultTime)
  const [windowHours, setWindowHours] = useState(String(defaultMission.duration))
  const [slope, setSlope] = useState(String(defaultMission.maxSlope))
  const [mission, setMission] = useState(defaultMission)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchStatus, setSearchStatus] = useState('')
  const [rankings, setRankings] = useState<Rankings | null>(null)
  const [snapshot, setSnapshot] = useState<ComparisonSnapshot | null>(null)
  const ready = scene.phase === 'ready'
  const clockReady = ready && !searching
  const onSurface = scene.mode === 'surface'
  const sceneTime = mission.epoch + elapsed * hour

  const command = useCallback((action: 'status' | 'view' | 'reset' | 'focus' | 'walk' | 'zoom' | 'search' | 'visit' | 'clock',
    value?: string | number | typeof defaultMission) => {
    frame.current?.contentWindow?.postMessage({ type: 'lunar-scene-command', action, value }, window.location.origin)
  }, [])

  const runSearch = useCallback((config: typeof defaultMission) => {
    pendingMission.current = config
    setPlaying(false)
    setSearching(true)
    setSearchStatus('Loading the South Pole patch inventory…')
    command('search', config)
  }, [command])

  useEffect(() => {
    function receive(event: MessageEvent) {
      const viewer = frame.current
      if (!viewer || event.source !== viewer.contentWindow || event.origin !== window.location.origin) return
      const data = event.data
      if (data?.type === 'lunar-scene-search-progress') {
        setSearchStatus(`Checking ${metric(data.done, 0)} of ${metric(data.total, 0)} eligible patches…`)
        return
      }
      if (data?.type === 'lunar-scene-search-error') {
        setSearchStatus(data.message)
        setSearching(false)
        return
      }
      if (data?.type === 'lunar-scene-search-result') {
        setMission(pendingMission.current)
        setElapsed(0)
        setSnapshot(null)
        setRankings(data.recommendations.length > 0 ? { recommendations: data.recommendations, patches: data.patches } : null)
        setSearchStatus(data.evaluated
          ? `${metric(data.evaluated, 0)} of ${metric(data.sampled, 0)} patches passed the slope screen. ${data.step < 1 ? `${Math.round(data.step * 60)} min` : `${metric(data.step, 1)} h`} samples.`
          : 'No patch passes this slope screen. Try a higher limit.')
        setSearching(false)
        return
      }
      if (data?.type === 'lunar-scene-comparison') {
        setSnapshot(data.snapshot)
        return
      }
      if (data?.type !== 'lunar-scene-state' || !views.some(view => view.id === data.mode) ||
          !['loading', 'ready', 'moving', 'error'].includes(data.phase) ||
          typeof data.message !== 'string' || !Number.isFinite(data.distance) ||
          !Array.isArray(data.sky) || typeof data.siteName !== 'string') return
      setScene({ mode: data.mode, phase: data.phase, distance: data.distance, message: data.message, sky: data.sky, siteName: data.siteName })
      if (data.phase === 'error') setSearching(false)
      if (data.phase !== 'ready') setPlaying(false)
      if (data.phase === 'ready' && initializedFrame.current !== viewer) {
        initializedFrame.current = viewer
        runSearch(defaultMission)
      }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [runSearch])

  const seekToElapsed = useCallback((next: number) => {
    setElapsed(next)
    command('clock', mission.epoch + next * hour)
  }, [command, mission.epoch])

  useEffect(() => {
    // Wait for the scene's clock update before sending the next render request.
    if (!playing || !clockReady || snapshot?.epoch !== sceneTime) return
    const step = missionTimeStep(mission.duration)
    const increment = Math.ceil(mission.duration / (playbackUpdates * step)) * step
    const next = Math.min(elapsed + increment, mission.duration)
    const timer = window.setTimeout(() => {
      seekToElapsed(next)
      if (next === mission.duration) setPlaying(false)
    }, playbackIntervalMs)
    return () => window.clearTimeout(timer)
  }, [playing, clockReady, snapshot?.epoch, sceneTime, mission.duration, elapsed, seekToElapsed])

  const timeline: MissionTimeline = {
    duration: mission.duration,
    elapsed,
    playing,
    disabled: !clockReady,
    onToggle: () => {
      if (!playing) seekToElapsed(elapsed >= mission.duration ? 0 : elapsed)
      setPlaying(!playing)
    },
    onSeek: next => {
      setPlaying(false)
      seekToElapsed(next)
    },
  }

  function visitFromComparison(id: string) {
    stage.current?.scrollIntoView({ block: 'center' })
    command('visit', id)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!ready || searching) return
    const epoch = Date.parse(`${date}T${time}Z`)
    const yearEnd = new Date(epoch)
    yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + 1)
    const duration = windowHours === 'year' ? (yearEnd.getTime() - epoch) / hour : Number(windowHours)
    if (!Number.isFinite(epoch) || epoch + duration * hour > Date.UTC(2031, 0, 1)) {
      setSearchStatus('Choose a mission window that ends by 1 Jan 2031 at 00:00 UTC.')
      return
    }
    runSearch({ epoch, duration, maxSlope: Number(slope) })
  }

  return (
    <section className="lunar-explorer" aria-labelledby="lunar-explorer-title">
      <div className="lunar-explorer-bar">
        <div>
          <h3 id="lunar-explorer-title">Explore the lunar South Pole</h3>
          <p>{scene.siteName || 'Patch 1'} · {utc.format(sceneTime)} UTC</p>
        </div>
        <div className="lunar-view-controls" role="group" aria-label="3D view">
          {views.map(view => (
            <button key={view.id} type="button" aria-pressed={scene.mode === view.id}
              aria-disabled={!ready} aria-controls="lunar-explorer-stage"
              onClick={() => ready && command('view', view.id)}>
              {view.name}
            </button>
          ))}
        </div>
      </div>
      <form className="lunar-mission" onSubmit={search} aria-describedby="lunar-mission-help">
        <div className="lunar-mission-fields">
          <label>Landing date (UTC)
            <input type="date" min="2024-01-01" max="2030-12-31" required value={date} onChange={event => setDate(event.target.value)} />
          </label>
          <label>Time (UTC)
            <input type="time" required value={time} onChange={event => setTime(event.target.value)} />
          </label>
          <label>Mission window
            <select value={windowHours} onChange={event => setWindowHours(event.target.value)}>
              {windows.map(window => <option key={window.id} value={window.id}>{window.label}</option>)}
            </select>
          </label>
          <label title="Slope over a 100 m baseline">Max slope (°)
            <input type="number" min=".1" max="45" step=".1" required value={slope} onChange={event => setSlope(event.target.value)} />
          </label>
          <button type="submit" className="lunar-scene-button lunar-suggest-button" disabled={!ready || searching}>
            {searching ? 'Finding patches…' : 'Landing Suggestions'}
          </button>
        </div>
        <p id="lunar-mission-help">Set a date and mission window, then run Landing Suggestions. Select a patch to fly down. On Surface, drag to look and use <strong>WASD</strong> or the on-screen arrows to walk.</p>
        {searchStatus && <p role="status" className="lunar-search-status">{searchStatus}</p>}
      </form>
      {rankings && (
        <div className="lunar-suggestions" aria-label="Recommended landing patches">
          {priorityOrder.map(priority => {
            const recommendation = rankings.recommendations.find(option => option.priority === priority)
            const patch = rankings.patches.find(option => option.id === recommendation?.id)
            if (!patch || !recommendation) return null
            return (
              <button type="button" className="lunar-suggestion" key={priority} disabled={!ready || searching}
                onClick={() => command('visit', patch.id)} aria-label={`${priorityLabels[priority]} · Fly to ${patch.name}`}>
                <span>{recommendation.qualifies ? priorityLabels[priority] : `${priorityLabels[priority]} · closest match`}</span>
                <strong>{patch.name} <small>{coordinate(patch.lat, 'N', 'S')}, {coordinate(patch.lon, 'E', 'W')}</small></strong>
                <span>{metric(patch.energy, 2)} kWh/m² · {metric(patch.earthHours, 1)} h continuous Earth view · {metric(patch.slope, 2)}°</span>
              </button>
            )
          })}
          <a className="lunar-compare-link" href="#lunar-comparison-title" onClick={event => {
            event.preventDefault()
            const title = document.getElementById('lunar-comparison-title')
            title?.focus({ preventScroll: true })
            title?.scrollIntoView({ block: 'start' })
          }}>
            Compare side by side <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
      )}
      <div id="lunar-explorer-stage" className="lunar-explorer-stage" ref={stage}>
        {shouldLoad && <iframe
          key={instance}
          ref={frame}
          src="/lunar-scene/index.html"
          title="Interactive lunar orbit, Moon map and first-person surface"
          onLoad={() => command('status')}
        />}
        {scene.phase === 'loading' && <p className="lunar-scene-overlay" role="status">Loading the 3D scene…</p>}
        {scene.phase === 'error' && (
          <div className="lunar-scene-overlay">
            <p role="status">{scene.message}</p>
            <button type="button" className="lunar-scene-button" onClick={() => {
              setScene(initialScene)
              setInstance(value => value + 1)
              setDate(defaultDate)
              setTime(defaultTime)
              setWindowHours(String(defaultMission.duration))
              setSlope(String(defaultMission.maxSlope))
              setMission(defaultMission)
              setElapsed(0)
              setRankings(null)
              setSnapshot(null)
              setSearchStatus('')
            }}>Reload viewer</button>
          </div>
        )}
        {scene.phase !== 'loading' && scene.phase !== 'error' && scene.message && (
          <p className="lunar-scene-status" role="status">{scene.message}</p>
        )}
      </div>
      {scene.mode === 'map' && scene.sky.length > 0 && (
        <ul className="lunar-sky-readout" aria-label="Sun and Earth distances from the map camera">
          {scene.sky.map(body => <li key={body.split(' ')[0]}>{body}</li>)}
        </ul>
      )}
      <LunarMissionTimeline context="main" {...timeline} />
      <div className="lunar-scene-toolbar">
        <p>
          {onSurface ? <>Drag to look. Focus the scene to walk with <strong>WASD</strong>.</> : 'Drag to rotate, or focus the scene and use the arrow keys.'}
          {onSurface && <span className="lunar-distance">{scene.distance} m from landing point</span>}
        </p>
        <div className="lunar-scene-actions" role="group" aria-label="Scene controls">
          <button type="button" className="lunar-scene-button" disabled={!ready} onClick={() => command('focus')}>Focus scene</button>
          {onSurface ? walkDirections.map(({ id, label, Icon }) => (
            <button key={id} type="button" className="lunar-scene-button" disabled={!ready}
              aria-label={label} title={label} onClick={() => command('walk', id)}>
              <Icon size={16} aria-hidden="true" />
            </button>
          )) : (
            <>
              <button type="button" className="lunar-scene-button" disabled={!ready}
                aria-label="Zoom out" title="Zoom out" onClick={() => command('zoom', 'out')}><Minus size={16} aria-hidden="true" /></button>
              <button type="button" className="lunar-scene-button" disabled={!ready}
                aria-label="Zoom in" title="Zoom in" onClick={() => command('zoom', 'in')}><Plus size={16} aria-hidden="true" /></button>
            </>
          )}
          <button type="button" className="lunar-scene-button" disabled={!ready} onClick={() => command('reset')}>
            <RotateCcw size={14} aria-hidden="true" /> {onSurface ? 'Return to landing' : 'Reset view'}
          </button>
        </div>
      </div>
      <section className="lunar-comparison" id="lunar-comparison" aria-labelledby="lunar-comparison-title">
        <h3 id="lunar-comparison-title" tabIndex={-1}>Compare landing sites</h3>
        {searching && rankings && <p className="lunar-comparison-message">Finding sites for the new mission…</p>}
        {rankings ? (
          <LunarComparison key={`${mission.epoch}/${mission.duration}/${mission.maxSlope}`} {...rankings}
            epoch={mission.epoch} timeline={timeline} snapshot={snapshot} onVisit={visitFromComparison} />
        ) : (
          <p className="lunar-comparison-message">
            {scene.phase === 'error' ? 'Reload the viewer to compare landing sites.' :
              searching || scene.phase === 'loading' ? 'Finding landing sites for the mission…' :
              searchStatus || 'Run Landing Suggestions to compare sites.'}
          </p>
        )}
      </section>
    </section>
  )
}
