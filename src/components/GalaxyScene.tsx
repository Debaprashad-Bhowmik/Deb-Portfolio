import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { canonicalGraph, type CanonicalNode } from '../data/canonicalGraph'
import type { GraphTarget } from '../data/galaxyInspection'

export type GalaxyNode = CanonicalNode & { key: string; position: THREE.Vector3 }
const colors: Record<string, string> = { code: '#ffa25c', jev: '#d9f45b', fast: '#52cfff', deep: '#ac8aff', memory: '#ff75bd', world: '#38ded0', skill: '#ff8b35', decision: '#def45e', core:'#ffe1b0', past:'#ff75bd', present:'#d9f45b', future:'#ff943f', meta:'#c49bff' }
const hash = (s: string) => [...s].reduce((v, c) => (v * 31 + c.charCodeAt(0)) >>> 0, 7)
const random = (s: number) => { const n = Math.sin(s * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) }
const galaxyNodes: GalaxyNode[] = canonicalGraph.flatMap((view, v) => view.nodes.filter(n => n.id !== 'TITLE').map(n => {
  const seed = hash(`${view.id}:${n.id}`), groupIndex = view.groups.findIndex(g => g.id === n.group)
  const a = groupIndex / Math.max(view.groups.length, 1) * Math.PI * 2 + v * .3
  let position: THREE.Vector3
  if (view.id === 'cognition' && /^L[2-5]$/.test(n.group)) {
    const branch = /Past|Historical/.test(n.label) ? -1 : /Future|Prospective/.test(n.label) ? 1 : 0
    const angle = -Math.PI / 2 + branch * .85 + (random(seed) - .5) * .3
    const radius = 170 + (Number(n.group.slice(1)) - 2) * 60 + random(seed + 1) * 30
    position = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
  } else {
    const index = view.nodes.filter(other => other.group === n.group).findIndex(other => other.id === n.id)
    const radius = 160 + Math.sqrt(index + 1) * 38 + random(seed) * 24
    const angle = a + (random(seed + 2) - .5) * .35
    position = new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)
  }
  return { ...n, key: `${view.id}:${n.id}`, position }
}))
const nodeMap = new Map(galaxyNodes.map(n => [n.key, n]))
const galaxyEdges = canonicalGraph.flatMap(view => view.edges.map((e, index) => ({ ...e, index, view: view.id, fromKey: `${view.id}:${e.from}`, toKey: `${view.id}:${e.to}` }))).filter(e => nodeMap.has(e.fromKey) && nodeMap.has(e.toKey))
class PlanarConnection extends THREE.Curve<THREE.Vector3> {
 private a: THREE.Vector3
 private b: THREE.Vector3
 constructor(a: THREE.Vector3, b: THREE.Vector3) { super(); this.a=a; this.b=b }
 getPoint(t: number) { const a = Math.atan2(this.a.z, this.a.x), b = Math.atan2(this.b.z, this.b.x), delta = Math.atan2(Math.sin(b-a), Math.cos(b-a)), base = THREE.MathUtils.lerp(this.a.length(), this.b.length(), t), r = base - Math.sin(t*Math.PI)*(base-125)*Math.min(Math.abs(delta)*1.2,1); return new THREE.Vector3(Math.cos(a+delta*t)*r, 0, Math.sin(a+delta*t)*r) }
}
const curve = (a: THREE.Vector3, b: THREE.Vector3) => new PlanarConnection(a, b)

const particleVertex = `
attribute vec3 aStart; attribute vec3 aEnd; attribute float aPhase; attribute float aMode; attribute float aSize;
attribute vec3 aColor; varying vec3 vColor; varying float vAlpha; uniform float uTime; uniform float uDensity;
void main(){
 vec3 p=position;
 if(aMode<0.5){float r=length(p.xz);float a=atan(p.z,p.x)+uTime*(0.008+16.0/pow(max(r,30.0),1.45));p.x=cos(a)*r;p.z=sin(a)*r;p.y+=sin(uTime*.2+aPhase)*2.0;}
 else if(aMode<1.5){float f=fract(aPhase+uTime*.018);float a=atan(aStart.z,aStart.x),b=atan(aEnd.z,aEnd.x);float d=atan(sin(b-a),cos(b-a));float base=mix(length(aStart),length(aEnd),f);float r=base-sin(f*3.14159)*(base-125.)*min(abs(d)*1.2,1.);p=vec3(cos(a+d*f)*r,0.,sin(a+d*f)*r);}
 else{p.y+=sin(uTime*.3+aPhase)*1.4;}
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(aSize*1200.0/-mv.z,1.0,6.0);
 vColor=aColor;vAlpha=(aMode<.5?.6:.8)*uDensity;
}
`
const particleFragment = `varying vec3 vColor; varying float vAlpha; void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,1.6)*vAlpha;gl_FragColor=vec4(vColor,a);}`
const diskFragment = `
varying vec2 vUv; uniform float uTime;
float noise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float a=atan(p.y,p.x);float spin=a+uTime*(.05+.025/max(r,.08));
 float ring=exp(-pow((r-.29)*8.,2.));float inner=exp(-pow((r-.15)*32.,2.));
 float grain=noise(floor(vec2(spin*620.+r*250.,r*750.)));
 float streak=pow(.5+.5*sin(spin*170.+r*540.+sin(spin*37.)*8.),3.)*(.3+grain*.7);
 vec3 c=mix(vec3(1.,.18,.035),vec3(1.,.73,.24),streak);c=mix(c,vec3(1.,.95,.82),inner*.95);
 float alpha=(ring*(.18+streak*.8+grain*.45)+inner*.95)*smoothstep(.08,.13,r)*(1.-smoothstep(.55,.9,r));
 gl_FragColor=vec4(c,alpha);}
`
const lensFragment = `varying vec2 vUv;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float halo=exp(-pow((r-.42)*30.,2.));float dark=1.-smoothstep(.35,.4,r);vec3 c=mix(vec3(1.,.63,.3),vec3(0.),dark);float alpha=max(dark,halo);gl_FragColor=vec4(c,alpha);}`

export default function GalaxyScene({ active, reduced, quality, selected, view, focus, reset, zoom, path, onPick, onHover, onPin, onReady }: { active: boolean; reduced: boolean; quality: 'auto'|'low'; selected: string | null; view: string; focus: number; reset: number; zoom: number; path: string[]; onPick: (id: string) => void; onHover: (target: GraphTarget|null) => void; onPin: (target: GraphTarget) => void; onReady: (ok: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ setActive: (b: boolean) => void; inspect: (id: string|null, view: string, focus: boolean, path: string[]) => void; reset: () => void; zoom: (direction: number) => void } | null>(null)
  const previousZoom = useRef(zoom)
  const previousFocus = useRef(focus)
  const pickCallback = useRef(onPick)
  const hoverCallback = useRef(onHover), pinCallback = useRef(onPin)
  useEffect(() => { pickCallback.current = onPick }, [onPick])
  useEffect(() => { hoverCallback.current = onHover; pinCallback.current = onPin }, [onHover, onPin])
  useEffect(() => {
    if (!host.current) return
    const container = host.current
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }) }
    catch { onReady(false); return }
    renderer.setClearColor('#030711'); renderer.setPixelRatio(Math.min(devicePixelRatio, quality === 'low' ? 1 : 1.65))
    container.appendChild(renderer.domElement)
    renderer.domElement.setAttribute('aria-label', 'Interactive galactic architecture. Drag to orbit; scroll to zoom. Use the component inspector for keyboard exploration.')
    const scene = new THREE.Scene(), network = new THREE.Group(), camera = new THREE.PerspectiveCamera(38, 2, 1, 2200)
    scene.add(network)
    camera.position.set(0, 260, 500)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0, 0); controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 170; controls.maxDistance = 1300; controls.maxPolarAngle = Math.PI * .48; controls.minPolarAngle = .18; controls.enablePan = true
    const material = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms: { uTime: {value:0}, uDensity:{value:1} }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })
    const positions: number[] = [], starts: number[] = [], ends: number[] = [], phases: number[] = [], modes: number[] = [], sizes: number[] = [], colorBuffer: number[] = []
    const add = (p: THREE.Vector3, color: THREE.Color, size: number, mode: number, phase: number, a=p, b=p) => { positions.push(...p.toArray()); starts.push(...a.toArray()); ends.push(...b.toArray()); colorBuffer.push(color.r,color.g,color.b); sizes.push(size); modes.push(mode); phases.push(phase) }
    const count = quality === 'low' || container.clientWidth < 600 ? 6500 : 23000
    for(let i=0;i<count;i++) {
      const seed=i+47, edge=galaxyEdges[i%galaxyEdges.length]
      const a=nodeMap.get(edge.fromKey)!.position,b=nodeMap.get(edge.toKey)!.position
      const c=new THREE.Color(colors[nodeMap.get(edge.fromKey)!.kind] || '#79ddff')
      // Every signal belongs to a real edge. Repeated samples express its flow,
      // never additional components or measured runtime traffic.
      const backwards=edge.bidirectional&&i%2===0
      add(a,c,.7+random(seed+4)*1.25,1,random(seed+5),backwards?b:a,backwards?a:b)
    }
    galaxyEdges.forEach((e,i)=>{ const a=nodeMap.get(e.fromKey)!.position,b=nodeMap.get(e.toKey)!.position;for(let k=0;k<3;k++)add(a,new THREE.Color(colors[nodeMap.get(e.fromKey)!.kind]||'#79ddff'),1.4,1,k/3+random(i),a,b) })
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.setAttribute('aStart',new THREE.Float32BufferAttribute(starts,3));geometry.setAttribute('aEnd',new THREE.Float32BufferAttribute(ends,3));geometry.setAttribute('aColor',new THREE.Float32BufferAttribute(colorBuffer,3));geometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));geometry.setAttribute('aMode',new THREE.Float32BufferAttribute(modes,1));geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1))
    network.add(new THREE.Points(geometry,material))
    const edgePositions:number[]=[]
    galaxyEdges.forEach(e=>{const points=curve(nodeMap.get(e.fromKey)!.position,nodeMap.get(e.toKey)!.position).getPoints(8);for(let i=0;i<points.length-1;i++)edgePositions.push(...points[i].toArray(),...points[i+1].toArray())})
    const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3))
    const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:'#aa987d',transparent:true,opacity:.055,depthWrite:false}));network.add(lines)
    const canonicalPositions=galaxyNodes.flatMap(n=>n.position.toArray()),canonicalColors=galaxyNodes.flatMap(n=>new THREE.Color(colors[n.kind]||'#79ddff').toArray())
    const canonicalGeometry=new THREE.BufferGeometry();canonicalGeometry.setAttribute('position',new THREE.Float32BufferAttribute(canonicalPositions,3));canonicalGeometry.setAttribute('color',new THREE.Float32BufferAttribute(canonicalColors,3))
    const canonicalPoints=new THREE.Points(canonicalGeometry,new THREE.PointsMaterial({size:4.5,vertexColors:true,transparent:true,opacity:1,sizeAttenuation:true}));network.add(canonicalPoints)
    const diskMaterial=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:diskFragment,uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide})
    const disk=new THREE.Mesh(new THREE.PlaneGeometry(540,540),diskMaterial);disk.rotation.x=-Math.PI/2;disk.position.y=0;scene.add(disk)
    const horizon=new THREE.Mesh(new THREE.SphereGeometry(16.5,32,24),new THREE.MeshBasicMaterial({color:'#000000'}));scene.add(horizon)
    const lens=new THREE.Mesh(new THREE.PlaneGeometry(84,84),new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:lensFragment,transparent:true,depthWrite:true}));lens.position.set(0,8,0);scene.add(lens)
    const ringGeo=new THREE.BufferGeometry(),ringPts:number[]=[]
    for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;ringPts.push(Math.cos(a)*155,0,Math.sin(a)*155)}ringGeo.setAttribute('position',new THREE.Float32BufferAttribute(ringPts,3));scene.add(new THREE.Line(ringGeo,new THREE.LineBasicMaterial({color:'#d1975a',transparent:true,opacity:.35})))
    let highlight: THREE.LineSegments | null=null, marker:THREE.Mesh|null=null
    let running=false,time=0,last=0,focusTarget:THREE.Vector3|null=null,frames=0,slow=0
    const render = () => {lens.quaternion.copy(camera.quaternion); controls.update();renderer.render(scene,camera)}
    const animate=(now:number)=>{
      const delta=last?Math.min((now-last)/1000,.05):0;last=now;time+=delta
      material.uniforms.uTime.value=time;diskMaterial.uniforms.uTime.value=time;network.rotation.y=-time*.009
      if(focusTarget){controls.target.lerp(focusTarget,.07);if(controls.target.distanceTo(focusTarget)<.2)focusTarget=null}
      if(delta>.026)slow++;frames++
      if(frames===180&&slow>90&&quality==='auto'){geometry.setDrawRange(Math.max(0,count-8000),Infinity);renderer.setPixelRatio(1)}
      render()
    }
    const start=(b:boolean)=>{running=b&&!reduced;last=0;renderer.setAnimationLoop(running?animate:null);if(!running)render()}
    const inspect=(id:string|null,filter:string,shouldFocus:boolean,path:string[])=>{
      if(highlight){network.remove(highlight);highlight.geometry.dispose();(highlight.material as THREE.Material).dispose();highlight=null}
      if(marker){network.remove(marker);marker.geometry.dispose();(marker.material as THREE.Material).dispose();marker=null}
      const route=new Set(path.slice(1).map((key,i)=>`${path[i]}>${key}`))
      const linked=galaxyEdges.filter(e=>path.length?route.has(`${e.fromKey}>${e.toKey}`)||e.bidirectional&&route.has(`${e.toKey}>${e.fromKey}`):id?(e.fromKey===id||e.toKey===id):e.view===filter)
      material.uniforms.uDensity.value=path.length||id?.length ? .24 : 1
      if(id||filter!=='galaxy'||path.length){
        const p:number[]=[];linked.forEach(e=>{const points=curve(nodeMap.get(e.fromKey)!.position,nodeMap.get(e.toKey)!.position).getPoints(18);for(let i=0;i<points.length-1;i++)p.push(...points[i].toArray(),...points[i+1].toArray())})
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));highlight=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#b9fff0',transparent:true,opacity:1}));network.add(highlight)
      }
      if(id&&nodeMap.has(id)){
        const n=nodeMap.get(id)!;marker=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:colors[n.kind]}));marker.position.copy(n.position);network.add(marker)
        if(shouldFocus){focusTarget=network.localToWorld(n.position.clone());if(!running){controls.target.copy(focusTarget);focusTarget=null}camera.position.copy(network.localToWorld(n.position.clone())).add(new THREE.Vector3(0,160,330))}
      }
      render()
    }
    const resetCamera=()=>{focusTarget=null;camera.position.set(0,260,500);controls.target.set(0,0,0);render()}
    api.current={setActive:start,inspect,reset:resetCamera,zoom:(direction)=>{const distance=camera.position.clone().sub(controls.target).multiplyScalar(direction>0?.85:1.18);distance.clampLength(170,1300);camera.position.copy(controls.target).add(distance);render()}}
    controls.addEventListener('change',()=>{if(!running){lens.quaternion.copy(camera.quaternion);renderer.render(scene,camera)}})
    const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='low'?1:w<600?1.2:1.65));geometry.setDrawRange(w<600?Math.max(0,count-6500):0,Infinity);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();render()}
    const observer=new ResizeObserver(resize);observer.observe(container);resize()
    const ray=new THREE.Raycaster();ray.params.Points.threshold=5;ray.params.Line.threshold=2.3
    let down=[0,0],dragging=false,lastHover='',lastMove=0
    const hitAt=(e:PointerEvent):GraphTarget|null=>{const b=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);network.updateWorldMatrix(true,true);const node=ray.intersectObject(canonicalPoints)[0];if(node?.index!==undefined)return {node:galaxyNodes[node.index].key};const line=ray.intersectObject(lines)[0];if(line?.index!==undefined){const edge=galaxyEdges[Math.floor(line.index/16)];return {view:edge.view,edge:edge.index}}return null}
    const leave=()=>{lastHover='';hoverCallback.current(null);renderer.domElement.style.cursor='grab'}
    const pointerDown=(e:PointerEvent)=>{down=[e.clientX,e.clientY];dragging=true;leave()}
    const pointerUp=(e:PointerEvent)=>{dragging=false;if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const hit=hitAt(e);if(hit){pinCallback.current(hit);if('node' in hit)pickCallback.current(hit.node)}}
    const pointerMove=(e:PointerEvent)=>{if(dragging||e.pointerType==='touch'||performance.now()-lastMove<45)return;lastMove=performance.now();const hit=hitAt(e),key=JSON.stringify(hit);if(key!==lastHover){lastHover=key;hoverCallback.current(hit);renderer.domElement.style.cursor=hit?'pointer':'grab'}}
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerleave',leave)
    onReady(true)
    return()=>{api.current=null;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerleave',leave);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.LineSegments||o instanceof THREE.Line){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}
  },[quality,reduced,onReady])
  useEffect(()=>{api.current?.setActive(active)},[active,quality,reduced])
  useEffect(()=>{api.current?.inspect(selected,view,focus!==previousFocus.current&&focus>0,path);previousFocus.current=focus},[selected,view,focus,path,quality,reduced])
  useEffect(()=>{api.current?.reset()},[reset])
  useEffect(()=>{if(zoom!==previousZoom.current)api.current?.zoom(zoom-previousZoom.current);previousZoom.current=zoom},[zoom])
  return <div ref={host} className="galaxy-canvas-host" />
}
