import { canonicalGraph } from './canonicalGraph'
export type RecordedEvent = { eventId: string; timestamp: string; node: string; cycleId?: string; decisionId?: string; actionId?: string; receiptId?: string; versions?: Record<string,string>; evidenceRef?: string; detail: string }
export type RecordedTrace = { schemaVersion: 1; provenance: 'observed'; events: RecordedEvent[] }
const known = new Set(canonicalGraph.flatMap(v=>v.nodes.filter(n=>n.id!=='TITLE').map(n=>`${v.id}:${n.id}`)))
export function parseRecordedTrace(value: unknown): RecordedTrace {
  if (!value || typeof value!=='object') throw new Error('Expected a trace object.')
  const v=value as Partial<RecordedTrace>
  if(v.schemaVersion!==1||v.provenance!=='observed'||!Array.isArray(v.events)||v.events.length<1||v.events.length>10000) throw new Error('Use schemaVersion 1, observed provenance and 1–10,000 events.')
  const ids=new Set<string>()
  for(const e of v.events){if(!e||typeof e.eventId!=='string'||!e.eventId.trim()||ids.has(e.eventId)||!known.has(e.node)||typeof e.detail!=='string'||!e.detail.trim()||e.detail.length>2000||typeof e.timestamp!=='string'||!Number.isFinite(Date.parse(e.timestamp)))throw new Error('Each event needs a unique ID, valid timestamp, canonical node ID and readable detail.');ids.add(e.eventId)}
  return v as RecordedTrace
}
export function canonicalPath(view: string, from: string, to: string): string[] {
  const edges=canonicalGraph.find(v=>v.id===view)?.edges || []
  const queue=[[from]],seen=new Set([from])
  while(queue.length){const path=queue.shift()!,last=path.at(-1)!;if(last===to)return path.map(id=>`${view}:${id}`);for(const e of edges){const next=e.from===last?e.to:e.bidirectional&&e.to===last?e.from:null;if(next&&!seen.has(next)){seen.add(next);queue.push([...path,next])}}}
  return []
}
export const demoStages = [
  {label:'Observe', from:'ENV',to:'PER',text:'A blocked route enters through the environment adapter and perception.'},
  {label:'Update state',from:'PER',to:'BOARD',text:'Structured observations travel through the typed event bus and sole Blackboard reducer.'},
  {label:'Pin snapshot',from:'BOARD',to:'CYCLE',text:'Belief, goals, candidates and supporting versions are pinned for one coherent cycle.'},
  {label:'Recall',from:'MEMIF',to:'PRET',text:'Bounded observed historical evidence is assembled without treating predictions as history.'},
  {label:'Forecast',from:'CYCLE',to:'POK',text:'Candidate-conditioned dynamics pass prediction freshness checks. Desirability is evaluated separately.'},
  {label:'Past advice',from:'PRET',to:'PA',text:'A role-tagged historical judgment returns through the shared scheduler and service infrastructure.'},
  {label:'Future advice',from:'POK',to:'FA',text:'Prospective advice retains uncertainty and the same snapshot and supplied candidates.'},
  {label:'Meta guidance',from:'MCX',to:'MGCACHE',text:'One optional meta level advises how to arbitrate. It cannot issue a motor command.'},
  {label:'Select',from:'CYCLE',to:'MERGE',text:'Middle selects an available behavior—illustratively, inspect the blockage.'},
  {label:'Revalidate',from:'MERGE',to:'DEC',text:'The choice passes current-state validity. Confidence cannot authorize execution.'},
  {label:'Execute',from:'CTRL',to:'AUTH',text:'Only the control arbiter’s command envelope travels through the queue and admission gate to execution authority.'},
  {label:'Learn',view:'learning',from:'RECEIPT',to:'AGATE',text:'Actual receipts feed outcome attribution. Proposed learning artifacts face independent validation before release.'},
].map(s=>({...s,path:canonicalPath(s.view||'runtime',s.from,s.to)}))
