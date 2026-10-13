import { useState } from 'react'
import { ArrowRight, ChartNoAxesColumn, CheckCircle2, Database, Eye, Search, Target } from 'lucide-react'
import './BrainExplanation.css'

const steps = [
  { title: 'Observe', icon: Eye, caption: 'Notice the environment and current situation.', detail: 'The agent wants to get home, but the route is blocked. Short-term context holds the goal and the new observation.', color: 'blue' },
  { title: 'Recall', icon: Database, caption: 'Bring back relevant experience from memory.', detail: 'Long-term memory retrieves an earlier trip with another crossing nearby, giving the next decision useful context.', color: 'purple' },
  { title: 'Compare', icon: Search, caption: 'Consider options and their likely outcomes.', detail: 'The agent compares inspecting the blockage with trying the other crossing. A harder problem can call on deeper reasoning.', color: 'gold' },
  { title: 'Decide', icon: Target, caption: 'Choose a useful action for the current goal.', detail: 'Fast judgment selects from the available actions, informed by memory and advice from the reasoning layers.', color: 'rose' },
  { title: 'Validate', icon: CheckCircle2, caption: 'Check the action, then let software carry it out.', detail: 'Code checks the current state, permissions and safety before carrying out the choice. Reasoning alone cannot bypass these checks.', color: 'green' },
  { title: 'Learn', icon: ChartNoAxesColumn, caption: 'Use the result to inform memory and future skills.', detail: 'The actual outcome is recorded. Useful evidence can inform recall, and a proposed skill must pass validation before reuse.', color: 'blue' },
] as const

export default function BrainExplanation() {
  const [selected, setSelected] = useState(0)
  return <section id="brain-explanation" className="brain-explanation" aria-labelledby="brain-explanation-title">
    <div className="brain-process-heading"><h3 id="brain-explanation-title">What happens between<br /><em>thinking and acting?</em></h3><p>When an agent’s route is blocked, it needs to notice the obstacle, recall useful experience and choose what to try next. This design connects different thinking speeds, short-term context, long-term memory and skills to support that process.</p></div>
    <ol className="brain-process-steps" aria-label="Illustrative decision process">{steps.map((step, index) => <li key={step.title} className={`brain-process-${step.color}`}><button type="button" aria-label={`Example step ${index + 1}: ${step.title}`} aria-pressed={selected === index} aria-controls="brain-process-example" onClick={() => setSelected(index)}><span className="brain-process-number">{String(index + 1).padStart(2, '0')}</span><step.icon size={27} aria-hidden="true" /><strong>{step.title}</strong><span className="brain-process-caption">{step.caption}</span></button>{index < steps.length - 1 && <ArrowRight className="brain-process-arrow" size={18} aria-hidden="true" />}</li>)}</ol>
    <div id="brain-process-example" className="brain-process-example" aria-live="polite" aria-atomic="true"><span>Illustrative example · {selected + 1} of 6</span><p><strong>{steps[selected].title}.</strong> {steps[selected].detail}</p></div>
    <details className="brain-model-details"><summary>Technical details: thinking speeds, memory and skills</summary><div><p><strong>Thinking at different speeds.</strong> Jev is the TypeScript judgment component. Its approximately 200 ms target is a design target, not a measured result. Tactical reasoning uses a seconds-scale budget; deeper strategy is called on when novelty or repeated failure warrants it.</p><p><strong>Remembering what matters.</strong> Working context is separate from stored experience. Useful memories can stay easy to retrieve while repeated details lose recall priority. Original observed evidence is retained.</p><p><strong>Building skills from experience.</strong> Successful approaches can become candidate skills. They require independent validation before release, with promotion, restriction and rollback. Learning behavior still needs runtime evaluation.</p></div></details>
  </section>
}
