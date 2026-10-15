import { ArrowRight, Brain, Focus, Library, NotebookPen, Wrench } from 'lucide-react'
import './BrainApproach.css'

export default function BrainApproach() {
  return <section id="brain-approach" className="brain-approach" aria-labelledby="brain-approach-title">
    <div className="brain-approach-heading">
      <h3 id="brain-approach-title">Learning without retraining.<br /><em>That’s the idea.</em></h3>
      <p>I’m exploring whether an agent can get better through experience without a new training run for its core language model. The ambition is to carry useful lessons into unfamiliar games, rather than build a separate trained player for each one.</p>
    </div>

    <div className="brain-approach-comparison">
      <article><h4>Conventional deep reinforcement learning</h4><p>Deep RL typically uses rewards to train a policy—the rule for choosing actions. In a neural-network policy, that learning changes the network’s weights.</p></article>
      <article><h4>This project’s main learning loop</h4><p>A pretrained LLM reasons over the current task and retrieved experience. Its core weights stay fixed while notes, plans and candidate skills change. This is a memory-and-reasoning architecture, not a conventional deep-RL training project.</p></article>
    </div>

    <figure className="brain-notebook-example" aria-labelledby="brain-notebook-title">
      <div className="brain-notebook-heading"><NotebookPen size={26} strokeWidth={1.6} aria-hidden="true" /><h4 id="brain-notebook-title">Like a player who takes notes.</h4></div>
      <div className="brain-notebook-flow">
        <div><strong>After one attempt</strong><blockquote>“The direct path was blocked. The bridge worked.”</blockquote><p>Keep the useful outcome in the notebook.</p></div>
        <ArrowRight size={24} aria-hidden="true" />
        <div><strong>On the next attempt</strong><p>Read that note, check whether the bridge is still usable, and propose a different route.</p><p className="brain-notebook-takeaway">Same core model. Different information. A revised plan.</p></div>
      </div>
      <figcaption>Illustrative example of the intended learning loop, not a measured result.</figcaption>
    </figure>

    <div id="brain-memory-loop" className="brain-approach-roles" aria-labelledby="brain-roles-title">
      <div className="brain-roles-heading">
        <h4 id="brain-roles-title">One model.<br /><em>Four ways to use experience.</em></h4>
        <p>What makes it brain-inspired? Separate roles for thinking, remembering and reusing experience.</p>
      </div>
      <ol className="brain-role-flow">
        <li><Brain aria-hidden="true" /><h5>Think</h5><span>Reasoning</span><p>The LLM reads the current situation and relevant notes, then proposes a next step.</p><ArrowRight className="brain-role-arrow" aria-hidden="true" /></li>
        <li><Focus aria-hidden="true" /><h5>Keep context</h5><span>Short-term memory</span><p>Working context keeps the current goal and recent observations available.</p><ArrowRight className="brain-role-arrow" aria-hidden="true" /></li>
        <li><Library aria-hidden="true" /><h5>Save lessons</h5><span>Long-term memory</span><p>External stores retain useful experience so it can be retrieved on later attempts.</p><ArrowRight className="brain-role-arrow" aria-hidden="true" /></li>
        <li><Wrench aria-hidden="true" /><h5>Reuse skills</h5><span>Reusable skills</span><p>Useful patterns become candidate procedures that must be tested before reuse.</p></li>
      </ol>
      <div className="brain-roles-takeaway">
        <div><NotebookPen aria-hidden="true" /><h5>The model reasons.<br />Software keeps the notebook.</h5></div>
        <p>The LLM helps interpret or summarize experience; software stores notes, retrieves them and checks actions. The model is not expected to remember everything by itself.</p>
      </div>
    </div>
    <div className="brain-approach-benefit">
      <h4>The benefit I’m testing</h4>
      <div><p>Experience that can be <strong>inspected, corrected and reused</strong> without retraining the core LLM. My design connects fast judgment, deeper reasoning, selective memory and independently validated skills.</p><p>Better performance or cross-game transfer still needs to be demonstrated.</p></div>
    </div>

    <details className="brain-approach-research">
      <summary>Technical details & related research</summary>
      <div>
        <section><h5>Research this builds on</h5><p>Related research includes <a href="https://arxiv.org/abs/2303.11366" target="_blank" rel="noreferrer">Reflexion</a>, which uses language feedback and memory without weight updates, and <a href="https://voyager.minedojo.org/" target="_blank" rel="noreferrer">Voyager</a>, which builds a reusable Minecraft skill library without gradient-based training. My focus is coordinating fast judgment, deeper reasoning, persistent memory and validated skills through one checked execution path.</p></section>
        <section><h5>How RL fits in</h5><p>The architecture also allows optional RL or other training methods for supporting policies and skills. “Without retraining” describes this main adaptation loop’s core LLM, not a ban on training every supporting component. See <a href="https://spinningup.openai.com/en/latest/spinningup/rl_intro.html" target="_blank" rel="noreferrer">the underlying RL concepts</a>.</p></section>
      </div>
    </details>
  </section>
}
