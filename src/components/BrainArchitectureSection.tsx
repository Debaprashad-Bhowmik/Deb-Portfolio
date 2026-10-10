import { lazy, Suspense, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Film, RotateCcw } from 'lucide-react'
import {
  architectureModules,
  architectureViews,
  brainMedia,
  cognitiveLevels,
  walkthrough,
  type ArchitectureModule,
  type ArchitectureView,
  type BrainMedia,
} from '../data/brainArchitecture'
import './BrainArchitectureSection.css'
const GalacticExplorer = lazy(() => import('./GalacticExplorer'))

const branches = ['past', 'present', 'future'] as const

function GameplayMedia({ media }: { media: BrainMedia }) {
  const [failedSource, setFailedSource] = useState<string | null>(null)
  const [posterFailed, setPosterFailed] = useState(false)
  const hasVideo = Boolean(media.videoSrc && failedSource !== media.videoSrc)
  const posterSrc = media.posterSrc ?? brainMedia.posterSrc

  return (
    <figure className="brain-media">
      <div className="brain-media-frame">
        {hasVideo ? (
          <video
            key={media.videoSrc}
            controls
            playsInline
            preload="metadata"
            poster={posterSrc}
            aria-label="Adaptive Cognitive Architecture gameplay video"
            onError={() => setFailedSource(media.videoSrc ?? null)}
          >
            <source src={media.videoSrc} onError={() => setFailedSource(media.videoSrc ?? null)} />
            {media.captionsSrc ? <track kind="captions" src={media.captionsSrc} srcLang="en" label="English" default /> : null}
            Your browser cannot play this video.
          </video>
        ) : (
          <>
            {!posterFailed && <img src={posterSrc} alt="Concept illustration of an embodied robot beside a river and cabin in a vibrant voxel world." onError={() => setPosterFailed(true)} />}
            {posterFailed && <div className="brain-poster-fallback">Past <ArrowRight aria-hidden="true" /> Present <ArrowRight aria-hidden="true" /> Future</div>}
            <div className="brain-media-note">
              <Film size={19} aria-hidden="true" />
              <span>{failedSource ? 'Gameplay video could not load' : 'Gameplay video coming soon'}<small>{failedSource ? 'Please try again later. The architecture explorer is available below.' : 'Concept illustration · footage to follow'}</small></span>
            </div>
          </>
        )}
      </div>
      <figcaption>Designed for environments with observations, actions and feedback. Gameplay will be documented here when footage is available.</figcaption>
    </figure>
  )
}

export default function BrainArchitectureSection({ media = brainMedia }: { media?: BrainMedia }) {
  const [view, setView] = useState<ArchitectureView>('cognition')
  const [selectedId, setSelectedId] = useState('present')
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const modules = architectureModules[view]
  const selected = modules.find((module) => module.id === selectedId) ?? modules[0]
  const activeView = architectureViews.find((item) => item.id === view)!
  const step = stepIndex === null ? null : walkthrough[stepIndex]

  function chooseView(next: ArchitectureView) {
    setView(next)
    setSelectedId(next === 'cognition' ? 'present' : architectureModules[next][0].id)
    setStepIndex(null)
  }

  function chooseModule(id: string) {
    setSelectedId(id)
    setStepIndex(null)
  }

  function chooseStep(index: number) {
    const next = walkthrough[index]
    setStepIndex(index)
    setView(next.view)
    setSelectedId(next.module)
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % architectureViews.length
    else if (event.key === 'ArrowLeft') next = (index + architectureViews.length - 1) % architectureViews.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = architectureViews.length - 1
    else return
    event.preventDefault()
    chooseView(architectureViews[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section id="adaptive-cognitive-architecture" className="brain-section case-section" aria-labelledby="brain-title">
      <div className="brain-intro">
        <div className="brain-intro-copy">
          <a href="#work" className="brain-back-link"><ChevronLeft size={15} aria-hidden="true" /> All projects <span>01</span></a>
          <h2 id="brain-title">Adaptive Cognitive <em>Architecture.</em></h2>
          <p className="brain-subtitle">Different timescales. One mind.</p>
          <p>This is a system design for an AI agent: software that observes an environment and takes actions toward a goal. I designed its software brain to connect memory of past events, predictions about possible actions, and a decision about what to do now. It also specifies how the agent should check an action, carry it out and learn from the result.</p>
          <p className="brain-judgment-note"><strong>A design for an agent, from observation to learning.</strong> Jev is the name of the TypeScript judgment component inside this architecture: it chooses among the actions supplied to it. The surrounding software manages state and memory, checks that a choice is still valid, and controls execution. The architecture is documented and statically checked; its behavior in a running environment still needs evaluation.</p>
          <div className="brain-intro-actions">
            <a href="#brain-motion" className="button primary">See how it works <ArrowDown size={17} aria-hidden="true" /></a>
            <span className="brain-status"><span aria-hidden="true" /> Research & architecture design</span>
          </div>
        </div>
        <GameplayMedia media={media} />
      </div>

      <dl className="project-proof-bar brain-project-proof" aria-label="Adaptive Cognitive Architecture project evidence summary">
        <div><dt>Role</dt><dd>Cognitive, runtime and learning system design; contracts and structural verification.</dd></div>
        <div><dt>Tools</dt><dd>Notion, Miro, Mermaid and TypeScript judgment interfaces.</dd></div>
        <div><dt>Built Artifact</dt><dd>Three v1.10 architecture views, documented contracts and an interactive map of their connections.</dd></div>
        <div><dt>Outcome</dt><dd>141 documented static checks passed; 14 acceptance scenarios specified. Runtime evaluation is pending.</dd></div>
      </dl>

      <div className="brain-rationale">
        <h3>What happens<br />between thinking and acting?</h3>
        <div><p>Imagine an agent trying to reach a destination when its route becomes blocked. It needs to notice the obstacle, recall relevant attempts, compare possible next steps and choose an action. Before acting, the software must check that the route, goal and permissions have not changed.</p><p>This architecture gives those jobs separate components and defines what they exchange. After an action, the observed result becomes evidence; any proposed new rule or skill must pass independent validation before release.</p></div>
      </div>

      <Suspense fallback={<div id="brain-motion">Loading the cognitive observatory…</div>}><GalacticExplorer /></Suspense>
      <details id="brain-explorer" className="brain-detail-disclosure">
      <summary>Explore the detailed architecture</summary>
      <div className="brain-explorer" aria-labelledby="brain-explorer-title">
        <div className="brain-explorer-header">
          <div><h3 id="brain-explorer-title">Inside the architecture</h3><p>Select a view, then a module to follow its responsibilities.</p></div>
          <div className="brain-tabs" role="tablist" aria-label="Architecture views">
            {architectureViews.map((item, index) => (
              <button key={item.id} ref={(node) => { tabRefs.current[index] = node }} type="button" role="tab" id={`brain-tab-${item.id}`} aria-selected={view === item.id} aria-controls={`brain-panel-${item.id}`} tabIndex={view === item.id ? 0 : -1} onClick={() => chooseView(item.id)} onKeyDown={(event) => navigateTabs(event, index)}>{item.title}</button>
            ))}
          </div>
        </div>

        <div className="brain-explorer-body">
          <div className="brain-diagram" role="tabpanel" id={`brain-panel-${view}`} aria-labelledby={`brain-tab-${view}`} tabIndex={0}>
            <div className="brain-diagram-heading"><span>{activeView.title}</span><p>{activeView.description}</p></div>
            {view === 'cognition' ? (
              <>
                <div className="brain-temporal-headings">
                  {branches.map((id) => {
                    const module = modules.find((item) => item.id === id)!
                    return <ModuleButton key={id} module={module} selected={selected.id === id} onSelect={chooseModule} className={`brain-branch brain-branch-${id}`} />
                  })}
                </div>
                <div className="brain-temporal-levels" aria-label="Cognitive levels five through two">
                  {cognitiveLevels.map((level) => (
                    <div className="brain-level" key={level.label}>
                      <div className="brain-level-label"><strong>{level.label}</strong><span>{level.note}</span></div>
                      <div className="brain-level-cells">{level.modules.map((label, index) => <button type="button" key={label} aria-pressed={selected.id === branches[index]} aria-label={`${label}: ${level.label} in the ${branches[index]} branch`} className={selected.id === branches[index] ? 'is-selected' : ''} onClick={() => chooseModule(branches[index])}>{label}</button>)}</div>
                    </div>
                  ))}
                </div>
                <div className="brain-shared-level"><span>L1 · Shared foundation</span><ModuleButton module={modules.find((item) => item.id === 'skills')!} selected={selected.id === 'skills'} onSelect={chooseModule} /></div>
                <div className="brain-support-modules">{['memory', 'escalation'].map((id) => <ModuleButton key={id} module={modules.find((item) => item.id === id)!} selected={selected.id === id} onSelect={chooseModule} />)}</div>
                <p className="brain-diagram-caption">Upper layers are advisory and event-triggered. Shared execution remains gated.</p>
              </>
            ) : (
              <>
                <ol className="brain-flow-modules">{modules.map((module, index) => <li key={module.id}><span className="brain-flow-index">{String(index + 1).padStart(2, '0')}</span><ModuleButton module={module} selected={selected.id === module.id} onSelect={chooseModule} /><ArrowRight className="brain-flow-arrow" size={16} aria-hidden="true" /></li>)}</ol>
                <p className="brain-diagram-caption">{view === 'runtime' ? 'Curated route through the documented runtime. Feedback returns to state and supplies the learning pipeline.' : 'Curated learning pipeline. Released artifacts return to the versioned runtime; this is a design, not a training result.'}</p>
              </>
            )}
          </div>
          <aside id="brain-module-explanation" className="brain-inspector" aria-label="Selected module explanation" aria-live="polite" aria-atomic="true">
            <h4>{selected.title}</h4><p>{selected.description}</p>
            <dl><div><dt>Receives</dt><dd>{selected.input}</dd></div><div><dt>Produces</dt><dd>{selected.output}</dd></div></dl>
            <div className="brain-boundary"><Check size={18} aria-hidden="true" /><p><strong>Design boundary</strong>{selected.boundary}</p></div>
          </aside>
        </div>
      </div>

      <div className="brain-walkthrough" aria-labelledby="brain-walkthrough-title">
        <div className="brain-walkthrough-header"><div><h3 id="brain-walkthrough-title">Follow one decision.</h3><p>Illustrative architecture walkthrough · a blocked doorway</p></div><button type="button" className="brain-reset" onClick={() => chooseView('cognition')}><RotateCcw size={15} aria-hidden="true" /> Reset</button></div>
        <ol className="brain-step-list">{walkthrough.map((item, index) => <li key={item.title}><button type="button" aria-current={stepIndex === index ? 'step' : undefined} aria-label={`Walkthrough step ${index + 1}: ${item.title}`} onClick={() => chooseStep(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}<ArrowRight size={14} aria-hidden="true" /></button></li>)}</ol>
        <div className="brain-step-detail"><div aria-live="polite" aria-atomic="true"><h4>{step?.heading ?? 'Trace the path from observation to validated learning.'}</h4><p>{step?.text ?? 'Step through a proposed decision cycle. Each step selects the corresponding architecture module above. This walkthrough explains the specification; it does not run an AI agent or report an experiment.'}</p></div><div className="brain-step-controls"><button type="button" aria-label="Previous walkthrough step" disabled={stepIndex === null || stepIndex === 0} onClick={() => chooseStep((stepIndex ?? 1) - 1)}><ChevronLeft size={20} aria-hidden="true" /></button><span>{stepIndex === null ? 'Start here' : `${stepIndex + 1} / ${walkthrough.length}`}</span><button type="button" aria-label={stepIndex === null ? 'Start walkthrough' : 'Next walkthrough step'} disabled={stepIndex === walkthrough.length - 1} onClick={() => chooseStep(stepIndex === null ? 0 : stepIndex + 1)}><ChevronRight size={20} aria-hidden="true" /></button></div></div>
      </div>

      </details>
      <section className="snip-why-strip brain-purpose" aria-labelledby="brain-purpose-title">
        <p id="brain-purpose-title">Why It Exists</p>
        <div className="snip-why-grid">
          <article className="snip-why-card"><span>01</span><div><h3>Problem</h3><p>A model can suggest a next step, but a persistent agent also needs to remember events, handle changing conditions and distinguish a proposal from an action that actually happened. These responsibilities need explicit boundaries.</p></div></article>
          <article className="snip-why-card"><span>02</span><div><h3>Idea</h3><p>Design a connected software brain: Past supplies observed history, Future predicts consequences, and Present chooses among available actions. A shared runtime manages state, scheduling and permission to act.</p></div></article>
          <article className="snip-why-card"><span>03</span><div><h3>How It Solves It</h3><p>The specification gives each component a defined input, output and owner. It checks choices before execution and keeps observed outcomes separate from predictions, so candidate improvements can be validated before they enter the system.</p></div></article>
        </div>
      </section>
      <div className="brain-evidence" aria-labelledby="brain-evidence-title">
        <div><h3 id="brain-evidence-title">What is established.<br /><em>What comes next.</em></h3><p>The v1.10 record separates structural verification from behavior in a running environment.</p><a href="#contact">Discuss the architecture <ArrowUpRight size={16} aria-hidden="true" /></a></div>
        <dl><div><dt>Completed design</dt><dd>Three canonical architecture views, with explicit cognitive, runtime and learning contracts.</dd></div><div><dt>Static verification</dt><dd><strong>141 documented checks passed.</strong> These check structural coverage and selected boundaries; they do not prove execution or learning.</dd></div><div><dt>Planned evaluation</dt><dd>Fourteen acceptance scenarios specified, including stale commands, interruption, transfer and lost evidence. <strong>Runtime experiments have not run.</strong></dd></div><div><dt>Next milestone</dt><dd>Implement environment adapters and runtime integrations, record gameplay, then evaluate under controlled resource budgets.</dd></div></dl>
      </div>
    </section>
  )
}

function ModuleButton({ module, selected, onSelect, className = '' }: { module: ArchitectureModule; selected: boolean; onSelect: (id: string) => void; className?: string }) {
  return <button type="button" className={`brain-module ${selected ? 'is-selected' : ''} ${className}`} aria-pressed={selected} aria-controls="brain-module-explanation" onClick={() => onSelect(module.id)}><strong>{module.title}</strong><span>{module.subtitle}</span></button>
}
