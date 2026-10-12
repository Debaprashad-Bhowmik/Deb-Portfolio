import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Check, Database, Eye, GitBranch, Pause, Play, ShieldCheck, Zap } from 'lucide-react'
import './BrainExplanation.css'

const examples = [
  { label: 'Notice a blocked route', short: 'Notice', title: 'First, notice that the route has changed.', text: 'The agent observes an obstacle. The software updates its view of the world, so the next decision uses the new situation.', route: 'Observation → current state', lane: 'observe' },
  { label: 'Inspect', short: 'Inspect', title: 'Make a quick, useful choice.', text: 'Instead of repeatedly trying the blocked route, fast judgment can choose to inspect it. Code checks that this action is still allowed before carrying it out.', route: 'Available actions → fast judgment → checks → action', lane: 'fast' },
  { label: 'Compare another route', short: 'Compare', title: 'Use more reasoning when the quick choice is not enough.', text: 'Tactical reasoning compares another route with relevant past attempts and predicted consequences. It proposes a revised plan; code checks the proposal before use.', route: 'History + predictions → tactical plan → checks', lane: 'tactical' },
  { label: 'Rethink if still stuck', short: 'Rethink', title: 'Call on deep thinking when the problem warrants it.', text: 'Repeated failure or an unfamiliar obstacle can trigger deeper strategy. This layer can rethink the approach while valid skills and safety controls remain available.', route: 'Novelty or repeated failure → deep strategy → checked plan', lane: 'deep' },
  { label: 'Learn from the outcome', short: 'Learn', title: 'Turn what actually happened into useful experience.', text: 'The result is recorded. Useful evidence can inform future recall, and a proposed new skill must pass validation before reuse. Repetitive details can lose recall priority without erasing the original evidence.', route: 'Observed result → memory → candidate skill → validation → reuse', lane: 'memory' },
] as const

const lanes = [
  { id: 'fast', title: 'Fast judgment', timing: '≈ 200 ms target', source: 'L2', description: 'Choose a useful next action from available options.', signal: 'candidate', icon: Zap, example: 1 },
  { id: 'tactical', title: 'Tactical reasoning', timing: 'Seconds-scale budget', source: 'L4', description: 'Compare options and repair the plan.', signal: 'plan_proposal', icon: GitBranch, example: 2 },
  { id: 'deep', title: 'Deep strategy', timing: 'When needed', source: 'L5', description: 'Rethink unfamiliar problems or repeated failure.', signal: 'strategy_advice', icon: BrainCircuit, example: 3 },
] as const

const memorySteps = ['Experience', 'Keep useful evidence', 'Candidate skill', 'Validate', 'Reuse']

function SignalWire({ label }: { label: string }) {
  return <div className="brain-signal-wire" aria-hidden="true">
    <code>{label}</code>
    <svg viewBox="0 0 160 36"><path d="M4 18H146" /><path className="brain-wire-arrow" d="m139 12 7 6-7 6" /><circle className="brain-signal-packet" cx="4" cy="18" r="3" /><circle cx="4" cy="18" r="2" /><circle cx="154" cy="18" r="3" /></svg>
  </div>
}

export default function BrainExplanation() {
  const root = useRef<HTMLDivElement>(null)
  const reduced = Boolean(useReducedMotion())
  const [selected, setSelected] = useState(0)
  const [preview, setPreview] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => typeof document !== 'undefined' && !document.hidden)
  const active = focused ?? preview ?? selected
  const example = examples[active]
  const moving = visible && pageVisible && !paused && !reduced

  useEffect(() => {
    const element = root.current
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (element) observer?.observe(element)
    const visibility = () => setPageVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', visibility) }
  }, [])

  function pin(index: number, keyboard: boolean) {
    setSelected(index)
    setPreview(null)
    setFocused(keyboard ? index : null)
  }

  const previewEvents = (index: number) => ({
    onPointerEnter: (event: PointerEvent) => { if (event.pointerType === 'mouse') setPreview(index) },
    onPointerMove: (event: PointerEvent) => { if (event.pointerType === 'mouse') { setFocused(null); setPreview(index) } },
    onPointerLeave: () => setPreview(null),
    onFocus: () => setFocused(index),
    onBlur: () => setFocused(null),
    onClick: (event: MouseEvent<HTMLButtonElement>) => pin(index, event.detail === 0),
  })

  return <section id="brain-explanation" className="brain-explanation" aria-labelledby="brain-explanation-title" data-motion={moving ? 'moving' : 'still'} onKeyDown={event => { if (event.key === 'Escape') { setPreview(null); setFocused(null) } }}>
    <div className="brain-concepts">
      <div><Zap aria-hidden="true" /><h3>Think at different speeds.</h3><p>Make quick choices, then spend more thought on harder problems.</p><span>Quick choice <ArrowRight aria-hidden="true" /> Deeper thought</span></div>
      <div><Database aria-hidden="true" /><h3>Remember what matters.</h3><p>Keep useful experiences accessible and reduce repetitive clutter in recall.</p><span>Experience <ArrowRight aria-hidden="true" /> Useful memory</span></div>
      <div><GitBranch aria-hidden="true" /><h3>Build skills from experience.</h3><p>Turn successful approaches into candidate skills, then test before reuse.</p><span>Reason <ArrowRight aria-hidden="true" /> Test <ArrowRight aria-hidden="true" /> Reuse</span></div>
    </div>

    <div className="brain-explanation-heading"><div><h3 id="brain-explanation-title">Inside the software brain.</h3><p>Different thinking speeds, connected by memory. Follow a blocked-route example.</p></div><a href="#brain-motion">Explore the full map <ArrowRight size={16} aria-hidden="true" /></a></div>
    <div ref={root} className="brain-console">
      <div className="brain-console-header"><span><Eye size={15} aria-hidden="true" /> Illustrative decision / route blocked</span><button type="button" disabled={reduced} onClick={() => setPaused(value => !value)} aria-label={reduced ? 'Explanation motion disabled by reduced motion preference' : paused ? 'Resume explanation motion' : 'Pause explanation motion'}>{paused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{reduced ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion'}</button></div>
      <div className="brain-console-body">
        <div className="brain-thinking">
          <div className={`brain-observation ${example.lane === 'observe' ? 'is-traced' : ''}`}><span className="brain-state-dot" aria-hidden="true" /><code>observation.route = blocked</code><span>New situation, new choice</span></div>
          <div className="brain-lanes">
            {lanes.map(lane => <button key={lane.id} type="button" className={`brain-thinking-lane brain-lane-${lane.id} ${example.lane === lane.id ? 'is-traced' : ''}`} aria-label={`Explain ${lane.title.toLowerCase()}`} aria-pressed={selected === lane.example} aria-controls="brain-example-explanation" {...previewEvents(lane.example)}>
              <div className="brain-lane-symbol"><lane.icon size={22} aria-hidden="true" /><code>{lane.source}</code></div>
              <div className="brain-lane-copy"><div><h4>{lane.title}</h4><span>{lane.timing}</span></div><p>{lane.description}</p></div>
              <SignalWire label={lane.signal} />
            </button>)}
          </div>
          <div className={`brain-execution-boundary ${['fast', 'tactical', 'deep'].includes(example.lane) ? 'is-traced' : ''}`}><ShieldCheck size={24} aria-hidden="true" /><div><strong>Code checks. Then acts.</strong><p>Current state · permissions · safety</p></div><ArrowRight size={18} aria-hidden="true" /><span>Checked action</span></div>
          <p className="brain-speed-note">Timings are design targets, not measured results. Deeper reasoning runs when needed; it does not block safe local control.</p>
        </div>
        <div className={`brain-memory-loop ${example.lane === 'memory' ? 'is-traced' : ''}`}>
          <div className="brain-memory-title"><Database size={20} aria-hidden="true" /><h4><button type="button" aria-label="Explain how experience becomes capability" aria-pressed={selected === 4} aria-controls="brain-example-explanation" {...previewEvents(4)}>Experience becomes capability.<ArrowRight size={14} aria-hidden="true" /></button></h4></div>
          <div className="brain-recall-window" aria-hidden="true"><code>memory.recall</code><div><span className="brain-retained-memory">useful outcome <Check size={11} /></span><span className="brain-fading-memory">repeated detail</span><span className="brain-retained-memory">validated skill <Check size={11} /></span></div></div>
          <ol>{memorySteps.map((label, index) => <li key={label}><span aria-hidden="true">{index + 1}</span><strong>{label}</strong>{index === 2 && <small>A proposal, not yet a released skill</small>}{index === 3 && <small>Independent checks before release</small>}</li>)}</ol>
          <div className="brain-memory-return" aria-hidden="true"><svg viewBox="0 0 240 24"><path d="M232 2v12H8V2m-5 5 5-5 5 5" /><circle className="brain-return-packet" cx="232" cy="14" r="3" /></svg><code>validated_skill → future decisions</code></div>
          <p>Recall is selective.<br /><strong>Original observed evidence is retained.</strong></p>
        </div>
      </div>
      <div className="brain-code-ribbon" aria-hidden="true"><div>{Array.from({ length: 2 }, (_, index) => <span key={index}>observation <i>→</i> candidate <i>→</i> validity_check <i>→</i> execution_receipt <i>→</i> memory <i>→</i> validated_skill <i>→</i></span>)}</div></div>
    </div>
    <div className="brain-example">
      <ol aria-label="Blocked-route example steps">{examples.map((item, index) => <li key={item.short}><button type="button" aria-label={`Example step ${index + 1}: ${item.label}`} aria-current={selected === index ? 'step' : undefined} aria-controls="brain-example-explanation" className={active === index ? 'is-previewed' : ''} {...previewEvents(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.short}<ArrowRight size={14} aria-hidden="true" /></button></li>)}</ol>
      <div id="brain-example-explanation" className="brain-example-explanation" aria-live="polite" aria-atomic="true"><div><span>{active !== selected ? 'Path preview' : 'Illustrative example'} / {active + 1} of 5</span><h4>{example.title}</h4><p>{example.text}</p></div><div className="brain-example-route"><span>Highlighted path</span><p>{example.route}</p></div></div>
    </div>
    <details className="brain-model-details"><summary>Technical details: models, roles and timing</summary><div><p><strong>Jev</strong> is the TypeScript judgment component that selects from supplied actions. It is not the project’s name. Local reflexes and safety controls belong to the execution layer.</p><p>The v1.10 design assigns tactical roles to <strong>Gemini</strong> and deeper strategy to <strong>Hermes/Sol</strong>. These are service choices within a five-level design, not five models that must run together. Past recalls observed history, Future supplies predictions and Present integrates the advice.</p><p>Fast judgment has an approximately <strong>200 ms design target</strong> where measured latency permits. Tactical episodes have a seconds-scale budget; deep strategy is event-triggered. Runtime evaluation is pending.</p></div></details>
  </section>
}
