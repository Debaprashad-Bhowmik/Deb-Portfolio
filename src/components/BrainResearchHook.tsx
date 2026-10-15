import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import './BrainResearchHook.css'

function DisplayWord({ children, delay = 0 }: { children: string; delay?: number }) {
  return <strong className="sport-hook-word" style={{ '--word-delay': `${delay}s` } as CSSProperties}>
    <span className="sport-hook-word-echo" aria-hidden="true">{children}</span>
    <span aria-hidden="true">{[...children].map((letter, index) => <span className="sport-hook-letter-mask" key={index}><span className="sport-hook-letter" style={{ '--letter': index } as CSSProperties}>{letter === ' ' ? '\u00a0' : letter}</span></span>)}</span>
    <span className="sr-only">{children}</span>
  </strong>
}

export default function BrainResearchHook() {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { amount: .2 })
  const [paused, setPaused] = useState(false)
  const [pageVisible, setPageVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return <div ref={ref} className="brain-research-hook" data-active={visible && pageVisible && !paused}>
    <svg className="sport-hook-graphic" viewBox="0 0 700 290" preserveAspectRatio="none" aria-hidden="true">
      <path className="sport-hook-backplate" d="M45 26 H698 L653 287 H0 Z" fill="var(--sport-hook-rear)" />
      <path className="sport-hook-mainplate" d="M28 3 H680 L650 263 H0 Z" fill="var(--sport-hook-surface)" />
      <path d="M41 1 H680 M0 266 H650" fill="none" stroke="var(--sport-hook-accent)" strokeWidth="2" />
      <g className="sport-hook-speedlines" stroke="var(--sport-hook-trace)" strokeWidth="4" strokeLinecap="round"><path d="M-17 64 H66 M-30 78 H46 M-14 92 H30" /></g>
      <g className="sport-hook-forward" stroke="var(--sport-hook-accent)" strokeWidth="5" fill="none"><path d="M566 239 l-9 12 M585 239 l-9 12 M604 239 l-9 12" /></g>
      <path className="sport-hook-star" d="M636 28 l8 13 15 2-11 11 2 15-14-7-14 7 3-15-11-11 15-2Z" fill="var(--sport-hook-accent)" stroke="var(--sport-hook-copy)" strokeWidth="2" />
      <g className="sport-hook-trail" stroke="var(--sport-hook-accent)" strokeWidth="4" strokeLinecap="round"><path d="M651 203 H719 M661 219 H738 M651 235 H708" /></g>
    </svg>
    <p className="sport-hook-question">
      <span className="sport-hook-lead">Can one AI</span>{' '}
      <DisplayWord>learn a new game</DisplayWord>{' '}
      <span className="sport-hook-bridge">through trial and error—and carry</span>{' '}
      <span className="sport-hook-bridge">what it learns into</span>{' '}
      <DisplayWord delay={.18}>the next one?</DisplayWord>
    </p>
    <button className="sport-hook-motion" type="button" onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume question animation' : 'Pause question animation'} title={paused ? 'Resume animation' : 'Pause animation'}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button>
  </div>
}
