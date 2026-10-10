import fs from 'node:fs'
const xml = fs.readFileSync('.impeccable/research/canonical-v110.svg', 'utf8')
const decode = s => s.replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&quot;', '"').replaceAll('&amp;', '&')
const views = []
for (const match of xml.matchAll(/<foreignObject\b([^>]*)>([\s\S]*?)<\/foreignObject>/g)) {
  const title = /data-title="([^"]*)"/.exec(match[1])[1]
  const id = title.includes('Learning') ? 'learning' : title.includes('Runtime') ? 'runtime' : 'cognition'
  const source = decode(match[2])
  const nodes = new Map(), edges = [], groups = [], stack = [], skipped = []
  for (const raw of source.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('subgraph ')) {
      const g = /^subgraph (\w+)\["([^"]*)"\]/.exec(line)
      if (g) { groups.push({ id: g[1], label: g[2] }); stack.push(g[1]) }
      continue
    }
    if (line === 'end') { stack.pop(); continue }
    for (const n of line.matchAll(/\b([A-Za-z]\w*)\["([^"]*)"\](?:[:]{3}(\w+))?/g)) {
      nodes.set(n[1], { id: n[1], label: n[2].replace(/<br\s*\/?>/g, ' · '), kind: n[3] || 'code', group: stack.at(-1) || 'general', view: id, status: 'Documented design' })
    }
    for (const n of line.matchAll(/\b([A-Za-z]\w*)\{"([^"]*)"\}(?:[:]{3}(\w+))?/g)) {
      nodes.set(n[1], { id: n[1], label: n[2].replace(/<br\s*\/?>/g, ' · '), kind: n[3] || 'decision', group: stack.at(-1) || 'general', view: id, status: 'Documented design' })
    }
    if (/-->|-\.->|\.->|<-->|---/.test(line) && !line.startsWith('classDef')) {
      const clean = line.replace(/\b([A-Za-z]\w*)\["[^\"]*"\](?:::\w+)?/g, '$1').replace(/\b([A-Za-z]\w*)\{"[^\"]*"\}(?:::\w+)?/g, '$1').replace(/:::\w+/g, '')
      const relation = /([A-Za-z]\w*)\s*(-->|-\.->|<-->|---|-\.\s*"([^"]*)"\s*\.->|--\s*"([^"]*)"\s*-->)\s*(?:\|([^|]*)\|\s*)?([A-Za-z]\w*)/g
      let cursor = 0, found = false
      while (cursor < clean.length) {
        relation.lastIndex = cursor
        const e = relation.exec(clean)
        if (!e) break
        found = true
        edges.push({ from: e[1], to: e[6], label: e[3] || e[4] || e[5] || '', conditional: e[2].includes('.'), bidirectional: e[2] === '<-->' || e[2] === '---', source: `v1.10/${id}` })
        cursor = e.index + e[0].length - e[6].length
      }
      if (!found) skipped.push(line)
    }
  }
  const unknown = edges.filter(e => !nodes.has(e.from) || !nodes.has(e.to))
  const componentNodes = [...nodes.values()]
  views.push({ id, title, nodes: componentNodes, edges: edges.filter(e => e.from !== 'TITLE' && e.to !== 'TITLE'), groups })
  console.log(JSON.stringify({ view: id, nodes: componentNodes.length, edges: edges.length, unknown, skipped }))
  if (unknown.length || skipped.length || componentNodes.length !== ({cognition:129,runtime:178,learning:148})[id]) throw new Error('Canonical graph extraction failed its source coverage check')
}
fs.writeFileSync('src/data/canonicalGraph.ts', `// Curated canonical v1.10 graph, derived from the three Miro Mermaid sources.\n// Counts are diagram instances, not deployed components. Original workspace URLs are excluded.\nexport type CanonicalNode = { id: string; label: string; kind: string; group: string; view: string; status: string }\nexport type CanonicalEdge = { from: string; to: string; label: string; conditional: boolean; bidirectional: boolean; source: string }\nexport type CanonicalView = { id: string; title: string; nodes: CanonicalNode[]; edges: CanonicalEdge[]; groups: { id: string; label: string }[] }\nexport const canonicalGraph: CanonicalView[] = ${JSON.stringify(views, null, 2)}\n`)
