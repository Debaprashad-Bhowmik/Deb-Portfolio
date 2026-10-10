import { canonicalGraph } from './canonicalGraph'

export type GraphTarget = { node: string } | { view: string; edge: number }
export type GraphInspection = { target: GraphTarget; title: string; detail: string; path: string[]; relations: string[]; conditional: boolean; boundary: string }
const cache = new Map<string, GraphInspection>()

// Cyclic architecture has multiple possible routes. Show one directed, cycle-free
// upstream → target → downstream route, never an invented dependency or live trace.
export function inspectGraph(target: GraphTarget): GraphInspection {
 const key = 'node' in target ? target.node : `${target.view}:edge:${target.edge}`
 const cached = cache.get(key); if (cached) return cached
 const viewId = 'node' in target ? target.node.split(':')[0] : target.view
 const view = canonicalGraph.find(v => v.id === viewId)!
 const edge = 'edge' in target ? view.edges[target.edge] : null
 const start = edge?.from || ('node' in target ? target.node.split(':')[1] : '')
 const end = edge?.to || start
 const adjacency = (id: string, backwards: boolean) => view.edges.flatMap(e => {
  const next = backwards ? e.to === id ? e.from : e.bidirectional && e.from === id ? e.to : null : e.from === id ? e.to : e.bidirectional && e.to === id ? e.from : null
  return next && next !== 'TITLE' && next !== id ? [next] : []
 })
 const extend = (from: string, backwards: boolean, blocked: Set<string>) => {
  const queue = [[from]], seen = new Set([...blocked, from])
  let frontier = [from]
  for (let i = 0; i < queue.length; i++) {
   const path = queue[i], last = path.at(-1)!, neighbors = adjacency(last, backwards)
   if (!neighbors.length) return path
   frontier = path.length > frontier.length ? path : frontier
   for (const next of neighbors) if (!seen.has(next)) { seen.add(next); queue.push([...path, next]) }
  }
  // Feedback loops need an explicit cut instead of falsely claiming a terminal.
  return frontier
 }
 const before = extend(start, true, new Set(start === end ? [] : [end])).reverse()
 const middle = start === end ? before : [...before, end]
 const after = extend(end, false, new Set(middle.slice(0, -1)))
 const ids = [...middle, ...after.slice(1)]
 const label = (id: string) => view.nodes.find(n => n.id === id)?.label || id
 const relations = ids.slice(1).map((to, i) => {
  const e = i === before.length - 1 && edge ? edge : view.edges.find(e => e.from === ids[i] && e.to === to || e.bidirectional && e.to === ids[i] && e.from === to)
  return e?.label || (e?.conditional ? 'Conditional handoff' : 'Documented handoff')
 })
 const node = view.nodes.find(n=>n.id===start)
 const role: Record<string,string> = {code:'Code owns this state or workflow contract.',jev:'Jev is the TypeScript judgment component, selecting among supplied candidates.',past:'Historical judgment asks what worked before; Jev is the TypeScript judgment component.',present:'Present judgment integrates advice and selects among supplied candidates.',future:'Prospective judgment evaluates predictions, with uncertainty.',meta:'One meta level advises how to arbitrate; it cannot directly execute.',memory:'Memory keeps evidence and provenance separate from current live state.',world:'Prediction describes consequences; it does not itself authorize action.',skill:'Reusable behavior remains subject to runtime validity and admission.',fast:'A fast reasoning service produces advice through guarded runtime interfaces.',deep:'Deliberative reasoning produces proposals through guarded runtime interfaces.',decision:'A typed gate or decision contract controls this handoff.',core:'An architecture coordination component with explicit contracts.'}
 const detail = [label(start).split(' · ').slice(1).join(' · '), role[node?.kind||'']].filter(Boolean).join(' ')
 const result = { target, title: edge ? `${label(start).split(' · ')[0]} → ${label(end).split(' · ')[0]}` : label(start).split(' · ')[0], detail: edge ? edge.label || 'A documented producer-to-consumer handoff.' : detail || 'A documented architecture component.', path: ids.map(id => `${viewId}:${id}`), relations, conditional: Boolean(edge?.conditional), boundary: 'One canonical route; feedback cycles are cut. Design connections, not a recorded execution.' }
 cache.set(key, result); return result
}
