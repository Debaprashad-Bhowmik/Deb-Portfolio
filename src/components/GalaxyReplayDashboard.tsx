import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowUpRight, Check, LockKeyhole } from 'lucide-react'
import { canonicalGraph } from '../data/canonicalGraph'
import { demoStages, type RecordedTrace } from '../data/galaxyTrace'
import { replayPresentation, replayContracts } from '../data/galaxyReplayPresentation'
import './GalaxyReplayDashboard.css'

const nameOf = (key: string) => canonicalGraph.flatMap(v=>v.nodes.map(n=>({key:`${v.id}:${n.id}`,label:n.label}))).find(n=>n.key===key)?.label.split(' · ')[0] || key
const pins=['Belief','Goals','Candidates','Memory','World model','Policy','Skills']
const roles=[['Past','PJ'],['Middle','MID'],['Future','FJ'],['Meta-Past','MP'],['Meta-Middle','MM'],['Meta-Future','MF']]
function Panel({number,title,children}: {number:string;title:string;children:ReactNode}) {
  return <article className="galaxy-panel replay-panel"><h4><span>{number}</span>{title}</h4>{children}</article>
}
function Signal({path,delay=0}: {path:string;delay?:number}) {
  return <circle className="replay-packet" r="3" style={{offsetPath:`path('${path}')`,animationDelay:`${delay}s`} as CSSProperties}/>
}
function ContractGraphic({labels,merge=false}: {labels:[string,string,string];merge?:boolean}) {
  const path=merge?'M48 17L130 66 M212 17L130 66':'M40 42H220'
  return <svg className="replay-contract-graphic" viewBox="0 0 260 90" aria-hidden="true">
    <path d={path}/><Signal path={merge?'M48 17L130 66':'M40 42H220'}/>{merge&&<Signal path="M212 17L130 66" delay={1.2}/>}
    {labels.map((label,i)=>{const x=merge?[48,212,130][i]:[40,130,220][i],y=merge?(i===2?66:17):42;return <g key={label}><rect x={x-36} y={y-13} width="72" height="26" rx="3"/><text x={x} y={y+3} textAnchor="middle">{label}</text></g>})}
  </svg>
}
function CodePayload({lines}: {lines:string[]}) {
  return <div className="replay-code" style={{'--code-duration':`${lines.length*.9}s`} as CSSProperties}>
    <code aria-label="Illustrative pseudocode">{lines.map((line,i)=><span className="replay-code-line" key={i} style={{animationDelay:`${i*.9}s`} as CSSProperties}><span className="replay-line-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span><span>{line.split(/("[^"]*"|\/\/.*|\b(?:const|if|true|return)\b)/g).filter(Boolean).map((token,j)=><span key={j} className={token.startsWith('//')?'code-comment':token.startsWith('"')?'code-string':/^(const|if|true|return)$/.test(token)?'code-keyword':undefined}>{token}</span>)}</span></span>)}</code>
    <div className="replay-code-stream" aria-hidden="true"><span>observation → cycle → candidate → checked_result → evidence</span></div>
  </div>
}
export default function GalaxyReplayDashboard({step,recorded,moving,locked,onInspect}: {step:number;recorded:RecordedTrace|null;moving:boolean;locked:boolean;onInspect:(key:string)=>void}) {
  const root=useRef<HTMLDivElement>(null),[visible,setVisible]=useState(false)
  useEffect(()=>{const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));if(root.current)observer.observe(root.current);return()=>observer.disconnect()},[])
  const p=replayPresentation[Math.min(step,11)],contract=replayContracts[Math.min(step,11)],stage=demoStages[Math.min(step,11)],event=recorded?.events[step]
  const path=event?[event.node]:stage.path,activeView=path[0]?.split(':')[0]
  const title=event?nameOf(event.node):p.title
  const eventFields=event?Object.entries(event).filter(([key])=>!['detail','versions'].includes(key)).map(([key,value])=>[key,String(value)]):p.payload
  return <div ref={root} className="galaxy-dashboard replay-dashboard" data-stage={event?event.eventId:stage.label} data-recorded={Boolean(recorded)} data-motion={moving&&visible?'running':'paused'} style={{'--replay-accent':event?'#148e8d':p.accent} as CSSProperties}>
    <div className="replay-dashboard-heading"><div><span>{recorded?'IMPORTED EVENT':'ILLUSTRATIVE SIGNAL LAB'} / {String(step+1).padStart(2,'0')}</span><strong aria-live="polite" aria-atomic="true">{title}</strong></div><small>{recorded?'Imported event + static design reference. No inferred activity.':'Every panel follows this stage. Signal motion illustrates the design.'}</small></div>
    <Panel number="01" title="Connection route">
      <div className="replay-route-stat"><strong>{path.length}</strong><span>documented components<br/>{path.length-1} handoffs on this path</span></div>
      <div className="replay-route-chain">{path.map((key,i)=><div key={key}><i aria-hidden="true"/>{i<path.length-1&&<b className="replay-route-link" aria-hidden="true"/>}{locked?<span className="replay-route-id" title={nameOf(key)}>{key.split(':')[1]}</span>:<button type="button" onClick={()=>onInspect(key)} title={nameOf(key)}>{key.split(':')[1]}</button>}</div>)}</div>
      <small>{path.map(nameOf).join(' → ')}</small>
      <div className="replay-view-strip">{canonicalGraph.map(v=><span key={v.id} data-active={activeView===v.id}>{v.id} / {v.nodes.length}</span>)}</div>
    </Panel>
    <Panel number="02" title={recorded?'Event references':'Immutable cycle'}>
      {event||step===2?<svg className="replay-lock-graphic" viewBox="0 0 200 58" aria-hidden="true"><path d="M12 29H78 M122 29H188"/><rect x="78" y="9" width="44" height="40" rx="4"/><path d="M94 28v-8a6 6 0 0 1 12 0v8 M91 28h18v13H91z"/><Signal path="M12 29H78"/><Signal path="M122 29H188" delay={1}/></svg>:<ContractGraphic labels={contract.context}/>}
      {!event&&<div className="replay-contract-labels">{contract.context.map(label=><span key={label}>{label}</span>)}</div>}
      {event?<dl className="replay-file-fields">{['cycleId','decisionId','actionId','receiptId'].map(key=><div key={key}><dt>{key}</dt><dd>{String(event[key as keyof typeof event]??'Not supplied')}</dd></div>)}{event.versions&&typeof event.versions==='object'&&Object.entries(event.versions).map(([key,value])=><div key={`version-${key}`}><dt>{key} version</dt><dd>{String(value)}</dd></div>)}</dl>:<div className="galaxy-version-grid">{pins.map(pin=><span key={pin} data-active={p.pins.includes(pin)}><LockKeyhole size={9} aria-hidden="true"/>{pin}</span>)}</div>}
      <small>{event?'References are supplied by the imported record.':contract.contextNote}</small>
    </Panel>
    <Panel number="03" title="Memory substrate">
      <div className="replay-memory-map" aria-hidden="true"><svg viewBox="0 0 200 94"><path d="M38 20H100V47H166 M38 74H100V47"/>{[20,74].map(y=><g key={y}><ellipse cx="38" cy={y-7} rx="22" ry="7"/><path d={`M16 ${y-7}v14c0 10 44 10 44 0v-14`}/></g>)}<rect x="133" y="31" width="64" height="32" rx="3"/>{p.memoryMode>0&&<Signal path={p.memoryMode===3?'M166 47H100V20H38':p.memoryMode===2?'M38 20H100V47H166':'M38 74H100V47H166'}/>}</svg><span>Observed history</span><span>Recent context</span><strong>Bounded recall</strong></div>
      <p>{event?'The record does not supply memory-store contents.':p.memory}</p><small>{event?`Evidence reference: ${event.evidenceRef||'Not supplied'}`:'Original observed evidence remains distinct from generated advice.'}</small>
    </Panel>
    <Panel number="04" title={recorded?'Observed event':'Illustrative payload'}>
      <div className="replay-payload" key={event?.eventId||step}><header><i className="replay-signal-light" aria-hidden="true"/>{event?'observed / file':'pseudocode / illustrative'}</header>{event?<dl>{eventFields.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>:<CodePayload lines={contract.code}/>}<span className="replay-scan-line" aria-hidden="true"/></div>
      <small>{event?event.detail:`Input: ${p.input}. Output: ${p.output}.`}</small>
    </Panel>
    <Panel number="05" title="Verification ledger">
      <strong className="galaxy-evidence-number">141 <small>documented static checks passed</small></strong><div className="replay-evidence-pair"><span><b>03</b> architecture views</span><span><b>14</b> scenarios specified</span></div>
      <div className="replay-boundary"><Check size={12} aria-hidden="true"/><span>{event?'Imported provenance does not change the architecture’s validation status.':p.boundary}</span></div><small>Runtime evaluation pending. Motion shows no measured performance.</small>
    </Panel>
    <Panel number="06" title="Control boundary">
      <svg className="replay-authority" viewBox="0 0 200 93" aria-hidden="true"><path d="M12 20H93V45H182 M12 70H93V45"/><path className="replay-gate" d="M132 7v73"/><rect x="139" y="32" width="53" height="26" rx="3"/><Signal path={step===10?'M12 70H93V45H182':p.roles.length?'M12 20H93V45H124':'M12 70H93V45H124'}/><text x="12" y="13">ADVICE</text><text x="12" y="85">CODE</text><text x="146" y="49">ACT</text></svg>
      <p>{event?'The event identifies a component, not proof that every execution gate passed.':step<9?'Thinking is advisory. No motor command is authorized here.':step===9?'Revalidate against the current state before admitting execution.':step===10?'One command envelope passes through queue and admission.':'Learning proposes artifacts; it cannot issue a motor command.'}</p>
      <button type="button" disabled={locked} title={locked?'Return to wide view to inspect components':undefined} onClick={()=>onInspect('runtime:CADMIT')}>Inspect command admission <ArrowUpRight size={11}/></button>
    </Panel>
    <Panel number="07" title="Judgment roles">
      {!event&&<><ContractGraphic labels={contract.judgment} merge={step===7||step===8}/><div className="replay-contract-labels">{contract.judgment.map(label=><span key={label}>{label}</span>)}</div></>}
      <div className="galaxy-role-map">{roles.map(([label,id],i)=><button type="button" key={id} disabled={locked} title={locked?'Return to wide view to inspect this role':undefined} data-active={!event&&p.roles.includes(i)} onClick={()=>onInspect(`cognition:${id}`)}>{label}</button>)}</div>
      <small>{event?'Judgment-role activity is not supplied by this event.':contract.judgmentNote}</small>
    </Panel>
    <Panel number="08" title="Decision record">
      <div className="replay-sequence" aria-hidden="true">{demoStages.map((s,i)=><i key={s.label} data-current={!event&&i===step} data-complete={!event&&i<step}/>)}</div>
      {event?<ol className="replay-record-list">{recorded!.events.slice(Math.max(0,step-3),step+1).map(e=><li key={e.eventId}><b>{e.node.split(':')[1]}</b><span>{e.timestamp}</span></li>)}</ol>:<dl className="replay-contract-record">{contract.record.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>}
      <small>{event?'Event order comes from the imported file.':'Stage-specific record contract. Fields describe required linkage, not a completed runtime transaction.'}</small>
    </Panel>
    <Panel number="09" title="Prediction boundary">
      <svg className="replay-forecast" viewBox="0 0 200 97" aria-hidden="true"><path d="M15 78H185 M15 12V78"/><path className="replay-option-a" d="M20 69C60 69 62 45 94 43S142 23 180 19"/><path className="replay-option-b" d="M20 69C60 69 64 70 99 60S146 67 180 65"/><Signal path="M20 69C60 69 62 45 94 43S142 23 180 19"/><text x="135" y="13">INSPECT</text><text x="143" y="88">RETRY</text></svg>
      <p>{event?'No candidate forecasts or scores are supplied by this event.':p.prediction}</p><small>Illustrative branches / unscaled / not a benchmark.</small>
    </Panel>
    <Panel number="10" title="Learning release">
      <div className="replay-release-flow">{['Observed receipt','Outcome attribution','Candidate artifact','Independent validation','Release / rollback'].map((label,i)=><div key={label} data-active={!event&&step===11}><span>{String(i+1).padStart(2,'0')}</span><strong>{label}</strong><i className="replay-release-packet" style={{animationDelay:`${i*.5}s`}} aria-hidden="true"/></div>)}</div>
      <p>{event?'The record does not supply learning validation or promotion results.':p.learning}</p><button type="button" disabled={locked} title={locked?'Return to wide view to inspect components':undefined} onClick={()=>onInspect('learning:AGATE')}>Inspect release gate <ArrowUpRight size={11}/></button>
    </Panel>
  </div>
}
