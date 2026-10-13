import { useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUpRight, Brain, CheckCircle2, Clock3, Code2, FileCheck2, FlaskConical, GraduationCap, Layers3, Link2, Play, RotateCcw, ShieldCheck, Waypoints, Workflow } from 'lucide-react'

// Curated from the v1.10 scenario and verification record. Design checks and
// specified scenarios are deliberately kept separate from runtime results.
const statusTabs = [
  {
    id: 'overview', label: 'Overview',
    copy: 'So far, I’ve designed how the parts of this AI system should work together: how it thinks, remembers, acts and learns. The diagrams have been checked. The next step is to build the software connections and test the system in an environment.',
    features: [
      { icon: Waypoints, title: '3 design maps', detail: 'Maps for thinking, taking actions and learning from experience.' },
      { icon: CheckCircle2, title: '141 design checks', detail: 'Passed checks for required parts, connections and key safeguards in the diagrams.' },
      { icon: FlaskConical, title: '14 tests planned', detail: 'Difficult situations to try, with expected behavior written down.' },
      { icon: Clock3, title: 'Live tests pending', detail: 'No measured results from a running agent yet.' },
    ],
  },
  {
    id: 'design', label: 'Design',
    copy: 'Three connected maps explain the system from different angles. Each describes what a part needs, what it produces and how it hands work to the next part. Together, they turn the brain-inspired idea into a detailed software design.',
    features: [
      { icon: Brain, title: 'Thinking', detail: 'How quick decisions use past experience, predictions and deeper reasoning.' },
      { icon: Workflow, title: 'Taking action', detail: 'How software checks a choice before carrying it out in the environment.' },
      { icon: GraduationCap, title: 'Learning', detail: 'How actual outcomes can inform memory and proposed reusable skills.' },
    ],
  },
  {
    id: 'checks', label: 'Design checks',
    copy: 'All 141 checks passed against the diagrams and their written specifications. They checked that required parts and connections are present and that key safeguards sit on the intended paths. They did not run the AI or test how well it learns.',
    features: [
      { icon: Layers3, title: 'Parts included', detail: 'Required pieces are present in the design, including the original components.' },
      { icon: Link2, title: 'Parts connected', detail: 'Information has a documented route to the part that needs it.' },
      { icon: ShieldCheck, title: 'Safeguards placed', detail: 'Action paths include required checks before execution.' },
      { icon: FileCheck2, title: 'Maps verified', detail: 'Diagram source renders and matches the saved design.' },
    ],
  },
  {
    id: 'tests', label: 'Planned tests',
    copy: 'Fourteen test situations are written down, each with a challenge and the behavior we want to see. They will examine whether the system can adapt, recover and follow its goal when something goes wrong. None of these tests have run yet. Here are four examples.',
    features: [
      { icon: Clock3, title: 'A situation changes', detail: 'Reject an old action when its target or goal has changed.' },
      { icon: RotateCcw, title: 'A service fails', detail: 'Continue safely or stop, without repeating an outdated command.' },
      { icon: Waypoints, title: 'A task is unfamiliar', detail: 'Test whether a learned skill can adapt to new tools or objects.' },
      { icon: GraduationCap, title: 'Learning changes', detail: 'Check older abilities still work; roll back a harmful update.' },
    ],
  },
  {
    id: 'next', label: 'Next steps',
    copy: 'Build the software that connects this design to an environment, record what the agent actually does, and run the planned tests. Then compare it with simpler approaches using similar time and computing budgets.',
    features: [
      { icon: Code2, title: 'Build the connections', detail: 'Connect observations, model services, memory and controlled actions.' },
      { icon: Play, title: 'Record real behavior', detail: 'Capture gameplay, actions and outcomes so the work can be inspected.' },
      { icon: FlaskConical, title: 'Test and compare', detail: 'Measure performance, recovery and learning against simpler baselines.' },
    ],
  },
]

export default function BrainProjectStatus() {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const tab = statusTabs[active]
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === 'ArrowRight' ? (index + 1) % statusTabs.length
      : event.key === 'ArrowLeft' ? (index + statusTabs.length - 1) % statusTabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? statusTabs.length - 1 : null
    if (next === null) return
    event.preventDefault()
    setActive(next)
    buttons.current[next]?.focus()
  }
  return <footer id="brain-project-status" className="brain-project-status" aria-labelledby="brain-evidence-title">
    <div className="brain-status-heading"><h3 id="brain-evidence-title">Designed so far. <em>What comes next.</em></h3><a href="#contact">Talk about the project <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    <div className="brain-status-panel">
      <div className="brain-status-tabs" role="tablist" aria-label="Project progress explained">
        {statusTabs.map((item, index) => <button key={item.id} ref={node => { buttons.current[index] = node }} type="button" role="tab" id={`brain-status-tab-${item.id}`} aria-controls={`brain-status-panel-${item.id}`} aria-selected={index === active} tabIndex={index === active ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => navigate(event, index)}>{item.label}</button>)}
      </div>
      <div className="brain-status-body" role="tabpanel" id={`brain-status-panel-${tab.id}`} aria-labelledby={`brain-status-tab-${tab.id}`} tabIndex={0}>
        <p>{tab.copy}</p>
        <div className="brain-status-features" data-count={tab.features.length}>
          {tab.features.map(feature => { const Icon = feature.icon; return <article key={feature.title}><Icon size={27} strokeWidth={1.6} aria-hidden="true" /><h4>{feature.title}</h4><p>{feature.detail}</p></article> })}
        </div>
      </div>
    </div>
    <div className="bolt-footer-strip" aria-label="Adaptive Cognitive Architecture project metadata">
      <b>Cognitive Design</b><i aria-hidden="true" />
      <b>AI Systems</b><i aria-hidden="true" />
      <b>Memory</b><i aria-hidden="true" />
      <b>Reasoning</b><i aria-hidden="true" />
      <b>Learning</b>
      <span><i aria-hidden="true" />Runtime evaluation pending</span>
    </div>
  </footer>
}
