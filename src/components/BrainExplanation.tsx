import { useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Brain, CheckCircle2, Database, Eye, Gamepad2, GraduationCap, Pause, Play, RefreshCw } from 'lucide-react'
import './BrainExplanation.css'

const steps = [
  { title: 'Try', icon: Gamepad2, caption: 'Choose a permitted action in an unfamiliar game.', detail: 'In this imagined game, the agent needs to cross a river. It checks the available actions and tries an allowed route within its task limits.', color: 'blue' },
  { title: 'Observe', icon: Eye, caption: 'See what changed and whether the action helped.', detail: 'The crossing is blocked. The agent records the actual result, while short-term memory holds the goal and current situation.', color: 'purple' },
  { title: 'Remember', icon: Database, caption: 'Keep useful notes for the next decision.', detail: 'If a later detour succeeds, an external notebook could record: “The direct crossing was blocked; the bridge worked.” The LLM can reason over that note next time without changing its own weights. Repeated details can lose recall priority while the original observed evidence is retained.', color: 'gold' },
  { title: 'Develop a skill', icon: GraduationCap, caption: 'Turn a useful approach into a proposed strategy.', detail: 'The reasoning layers propose a reusable approach: inspect an obstacle, find another route and check it before moving. A candidate skill is a proposal, not yet a proven ability.', color: 'rose' },
  { title: 'Validate', icon: CheckCircle2, caption: 'Test the proposed skill before allowing reuse.', detail: 'Independent checks must test the candidate skill and look for regressions in older abilities. Software also checks each action before execution; failed candidates can be rejected or revised.', color: 'green' },
  { title: 'Reuse', icon: RefreshCw, caption: 'Adapt the skill and check it in another environment.', detail: 'A different game has different objects and controls. The system would map the strategy to the new observations and actions, then test it there. Whether this beats learning from scratch still needs evaluation.', color: 'blue' },
] as const

export default function BrainExplanation() {
  const [selected, setSelected] = useState(0)
  const [paused, setPaused] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const visible = useInView(sectionRef, { amount: 0.1 })
  const reducedMotion = useReducedMotion()
  const moving = visible && !paused && !reducedMotion
  return <section ref={sectionRef} id="brain-explanation" className="brain-explanation" data-motion={moving ? 'running' : 'paused'} aria-labelledby="brain-explanation-title">
    <div className="brain-process-heading"><h3 id="brain-explanation-title">Learn in one world.<br /><em>Adapt to the next?</em></h3><p>The research goal is to carry useful experience beyond the game where it was learned. Follow an imagined river-crossing example to see how trying, remembering and checking a skill could support that.</p></div>
    <ol className="brain-process-steps" aria-label="Illustrative decision process">{steps.map((step, index) => <li key={step.title} className={`brain-process-${step.color}`}><button type="button" aria-label={`Example step ${index + 1}: ${step.title}`} aria-pressed={selected === index} aria-controls="brain-process-example" onClick={() => setSelected(index)}><span className="brain-process-number">{String(index + 1).padStart(2, '0')}</span><step.icon size={27} aria-hidden="true" /><strong>{step.title}</strong><span className="brain-process-caption">{step.caption}</span></button>{index < steps.length - 1 && <ArrowRight className="brain-process-arrow" size={18} aria-hidden="true" />}</li>)}</ol>
    <div id="brain-process-example" className="brain-process-example" aria-live="polite" aria-atomic="true"><span>Illustrative example · {selected + 1} of 6</span><p><strong>{steps[selected].title}.</strong> {steps[selected].detail}</p></div>
    <figure className="brain-transfer" aria-labelledby="brain-transfer-title">
      <div className="brain-transfer-heading"><h4 id="brain-transfer-title">One cognitive core. Different environments.</h4><button type="button" className="brain-transfer-pause" onClick={() => setPaused(!paused)} disabled={Boolean(reducedMotion)}>{paused || reducedMotion ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{reducedMotion ? 'Motion reduced' : paused ? 'Resume signals' : 'Pause signals'}</button></div>
      <div className="brain-transfer-map">
        <div className="brain-transfer-environment"><Gamepad2 size={30} aria-hidden="true" /><strong>Game A</strong><span>Its world, rules and controls</span></div>
        <div className="brain-transfer-link" aria-hidden="true"><span>Observations ⇄ actions</span><i /></div>
        <div className="brain-transfer-core"><Brain size={38} aria-hidden="true" /><strong>Shared cognitive core</strong><span>Reasoning · memory · skills</span></div>
        <div className="brain-transfer-link" aria-hidden="true"><span>Observations ⇄ actions</span><i /></div>
        <div className="brain-transfer-environment"><Gamepad2 size={30} aria-hidden="true" /><strong>Game B</strong><span>New world, rules and controls</span></div>
      </div>
      <figcaption>Each game needs a software interface that translates what the agent can see and do. The same core would use those observations and actions; transferred skills still need to be adapted and checked in the new setting. Signals illustrate the design.</figcaption>
    </figure>
    <div className="brain-future-direction"><h4>Where this could lead</h4><p>Games are the first testing ground. The longer-term question is whether this architecture could support more general intelligence—including embodied robots. This is research toward AGI; cross-game transfer, robot applications and general intelligence remain to be demonstrated.</p></div>
    <details className="brain-model-details"><summary>Technical details: thinking speeds, memory and skills</summary><div><p><strong>Thinking at different speeds.</strong> Jev is the TypeScript judgment component. Its approximately 200 ms target is a design target, not a measured result. Tactical reasoning uses a seconds-scale budget; deeper strategy is called on when novelty or repeated failure warrants it.</p><p><strong>Remembering what matters.</strong> The core LLM’s weights stay fixed in the main adaptation loop. Short-term context holds the current task; external stores keep long-term experience and procedures. The LLM reasons over retrieved notes. Recall is selective; original observed evidence is retained.</p><p><strong>Building skills from experience.</strong> Successful approaches can become candidate procedures or skills. They require independent validation before release, with promotion, restriction and rollback. Supporting learners may use training, including optional RL; this is separate from the core LLM’s note-based adaptation. Learning behavior still needs runtime evaluation.</p></div></details>
  </section>
}
