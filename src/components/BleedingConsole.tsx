import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { ArrowDown, ArrowUpRight, Minus, Plus, RotateCcw } from 'lucide-react'
import { parts, views, type PartId, type Telemetry, type ViewId } from './bleeding/parts'
import { mountBleedingViewer } from './bleeding/viewer'
import './BleedingConsole.css'

const partIds = Object.keys(parts) as PartId[]
const viewIds = Object.keys(views) as ViewId[]

export default function BleedingConsole() {
  const stageRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ReturnType<typeof mountBleedingViewer> | null>(null)
  const disconnectDashboard = useRef<(() => void) | null>(null)
  const [selection, setSelection] = useState<{ view: ViewId; part: PartId | null }>({ view: 'overview', part: null })
  const { view, part } = selection
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const host = stageRef.current
    if (!host) return
    try {
      const viewer = mountBleedingViewer(host, part => {
        setSelection(previous => ({ ...previous, part }))
      }, () => setUnavailable(true))
      viewerRef.current = viewer
      return () => {
        viewer.dispose()
        viewerRef.current = null
      }
    } catch {
      const frame = window.requestAnimationFrame(() => setUnavailable(true))
      return () => window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    viewerRef.current?.select(selection)
  }, [selection])

  useEffect(() => {
    viewerRef.current?.setTelemetry(telemetry)
  }, [telemetry])

  useEffect(() => () => disconnectDashboard.current?.(), [])

  function selectView(next: ViewId) {
    setSelection({ view: next, part: null })
  }

  function connectDashboard(event: SyntheticEvent<HTMLIFrameElement>) {
    const frame = event.currentTarget
    disconnectDashboard.current?.()
    const root = frame.contentDocument?.getElementById('root')
    if (!root) return

    const resize = new ResizeObserver(() => {
      const height = Math.ceil(root.getBoundingClientRect().height)
      if (height > 0) frame.style.height = `${height}px`
    })
    const syncTelemetry = () => {
      const cards = Array.from(root.querySelectorAll('.metric'))
      const card = (title: string) => cards.find(item => item.querySelector('p')?.textContent === title)
      const value = (title: string) => card(title)?.querySelector('.metric-value strong')?.textContent
      const pressure = Number.parseFloat(value('Pressure Applied') ?? '')
      const flow = Number.parseFloat(value('Flow Rate') ?? '')
      if (!Number.isFinite(pressure) || !Number.isFinite(flow)) return
      const status = card('Status')?.querySelector('.status-badge')?.textContent?.trim() ?? ''
      setTelemetry(previous => previous?.pressure === pressure && previous.flow === flow && previous.status === status
        ? previous
        : { pressure, flow, status })
    }
    const observer = new MutationObserver(syncTelemetry)
    resize.observe(root)
    observer.observe(root, { childList: true, characterData: true, subtree: true })
    syncTelemetry()
    disconnectDashboard.current = () => {
      resize.disconnect()
      observer.disconnect()
    }
  }

  const currentView = views[view]
  const currentPart = part ? parts[part] : null

  return (
    <div className="bleeding-console">
      <div className="bleeding-console-bar">
        <div className="bleeding-system-views" role="group" aria-label="System views">
          {viewIds.map(id => (
            <button type="button" key={id} aria-pressed={view === id} onClick={() => selectView(id)}>
              {views[id].title}
            </button>
          ))}
        </div>
        <a className="bleeding-dashboard-jump" href="#bleeding-training-controls">
          Try a scenario <ArrowDown size={15} aria-hidden="true" />
        </a>
      </div>

      <div className="bleeding-viewer-layout">
        <div className="bleeding-viewer">
          <div className="bleeding-viewer-stage" ref={stageRef} data-unavailable={unavailable || undefined}>
            {unavailable && (
              <p className="bleeding-viewer-fallback" role="status">
                The 3D view is unavailable in this browser. Explore the parts below or try the training controls.
              </p>
            )}
          </div>
          <div className="bleeding-viewer-controls">
            <p>Drag or use the arrow keys to rotate. Select a part to zoom in.</p>
            <div className="bleeding-camera-buttons" role="group" aria-label="Camera controls">
              <button type="button" aria-label="Zoom out" disabled={unavailable} onClick={() => viewerRef.current?.zoom(1.2)}>
                <Minus size={17} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Zoom in" disabled={unavailable} onClick={() => viewerRef.current?.zoom(0.83)}>
                <Plus size={17} aria-hidden="true" />
              </button>
              <button type="button" disabled={unavailable} onClick={() => selectView('overview')}>
                <RotateCcw size={15} aria-hidden="true" /> Reset view
              </button>
            </div>
          </div>
        </div>

        <aside className="bleeding-parts-panel" aria-label="Prototype components">
          <div className="bleeding-part-copy" aria-live="polite">
            <h4>{currentPart?.title ?? currentView.heading}</h4>
            <p>{currentPart?.description ?? currentView.description}</p>
            {currentPart && <p className="bleeding-part-detail">{currentPart.detail}</p>}
          </div>
          <div className="bleeding-parts-list" role="group" aria-label="Focus a component">
            {partIds.map(id => (
              <button
                type="button"
                key={id}
                aria-pressed={part === id}
                data-in-view={currentView.parts.includes(id) || undefined}
                onClick={() => setSelection({ view, part: id })}
              >
                {parts[id].title}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <dl className="bleeding-viewer-readings" aria-label="Web demo readings">
        <div><dt>Applied pressure</dt><dd>{telemetry?.pressure ?? '—'} <span>mmHg</span></dd></div>
        <div><dt>Flow rate</dt><dd>{telemetry?.flow ?? '—'} <span>mL/min</span></dd></div>
        {telemetry?.status && <div><dt>Demo status</dt><dd>{telemetry.status}</dd></div>}
      </dl>

      <section className="bleeding-training-controls" id="bleeding-training-controls" aria-labelledby="bleeding-training-title">
        <h4 id="bleeding-training-title">Try a training scenario</h4>
        <p>Change the pressure or treatment mode and watch the simulated readings respond.</p>
        <iframe
          title="Bleeding control training controls"
          src="/bleeding-control-simulator/index.html?embed=portfolio&view=dashboard"
          onLoad={connectDashboard}
        />
        <a className="bleeding-original-demo" href="/bleeding-control-simulator-full/index.html" target="_blank" rel="noreferrer">
          Open original standalone demo <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </section>
    </div>
  )
}
