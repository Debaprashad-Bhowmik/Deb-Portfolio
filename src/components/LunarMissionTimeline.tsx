import { Pause, Play, RotateCcw } from 'lucide-react'
import { metric, missionTimeStep } from './lunarMission'

export type MissionTimeline = {
  duration: number
  elapsed: number
  playing: boolean
  disabled: boolean
  onToggle: () => void
  onSeek: (hours: number) => void
}

export default function LunarMissionTimeline({
  context, duration, elapsed, playing, disabled, onToggle, onSeek,
}: MissionTimeline & { context: 'main' | 'comparison' }) {
  const id = `lunar-${context}-time-lapse`
  const ended = elapsed >= duration
  const label = playing ? 'Pause' : ended ? 'Replay' : 'Play'
  const Icon = playing ? Pause : ended ? RotateCcw : Play
  const current = metric(elapsed, 2)
  const total = metric(duration, 0)

  return (
    <div className="lunar-mission-clock" role="group"
      aria-label={context === 'main' ? 'Main viewer mission time-lapse' : 'Comparison mission time-lapse'}>
      <div className="lunar-mission-clock-intro">
        <label htmlFor={id}>Mission time-lapse</label>
        <p id={`${id}-help`}>Play or drag to see the whole mission.</p>
      </div>
      <div className="lunar-mission-clock-controls">
        <button type="button" className="lunar-scene-button lunar-playback-button" disabled={disabled} onClick={onToggle}>
          <Icon size={15} aria-hidden="true" /> {label}
        </button>
        <input id={id} type="range" min={0} max={duration} step={missionTimeStep(duration)} value={elapsed}
          disabled={disabled} aria-describedby={`${id}-help`} aria-valuetext={`${current} of ${total} hours since landing`}
          onChange={event => onSeek(event.target.valueAsNumber)} />
        <span className="lunar-mission-clock-value">{current} / {total} h</span>
      </div>
    </div>
  )
}
