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
import BrainExplanation from './BrainExplanation'
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
          <p>I’m designing a brain-inspired AI system that reacts quickly to familiar situations and calls on deeper thinking when problems become difficult. The research explores how it can remember useful experiences, turn successful strategies into skills, and reduce low-value memory over time.</p>
          <div className="brain-intro-actions">
            <a href="#brain-explanation" className="button primary">See how it works <ArrowDown size={17} aria-hidden="true" /></a>
            <span className="brain-status"><span aria-hidden="true" /> Research & architecture design</span>
          </div>
        </div>
        <GameplayMedia media={media} />
      </div>

      <dl className="project-proof-bar brain-project-proof" aria-label="Adaptive Cognitive Architecture project evidence summary">
        <div><dt>Role</dt><dd><strong>Cognitive system design</strong><small>Designed how thinking, memory, learning and execution connect.</small></dd></div>
        <div><dt>Tools</dt><dd><strong>Notion · Miro · TypeScript</strong><small>Architecture diagrams, Mermaid documentation and typed interfaces.</small></dd></div>
        <div><dt>Built Artifact</dt><dd><strong>3 architecture views</strong><small>Cognition, runtime and learning, with an interactive component map.</small></dd></div>
        <div><dt>Outcome</dt><dd><strong>141 static checks passed</strong><small>14 acceptance scenarios specified.<br />Runtime evaluation pending.</small></dd></div>
      </dl>

      <BrainExplanation />

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
          <article className="snip-why-card"><span>01</span><div><h3>Problem</h3><p>A single model response does not give an agent lasting memory, reliable actions or a way to improve from experience.</p></div></article>
          <article className="snip-why-card"><span>02</span><div><h3>Idea</h3><p>Connect quick judgment, deeper reasoning and selective memory into one brain-inspired system.</p></div></article>
          <article className="snip-why-card"><span>03</span><div><h3>How It Solves It</h3><p>The design separates thinking from acting: check each choice, record what happened and validate proposed skills before reuse.</p></div></article>
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
