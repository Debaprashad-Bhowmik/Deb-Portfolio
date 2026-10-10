import fs from 'node:fs'
import ts from 'typescript'
import assert from 'node:assert/strict'
const out = '.impeccable/review/graph-check'
fs.mkdirSync(out,{recursive:true})
for (const name of ['canonicalGraph','galaxyInspection','galaxyTrace']) {
 const source=fs.readFileSync(`src/data/${name}.ts`,'utf8').replaceAll("'./canonicalGraph'","'./canonicalGraph.mjs'")
 fs.writeFileSync(`${out}/${name}.mjs`,ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText)
}
const {canonicalGraph}=await import(`../${out}/canonicalGraph.mjs`)
const {inspectGraph}=await import(`../${out}/galaxyInspection.mjs`)
const {demoStages,parseRecordedTrace}=await import(`../${out}/galaxyTrace.mjs`)
let checked=0
for(const view of canonicalGraph) {
 for(const target of [...view.nodes.filter(n=>n.id!=='TITLE').map(n=>({node:`${view.id}:${n.id}`})),...view.edges.map((_,edge)=>({view:view.id,edge}))]) {
  const result=inspectGraph(target),ids=result.path.map(k=>k.split(':')[1])
  assert.equal(new Set(ids).size,ids.length,'No repeated nodes / false complete cycles')
  for(let i=1;i<ids.length;i++)assert(view.edges.some(e=>e.from===ids[i-1]&&e.to===ids[i]||e.bidirectional&&e.to===ids[i-1]&&e.from===ids[i]),`Invented relation ${ids[i-1]} → ${ids[i]}`)
  if('node' in target)assert(result.path.includes(target.node));else{const edge=view.edges[target.edge];assert(ids.some((id,i)=>id===edge.from&&ids[i+1]===edge.to),'Hovered connection missing')}
  checked++
 }
}
for(const stage of demoStages)assert(stage.path.length>1,`${stage.label} has no source path`)
assert(demoStages[10].path.includes('runtime:CADMIT'),'Execution bypasses admission')
const sample={schemaVersion:1,provenance:'observed',events:[{eventId:'test-01',timestamp:'2026-10-10T00:00:00Z',node:'runtime:ENV',detail:'Local test fixture.'}]}
assert.equal(parseRecordedTrace(sample).events.length,1)
assert.throws(()=>parseRecordedTrace({...sample,events:[...sample.events,...sample.events]}))
assert.throws(()=>parseRecordedTrace({...sample,events:[{...sample.events[0],node:'runtime:INVENTED'}]}))
console.log(JSON.stringify({checkedHoverTargets:checked,counts:canonicalGraph.map(v=>[v.id,v.nodes.length,v.edges.length]),nodeKinds:canonicalGraph.flatMap(v=>v.nodes).reduce((a,n)=>(a[n.kind]=(a[n.kind]||0)+1,a),{}),executionPath:demoStages[10].path,replayStages:demoStages.length,traceValidation:'pass'}))
