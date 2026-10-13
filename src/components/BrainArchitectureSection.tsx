import { lazy, Suspense, useRef, useState, type KeyboardEvent } from 'react'
import { useInView } from 'framer-motion'
import { ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Film, RotateCcw } from 'lucide-react'
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
import BrainProjectStatus from './BrainProjectStatus'
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
  const hookRef = useRef<HTMLParagraphElement>(null)
  const hookVisible = useInView(hookRef, { amount: 0.2 })
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
          <p ref={hookRef} className="brain-research-hook" data-visible={hookVisible}>
            <svg className="brain-hook-comic" viewBox="0 0 700 260" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <pattern id="brain-comic-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#305b51" opacity=".2" /></pattern>
              </defs>
              <g className="brain-hook-speed-anchor brain-hook-speed-anchor-rise"><g className="brain-hook-speed brain-hook-speed-rise" fill="none" strokeLinecap="round" strokeWidth="4.5">
                <path d="M-62 230 L8 191 M-46 247 L19 209" stroke="#247d9c" />
                <path d="M-66 205 L-4 170" stroke="#c88b24" />
                <path d="M5 293 L37 253" stroke="#608353" />
              </g>
              </g>
              <g className="brain-hook-speed-anchor brain-hook-speed-anchor-rock"><g className="brain-hook-speed brain-hook-speed-rock" fill="none" strokeLinecap="round" strokeWidth="4.5">
                <path d="M697 23 L764 -12 M706 44 L775 7" stroke="#247d9c" />
                <path d="M666 4 L704 -38" stroke="#c88b24" />
                <path d="M703 65 L759 36" stroke="#608353" />
              </g>
              </g>
              <path d="M3 10 L688 2 L698 250 L12 258 Z" fill="#f4cb73" stroke="#24463e" strokeWidth="3" />
              <path d="M350 132 L70 8 L118 8 Z M350 132 L222 5 L260 5 Z M350 132 L415 4 L452 4 Z M350 132 L572 3 L625 3 Z M350 132 L697 52 L697 88 Z" fill="#ffe5a9" />
              <path d="M7 175 L350 132 L696 140 L698 250 L12 258 Z" fill="#b9deeb" stroke="#24463e" strokeWidth="3" />
              <path d="M350 132 L180 255 L238 255 Z M350 132 L390 255 L450 254 Z M350 132 L606 252 L656 252 Z" fill="#e1f1f3" />
              <path d="M7 100 L195 133 L12 258 Z" fill="#8fae83" stroke="#24463e" strokeWidth="3" />
              <path d="M7 100 L195 133 L12 258 Z M587 4 L695 50 L696 139 L622 154 Z" fill="url(#brain-comic-dots)" />
              <path className="brain-hook-burst-shadow" d="M48 55 Q120 80 155 36 L167 13 Q209 57 253 43 L298 10 Q330 62 385 39 L440 18 Q442 62 498 55 L566 12 Q547 70 608 80 L679 68 Q645 111 674 140 L697 164 Q639 157 632 186 L668 231 Q610 204 563 224 L523 250 Q503 211 449 223 L400 249 Q381 209 342 224 L292 251 Q281 211 239 222 L181 249 Q188 211 139 209 L91 224 Q113 181 66 179 L18 193 Q55 147 16 120 Z" fill="#356b77" stroke="#24463e" strokeWidth="5" transform="translate(3 5)" />
              <path d="M48 55 Q120 80 155 36 L167 13 Q209 57 253 43 L298 10 Q330 62 385 39 L440 18 Q442 62 498 55 L566 12 Q547 70 608 80 L679 68 Q645 111 674 140 L697 164 Q639 157 632 186 L668 231 Q610 204 563 224 L523 250 Q503 211 449 223 L400 249 Q381 209 342 224 L292 251 Q281 211 239 222 L181 249 Q188 211 139 209 L91 224 Q113 181 66 179 L18 193 Q55 147 16 120 Z" fill="#fffdf2" stroke="#24463e" strokeWidth="4" strokeLinejoin="round" />
              <g fill="#ffe5a9" stroke="#24463e" strokeWidth="2.5">
                <path className="brain-hook-star brain-hook-star-first" d="M56 20 L61 30 L73 31 L64 39 L66 50 L56 44 L45 50 L48 38 L39 30 L51 29 Z" />
                <path className="brain-hook-star brain-hook-star-second" d="M651 204 L656 214 L668 215 L659 223 L661 234 L650 228 L639 234 L642 222 L633 214 L646 213 Z" />
              </g>
            </svg>
            <span>Can one AI <strong>learn a new game</strong> through trial and error—and carry what it learns into <strong>the next one?</strong></span>
          </p>
          <p>I’m designing a brain-inspired AI system to explore that question. It connects language-model reasoning with short-term memory, long-term memory and reusable skills, so the agent can try, observe, remember and improve instead of starting over each time.</p>
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
          <article className="snip-why-card"><span>01</span><div><h3>Problem</h3><p>Success in one game doesn’t tell us whether an agent can adapt when the rules, objects or available actions change.</p></div></article>
          <article className="snip-why-card"><span>02</span><div><h3>Idea</h3><p>Design a shared cognitive core that can learn through experience and carry useful knowledge between environments.</p></div></article>
          <article className="snip-why-card"><span>03</span><div><h3>How It Solves It</h3><p>Each environment supplies observations and actions. The core uses memory and reasoning to propose skills, then checks whether they work in the new setting.</p></div></article>
        </div>
      </section>
      <BrainProjectStatus />
    </section>
  )
}

function ModuleButton({ module, selected, onSelect, className = '' }: { module: ArchitectureModule; selected: boolean; onSelect: (id: string) => void; className?: string }) {
  return <button type="button" className={`brain-module ${selected ? 'is-selected' : ''} ${className}`} aria-pressed={selected} aria-controls="brain-module-explanation" onClick={() => onSelect(module.id)}><strong>{module.title}</strong><span>{module.subtitle}</span></button>
}
