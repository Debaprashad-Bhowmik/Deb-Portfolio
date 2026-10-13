import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { canonicalGraph, type CanonicalNode } from '../data/canonicalGraph'
import type { GraphTarget } from '../data/galaxyInspection'
import brainAnchors from '../data/brainAnchors.json'
import { cortexMaterial, loadCortex } from './BrainCortex'

export type GalaxyNode = CanonicalNode & { key: string; position: THREE.Vector3 }
const colors: Record<string, string> = { code: '#ffa25c', jev: '#d9f45b', fast: '#52cfff', deep: '#ac8aff', memory: '#ff75bd', world: '#38ded0', skill: '#ff8b35', decision: '#def45e', core:'#ffe1b0', past:'#ff75bd', present:'#d9f45b', future:'#ff943f', meta:'#c49bff' }
const hash = (s: string) => [...s].reduce((v, c) => (v * 31 + c.charCodeAt(0)) >>> 0, 7)
const random = (s: number) => { const n = Math.sin(s * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n) }
// Each documented component gets one distinct position in the cortex-shaped
// volume. This is a software layout, not a mapping to biological brain regions.
let nodeOrdinal = 0
const galaxyNodes: GalaxyNode[] = canonicalGraph.flatMap(view => view.nodes.filter(n => n.id !== 'TITLE').map(n => {
  const key = `${view.id}:${n.id}`, seed = hash(key)
  const anchor = brainAnchors[(nodeOrdinal++ * 47) % brainAnchors.length]
  const depth = n.kind === 'jev' ? .3 : .72 + random(seed) * .22
  const position = new THREE.Vector3(...anchor as [number, number, number]).multiplyScalar(depth)
  return { ...n, key, position }
}))
const nodeMap = new Map(galaxyNodes.map(n => [n.key, n]))
const galaxyEdges = canonicalGraph.flatMap(view => view.edges.map((e, index) => ({ ...e, index, view: view.id, fromKey: `${view.id}:${e.from}`, toKey: `${view.id}:${e.to}` }))).filter(e => nodeMap.has(e.fromKey) && nodeMap.has(e.toKey))
// The same quadratic is used for picking, highlighting, the followed signal,
// and the GPU packet stream, so every visible handoff follows its actual edge.
const controlPoint = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().add(b).multiplyScalar(.28)
const curve = (a: THREE.Vector3, b: THREE.Vector3) => new THREE.QuadraticBezierCurve3(a, controlPoint(a, b), b)
const particleVertex = `
attribute vec3 aStart; attribute vec3 aEnd; attribute float aPhase; attribute float aSize;
attribute vec3 aColor; varying vec3 vColor; varying float vAlpha; uniform float uTime; uniform float uDensity;
void main(){
 float f=fract(aPhase+uTime*.055);
 vec3 control=(aStart+aEnd)*.28;
 vec3 p=(1.-f)*(1.-f)*aStart+2.*(1.-f)*f*control+f*f*aEnd;
 vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(aSize*900.0/-mv.z,1.0,5.0);
 vColor=aColor;vAlpha=.64*uDensity;
}
`
const particleFragment = `varying vec3 vColor; varying float vAlpha; void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;float a=pow(1.-d*2.,1.6)*vAlpha;gl_FragColor=vec4(vColor,a);}`
export type CameraMode = 'overview' | 'following' | 'framed' | 'manual'

export default function GalaxyScene({ active, reduced, quality, interactionLocked, selected, view, focus, reset, zoom, path, followRequest, followPath, onCamera, onPick, onHover, onPin, onReady }: { active: boolean; reduced: boolean; quality: 'auto'|'low'; interactionLocked: boolean; selected: string | null; view: string; focus: number; reset: number; zoom: number; path: string[]; followRequest: number; followPath: string[]; onCamera: (mode: CameraMode, node: string|null) => void; onPick: (id: string) => void; onHover: (target: GraphTarget|null) => void; onPin: (target: GraphTarget) => void; onReady: (ok: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<{ setActive: (b: boolean) => void; lock: (b: boolean) => void; inspect: (id: string|null, view: string, focus: boolean, path: string[]) => void; follow: (path: string[]) => void; reset: () => void; zoom: (direction: number) => void } | null>(null)
  const interactionLock = useRef(interactionLocked)
  const previousZoom = useRef(zoom)
  const previousFocus = useRef(focus)
  const pickCallback = useRef(onPick)
  const hoverCallback = useRef(onHover), pinCallback = useRef(onPin)
  const cameraCallback = useRef(onCamera)
  useEffect(() => { cameraCallback.current = onCamera }, [onCamera])
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
    renderer.domElement.setAttribute('aria-label', 'Interactive brain-shaped software architecture. Drag to orbit; scroll to zoom. Use the component inspector for keyboard exploration.')
    const scene = new THREE.Scene(), network = new THREE.Group(), camera = new THREE.PerspectiveCamera(38, 2, 1, 2200)
    scene.add(network)
    camera.position.set(350, 190, 460)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enabled = !interactionLock.current
    controls.target.set(0, 0, 0); controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 120; controls.maxDistance = 1300; controls.maxPolarAngle = Math.PI - .1; controls.minPolarAngle = .1; controls.enablePan = true
    const material = new THREE.ShaderMaterial({ vertexShader: particleVertex, fragmentShader: particleFragment, uniforms: { uTime: {value:0}, uDensity:{value:1} }, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending })
    const positions: number[] = [], starts: number[] = [], ends: number[] = [], phases: number[] = [], sizes: number[] = [], colorBuffer: number[] = []
    const add = (p: THREE.Vector3, color: THREE.Color, size: number, phase: number, a=p, b=p) => { positions.push(...p.toArray()); starts.push(...a.toArray()); ends.push(...b.toArray()); colorBuffer.push(color.r,color.g,color.b); sizes.push(size); phases.push(phase) }
    const count = quality === 'low' || container.clientWidth < 600 ? 4200 : 12500
    for(let i=0;i<count;i++) {
      const seed=i+47, edge=galaxyEdges[i%galaxyEdges.length]
      const a=nodeMap.get(edge.fromKey)!.position,b=nodeMap.get(edge.toKey)!.position
      const c=new THREE.Color(colors[nodeMap.get(edge.fromKey)!.kind] || '#79ddff')
      // Every signal belongs to a real edge. Repeated samples express its flow,
      // never additional components or measured runtime traffic.
      const backwards=edge.bidirectional&&i%2===0
      add(a,c,.7+random(seed+4)*1.25,random(seed+5),backwards?b:a,backwards?a:b)
    }
    galaxyEdges.forEach((e,i)=>{ const a=nodeMap.get(e.fromKey)!.position,b=nodeMap.get(e.toKey)!.position;for(let k=0;k<3;k++)add(a,new THREE.Color(colors[nodeMap.get(e.fromKey)!.kind]||'#79ddff'),1.4,k/3+random(i),a,b) })
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3)); geometry.setAttribute('aStart',new THREE.Float32BufferAttribute(starts,3));geometry.setAttribute('aEnd',new THREE.Float32BufferAttribute(ends,3));geometry.setAttribute('aColor',new THREE.Float32BufferAttribute(colorBuffer,3));geometry.setAttribute('aPhase',new THREE.Float32BufferAttribute(phases,1));geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1))
    network.add(new THREE.Points(geometry,material))
    const edgePositions:number[]=[]
    galaxyEdges.forEach(e=>{const points=curve(nodeMap.get(e.fromKey)!.position,nodeMap.get(e.toKey)!.position).getPoints(8);for(let i=0;i<points.length-1;i++)edgePositions.push(...points[i].toArray(),...points[i+1].toArray())})
    const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(edgePositions,3))
    const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:'#71accc',transparent:true,opacity:.095,depthWrite:false}));network.add(lines)
    const canonicalPositions=galaxyNodes.flatMap(n=>n.position.toArray()),canonicalColors=galaxyNodes.flatMap(n=>new THREE.Color(colors[n.kind]||'#79ddff').toArray())
    const canonicalGeometry=new THREE.BufferGeometry();canonicalGeometry.setAttribute('position',new THREE.Float32BufferAttribute(canonicalPositions,3));canonicalGeometry.setAttribute('color',new THREE.Float32BufferAttribute(canonicalColors,3))
    const canonicalPoints=new THREE.Points(canonicalGeometry,new THREE.PointsMaterial({size:4.5,vertexColors:true,transparent:true,opacity:1,sizeAttenuation:true}));network.add(canonicalPoints)
    const shellMaterial = cortexMaterial(), shell = new THREE.Group()
    network.add(shell)
    const cortexRequest = new AbortController()
    let disposed = false
    void loadCortex(cortexRequest.signal).then(cortex => {
      if (disposed) { cortex.dispose(); return }
      shell.add(new THREE.Mesh(cortex, shellMaterial))
      render()
    }).catch(() => {
      // The documented network remains usable if its contextual shell cannot load.
      if (!disposed) container.dataset.surface = 'unavailable'
    })
    let highlight: THREE.LineSegments | null=null, marker:THREE.Mesh|null=null
    const signal=new THREE.Mesh(new THREE.SphereGeometry(3.5,12,8),new THREE.MeshBasicMaterial({color:'#ffe7a5',depthTest:false}));signal.visible=false;signal.renderOrder=5;network.add(signal)
    const routeNodes=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({size:7,color:'#fff0be',depthTest:false}));routeNodes.renderOrder=4;network.add(routeNodes)
    let journey: { path:string[]; route:THREE.CurvePath<THREE.Vector3>; elapsed:number } | null=null
    let cameraStatus=''
    const announce=(mode:CameraMode,node:string|null)=>{const key=`${mode}:${node}`;if(key!==cameraStatus){cameraStatus=key;cameraCallback.current(mode,node)}}
    const cancelJourney=(report=true)=>{journey=null;signal.visible=false;focusTarget=null;controls.enableDamping=true;if(report)announce('manual',null)}
    let running=false,time=0,last=0,focusTarget:THREE.Vector3|null=null,frames=0,slow=0
    const render = () => {controls.update();renderer.render(scene,camera)}
    const animate=(now:number)=>{
      const delta=last?Math.min((now-last)/1000,.05):0;last=now;time+=delta
      material.uniforms.uTime.value=time;network.rotation.y=-time*.045;network.position.y=Math.sin(time*.3)*3
      if(journey){
        journey.elapsed+=delta
        const progress=THREE.MathUtils.smoothstep(journey.elapsed, .8, 5)
        const point=journey.route.curves.length?journey.route.getPoint(progress):nodeMap.get(journey.path[0])!.position.clone()
        signal.position.copy(point);signal.visible=true
        network.updateWorldMatrix(true,false)
        const target=network.localToWorld(point.clone())
        const offset=new THREE.Vector3(65,80,170).applyAxisAngle(new THREE.Vector3(0,1,0),network.rotation.y)
        const ease=1-Math.exp(-delta*5)
        controls.target.lerp(target,ease);camera.position.lerp(target.clone().add(offset),ease)
        const lengths=journey.route.getCurveLengths(),travel=(lengths.at(-1)||0)*progress
        const index=progress===1?journey.path.length-1:Math.max(0,lengths.findIndex(length=>length>=travel))
        const node=journey.path[index]
        announce(progress===1?'framed':'following',node)
      }
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
      material.uniforms.uDensity.value=path.length ? .07 : id?.length ? .24 : 1
      canonicalPoints.material.opacity=path.length ? .18 : 1
      lines.material.opacity=path.length ? .01 : .095
      shellMaterial.uniforms.uVisibility.value=path.length ? .13 : id ? .4 : 1
      routeNodes.geometry.dispose();routeNodes.geometry=new THREE.BufferGeometry()
      routeNodes.geometry.setAttribute('position',new THREE.Float32BufferAttribute(path.flatMap(key=>nodeMap.get(key)?.position.toArray()||[]),3))
      if(id||filter!=='galaxy'||path.length){
        const p:number[]=[];linked.forEach(e=>{const points=curve(nodeMap.get(e.fromKey)!.position,nodeMap.get(e.toKey)!.position).getPoints(18);for(let i=0;i<points.length-1;i++)p.push(...points[i].toArray(),...points[i+1].toArray())})
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));highlight=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:'#b9fff0',transparent:true,opacity:1}));network.add(highlight)
      }
      if(id&&nodeMap.has(id)){
        const n=nodeMap.get(id)!;marker=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),new THREE.MeshBasicMaterial({color:colors[n.kind]}));marker.position.copy(n.position);network.add(marker)
        if(shouldFocus){cancelJourney(false);focusTarget=network.localToWorld(n.position.clone());if(!running){controls.target.copy(focusTarget);focusTarget=null}camera.position.copy(network.localToWorld(n.position.clone())).add(new THREE.Vector3(65,100,230));announce('framed',id)}
      }
      render()
    }
    const follow=(path:string[])=>{
      cancelJourney(false)
      const valid=path.filter(key=>nodeMap.has(key));if(!valid.length){announce('overview',null);return}
      const route=new THREE.CurvePath<THREE.Vector3>()
      for(let i=1;i<valid.length;i++)route.add(curve(nodeMap.get(valid[i-1])!.position,nodeMap.get(valid[i])!.position))
      if(running){journey={path:valid,route,elapsed:0};controls.enableDamping=false;announce('following',valid[0])}
      else{
        // Still-mode frames the whole route immediately, without a camera flight.
        const points=route.curves.length?route.getPoints(60):[nodeMap.get(valid[0])!.position]
        const box=new THREE.Box3().setFromPoints(points),center=network.localToWorld(box.getCenter(new THREE.Vector3()))
        const distance=THREE.MathUtils.clamp(box.getSize(new THREE.Vector3()).length()*1.4,270,1100)
        controls.target.copy(center);camera.position.copy(center).add(new THREE.Vector3(0,distance*.6,distance));announce('framed',valid[0])
        // A stage may be chosen while its canvas is below/above the viewport.
        // Queue the flight for visibility/resume; reduced motion stays framed.
        if(!reduced){journey={path:valid,route,elapsed:0};controls.enableDamping=false}
      }
      render()
    }
    const resetCamera=()=>{cancelJourney(false);camera.position.set(350,190,460);controls.target.set(0,0,0);announce('overview',null);render()}
    api.current={setActive:start,lock:(locked)=>{controls.enabled=!locked;renderer.domElement.style.cursor=locked?'default':'grab';renderer.domElement.setAttribute('aria-label',locked?'Camera locked to the selected connection. Return to wide view to inspect other components.':'Interactive brain-shaped software architecture. Drag to orbit; scroll to zoom. Use the component inspector for keyboard exploration.')},inspect,follow,reset:resetCamera,zoom:(direction)=>{cancelJourney();const distance=camera.position.clone().sub(controls.target).multiplyScalar(direction>0?.85:1.18);distance.clampLength(120,1300);camera.position.copy(controls.target).add(distance);render()}}
    controls.addEventListener('start',()=>{if(!interactionLock.current)cancelJourney()})
    controls.addEventListener('change',()=>{if(!running)renderer.render(scene,camera)})
    const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='low'?1:w<600?1.2:1.65));geometry.setDrawRange(w<600?Math.max(0,count-4200):0,Infinity);renderer.setSize(w,h);camera.aspect=w/h;camera.zoom=w<600?.72:1;camera.updateProjectionMatrix();render()}
    const observer=new ResizeObserver(resize);observer.observe(container);resize()
    const ray=new THREE.Raycaster();ray.params.Points.threshold=5;ray.params.Line.threshold=2.3
    let down=[0,0],dragging=false,lastHover='',lastMove=0
    const hitAt=(e:PointerEvent):GraphTarget|null=>{const b=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),camera);network.updateWorldMatrix(true,true);const node=ray.intersectObject(canonicalPoints)[0];if(node?.index!==undefined)return {node:galaxyNodes[node.index].key};const line=ray.intersectObject(lines)[0];if(line?.index!==undefined){const edge=galaxyEdges[Math.floor(line.index/16)];return {view:edge.view,edge:edge.index}}return null}
    const leave=()=>{lastHover='';hoverCallback.current(null);renderer.domElement.style.cursor=interactionLock.current?'default':'grab'}
    const pointerDown=(e:PointerEvent)=>{if(interactionLock.current)return;down=[e.clientX,e.clientY];dragging=true;leave()}
    const pointerUp=(e:PointerEvent)=>{dragging=false;if(interactionLock.current)return;if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const hit=hitAt(e);if(hit){pinCallback.current(hit);if('node' in hit)pickCallback.current(hit.node)}}
    const pointerMove=(e:PointerEvent)=>{if(interactionLock.current||dragging||e.pointerType==='touch'||performance.now()-lastMove<45)return;lastMove=performance.now();const hit=hitAt(e),key=JSON.stringify(hit);if(key!==lastHover){lastHover=key;hoverCallback.current(hit);renderer.domElement.style.cursor=hit?'pointer':'grab'}}
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerleave',leave)
    onReady(true)
    return()=>{disposed=true;cortexRequest.abort();shellMaterial.dispose();api.current=null;renderer.setAnimationLoop(null);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);renderer.domElement.removeEventListener('pointermove',pointerMove);renderer.domElement.removeEventListener('pointerleave',leave);scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.Points||o instanceof THREE.LineSegments||o instanceof THREE.Line){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose())}});renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}
  },[quality,reduced,onReady])
  useEffect(()=>{interactionLock.current=interactionLocked;api.current?.lock(interactionLocked)},[interactionLocked,quality,reduced])
  useEffect(()=>{api.current?.setActive(active)},[active,quality,reduced])
  useEffect(()=>{api.current?.inspect(selected,view,focus!==previousFocus.current&&focus>0,path);previousFocus.current=focus},[selected,view,focus,path,quality,reduced])
  useEffect(()=>{if(followRequest>0)api.current?.follow(followPath)},[followRequest,followPath,quality,reduced])
  useEffect(()=>{api.current?.reset()},[reset])
  useEffect(()=>{if(zoom!==previousZoom.current)api.current?.zoom(zoom-previousZoom.current);previousZoom.current=zoom},[zoom])
  return <div ref={host} className="galaxy-canvas-host" data-interaction={interactionLocked?'replay-locked':'explore'} data-motion={active&&!reduced?'running':'paused'} />
}
