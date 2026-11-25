import { observer } from './planner.mjs'
import { earthOrientation, rotateBodyVector } from './body-textures.mjs'

import { globeOrientation } from './globe.mjs'
import { createOrbitalBodies } from './orbital-bodies.mjs?v=physical-orbit-1'
import { physicalBodies, orbitUnitKm, projectBody, nearestBody, lunarMapSystem } from './orbital-geometry.mjs'

const stride = 10
const magnitude = vector => Math.hypot(...vector)
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0)
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const scale = (vector, factor) => vector.map(value => value * factor)
const unit = vector => scale(vector, 1 / magnitude(vector))
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
export const spaceStep = 3600
const hourMs = spaceStep * 1000

export function calendarSpaceWindow(year) {
  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)
  return {
    start,
    end,
    last: end - hourMs / 4,
    hours: (end - start) / hourMs - .25,
    months: Array.from({ length: 12 }, (_, month) => (Date.UTC(year, month, 1) - start) / hourMs),
  }
}

export function readSpaceSamples(buffer, start, end) {
  const count = (end - start) / (spaceStep * 1000) + 1
  if (buffer.byteLength !== count * stride * Float32Array.BYTES_PER_ELEMENT) {
    throw new Error('The 3D ephemeris is incomplete.')
  }
  return new Float32Array(buffer)
}

export function systemAt(samples, index) {
  const last = samples.length / stride - 1
  if (!Number.isInteger(last) || !Number.isFinite(index) || index < 0 || index > last) {
    throw new RangeError('Time is outside the 3D ephemeris.')
  }
  const first = Math.floor(index)
  const second = Math.min(first + 1, last)
  const fraction = index - first
  const a = samples.subarray(first * stride, (first + 1) * stride)
  const b = samples.subarray(second * stride, (second + 1) * stride)
  const mix = (value, i) => value + (b[i] - value) * fraction
  const sign = dot(a.subarray(6), b.subarray(6)) < 0 ? -1 : 1
  const rotation = Array.from(a.subarray(6), (value, i) => value + (sign * b[i + 6] - value) * fraction)
  return {
    moon: Array.from(a.subarray(0, 3), mix),
    sun: Array.from(a.subarray(3, 6), (value, i) => mix(value, i + 3)),
    rotation: unit(rotation),
  }
}

export function siteDirection(site, state) {
  const normal = observer(site.lat, site.lon, 0).up
  return rotateBodyVector(normal, state.rotation)
}

const distanceLabel = new Intl.NumberFormat('en', { maximumFractionDigits: 0 })
export function visibleDiscFraction(body, others) {
  const distance = magnitude(body.slice(0,3))
  const direction = unit(body.slice(0,3))
  const radius = Math.asin(clamp(body[3]/distance,0,1))
  let visible = 1
  for (const other of others) {
    const separation = magnitude(other.slice(0,3))
    if (separation >= distance) continue
    const axis = unit(other.slice(0,3))
    const angle = Math.atan2(magnitude(cross(direction,axis)),dot(direction,axis))
    const blocker = Math.asin(clamp(other[3]/separation,0,1))
    const inner = Math.abs(blocker - radius)
    const outer = blocker + radius
    // A disc dims through partial occultation. A smaller foreground body
    // can only cover its own share of the target's apparent area.
    const clearance = clamp((angle - inner) / (outer - inner), 0, 1)
    const covered = (1 - clearance ** 2 * (3 - 2 * clearance)) * Math.min(1, (blocker / radius) ** 2)
    visible = Math.min(visible, 1 - covered)
  }
  return visible
}

export function createSpaceView(canvas, samples, controls) {
  const bodies = createOrbitalBodies(canvas)
  const labels = controls.labels
  const ctx = labels.getContext('2d')
  const paths = new Map()
  let current, drag, approachRadius, approachSite, moonCamera, mapCamera, missionFrames
  let latitude = 18, longitude = -70, scene = 'earth', focus = controls.focus?.value??'', zoom = 1, approach = 0

  function trail(index, kind) {
    const last = samples.length / stride - 1
    const lunar = kind === 'moon'
    const period = Math.min(last, lunar ? 656 : 8766)
    const start = clamp(Math.floor(index / 24)*24-Math.floor(period/2),0,last-period)
    const cached = paths.get(kind)
    if(cached?.start === start) return cached.points
    const segments = lunar ? 180 : 260
    const points = Array.from({length:segments+1},(_,i)=>{
      const offset = Math.round(start+i*period/segments)*stride+(lunar?0:3)
      return scale(Array.from(samples.subarray(offset,offset+3)),1/orbitUnitKm)
    })
    paths.set(kind,{start,points})
    return points
  }

  function draw() {
    if(!current || canvas.closest('.viewer-layer')?.inert && !mapCamera) return
    const width=canvas.clientWidth, height=canvas.clientHeight
    if(!width || !height) return
    const dpi=Math.min(2,devicePixelRatio||1)
    if(labels.width!==Math.round(width*dpi) || labels.height!==Math.round(height*dpi)) {
      labels.width=Math.round(width*dpi); labels.height=Math.round(height*dpi)
    }
    ctx.setTransform(dpi,0,0,dpi,0,0)
    ctx.clearRect(0,0,width,height)
    const {state,index,epoch,site}=current
    const world=physicalBodies(state)
    const delta=approachSite?((approachSite.lon-longitude+540)%360)-180:0
    const orientation=mapCamera?.orientation??globeOrientation(latitude+((approachSite?.lat??latitude)-latitude)*approach,longitude+delta*approach)
    const camera=[orientation.east,orientation.north,orientation.front].map(axis=>rotateBodyVector(axis,state.rotation))
    const [right,up,toward]=camera
    const axes=[right,up,scale(toward,-1)]
    const lens=Math.min(width,height)*.95
    const originalTarget=focus ? world[focus].slice(0,3) : scene==='sun' ? world.sun.slice(0,3) : scale(world.moon.slice(0,3),.5)
    const originalDistance=focus ? world[focus][3]*4 : scene==='sun' ? magnitude(world.sun.slice(0,3))*2.6 : magnitude(world.moon.slice(0,3))*1.7
    const minimum=focus ? world[focus][3]*1.08 : scene==='sun' ? world.sun[3]*1.08 : world.earth[3]+magnitude(world.moon.slice(0,3))*.51
    const startDistance=Math.max(minimum,originalDistance/zoom)
    const finalRadius=approachRadius??Math.min(width,height)*.46
    const endDistance=world.moon[3]*Math.sqrt(1+(lens/finalRadius)**2)
    const distance=startDistance*Math.exp(Math.log(endDistance/startDistance)*approach)
    // Recenter in proportion to camera distance. Linear travel from the Sun
    // would leave the Moon off screen until the final few frames.
    const centerRatio=Math.abs(startDistance-endDistance)>1e-12 ?
      clamp((distance-endDistance)/(startDistance-endDistance),0,1) : 1-approach
    const target=originalTarget.map((v,i)=>world.moon[i]+(v-world.moon[i])*centerRatio)
    const mapSystem=mapCamera?lunarMapSystem(state,orientation,mapCamera.radius,lens):null
    const eye=mapSystem?.eye??target.map((v,i)=>v+toward[i]*distance)
    const transform=mapSystem?.transform??(point=>axes.map(axis=>dot(point.map((v,i)=>v-eye[i]),axis)))
    const view=Object.fromEntries(Object.entries(world).map(([name,body])=>[name,[...transform(body.slice(0,3)),body[3]]]))
    const projected=Object.fromEntries(Object.entries(view).map(([name,body])=>[name,projectBody(body,lens,width,height)]))
    const visible=Object.fromEntries(Object.entries(view).map(([name,body])=>[name,visibleDiscFraction(body,Object.entries(view).filter(([other])=>other!==name).map(([,value])=>value))]))
    const hidden=Object.fromEntries(Object.entries(visible).map(([name,fraction])=>[name,fraction===0]))
    function project(point) {
      const p=transform(point)
      return p[2]>0 ? [width/2+lens*p[0]/p[2],height/2-lens*p[1]/p[2]] : null
    }
    function line(points,color,dash=[]) {
      ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.globalAlpha=mapCamera?1:1-approach
      let previous=false
      for(const point of points) {
        const p=project(point)
        if(!p) { previous=false; continue }
        if(previous) ctx.lineTo(...p);else ctx.moveTo(...p)
        previous=true
      }
      ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1
    }
    if(!mapCamera && controls.yearPath.checked) line(trail(index,'sun').map(point=>scene==='sun'?world.sun.slice(0,3).map((v,i)=>v-point[i]):point),'#665944')
    if(!mapCamera && controls.moonPath.checked) line(trail(index,'moon'),'#515265')
    if(!mapCamera && controls.links.checked) {
      line([world.earth.slice(0,3),world.sun.slice(0,3)],'#685335',[3,7])
      line([world.earth.slice(0,3),world.moon.slice(0,3)],'#53647e',[3,7])
    }
    if (missionFrames) {
      // Keep each historical position relative to the Moon, then place the
      // track in the current camera's frame. Both views share the same paths.
      for (const [index, color] of ['#ffc975', '#acc4ff'].entries()) {
        const points = missionFrames.map(frame => rotateBodyVector(frame[index], state.rotation)
          .map((value, axis) => world.moon[axis] + value / (1000 * orbitUnitKm)))
        line(points, color, [5, 4])
      }
    }
    bodies.draw({...view,lens,sunGlow:visible.sun,
      light:axes.map(axis=>dot(unit(state.sun),axis)),basis:axes.map(earthOrientation(epoch))})
    if (controls.starSky) {
      const phase = (1 + dot(toward, unit(state.sun))) / 2
      const moonInFrame = projected.moon.inFront && !hidden.moon &&
        Math.abs(projected.moon.center[0] - width / 2) < width / 2 + projected.moon.radius &&
        Math.abs(projected.moon.center[1] - height / 2) < height / 2 + projected.moon.radius
      const foreground = moonInFrame ? Math.sqrt(clamp(phase, 0, 1)) * Math.min(1, 2 * projected.moon.radius / height) : 0
      controls.starSky({
        axes, lens,
        exposure: .55 - .20 * foreground,
        sun: unit(view.sun.slice(0, 3)),
        sunVisibility: visible.sun,
      })
    }
    const lunar=projected.moon
    moonCamera={moving:approach>0&&approach<1,radius:lunar.radius,center:lunar.center,orientation,
      perspective:{...view,lens,mapBlend:approach*approach*approach}}
    // The map owns its camera and picking projection; feeding this back would
    // replace its interactive map with a flight and recursively redraw both.
    if(!mapCamera) controls.moonCamera(moonCamera,state)
    // Trace annotations are separate from the actual ray-tested body pixels.
    ctx.globalCompositeOperation='destination-out'
    for(const item of Object.values(projected)) if(item.inFront) {
      ctx.beginPath();ctx.arc(...item.center,item.radius+1,0,Math.PI*2);ctx.fill()
    }
    ctx.globalCompositeOperation='source-over'
    ctx.globalAlpha=mapCamera?1:1-approach
    ctx.font='600 13px DM Sans, sans-serif';ctx.textAlign='center'
    const unresolvedPair=projected.earth.radius<4 && projected.moon.radius<4 &&
      Math.hypot(...projected.earth.center.map((v,i)=>v-projected.moon.center[i]))<35
    const placedLabels=[]
    const mapNotes=[]
    for(const [name,color] of [['earth','#b6cdff'],['sun','#ffd18a'],['moon','#eae9f0']]) {
      if(mapCamera && name==='moon') continue
      if(name==='moon' && unresolvedPair && !hidden.earth) continue
      const {center:[x,y],radius,inFront}=projected[name]
      const outside=!inFront || x+radius<0 || x-radius>width || y+radius<0 || y-radius>height
      if(mapCamera) {
        const blocker=hidden[name]?nearestBody(view[name].slice(0,3),view):null
        const state=blocker?'hidden by '+blocker[0].toUpperCase()+blocker.slice(1):!inFront?'behind camera':outside?'off screen':'in view'
        mapNotes.push(`${name[0].toUpperCase()+name.slice(1)} ${distanceLabel.format(projected[name].distance*orbitUnitKm)} km · ${state}`)
      }
      if(hidden[name]) continue
      const arrow=!inFront?'↶ ':x<0?'← ':x>width?'→ ':y<0?'↑ ':y>height?'↓ ':''
      const title=name==='earth'&&unresolvedPair&&!hidden.moon?'Earth + Moon':name[0].toUpperCase()+name.slice(1)
      ctx.fillStyle=color
      const labelX=clamp(x,85,width-85),initialY=clamp(y+radius+20,24,height-16)
      const labelY=[0,22,-22,44,-44].map(offset=>initialY+offset).find(candidate=>
        candidate>=18 && candidate<=height-14 && !placedLabels.some(([px,py])=>Math.abs(px-labelX)<150 && Math.abs(py-candidate)<20))??initialY
      placedLabels.push([labelX,labelY])
      const text=(outside?arrow:'')+title+(outside?(!inFront?' · behind camera':' · off screen'):'')
      if(mapCamera) {
        const labelWidth=ctx.measureText(text).width
        ctx.fillStyle='#07090de8';ctx.fillRect(labelX-labelWidth/2-5,labelY-15,labelWidth+10,21)
        ctx.fillStyle=color
      }
      ctx.fillText(text,labelX,labelY)
    }
    if(!mapCamera && !hidden.moon && lunar.inFront && lunar.radius>4) {
      const direction=siteDirection(site,state)
      const worldPoint=world.moon.slice(0,3).map((v,i)=>v+direction[i]*world.moon[3])
      if(dot(direction,eye.map((v,i)=>v-worldPoint[i]))>0) {
        const point=project(worldPoint)
        if(point && nearestBody(transform(worldPoint),view)==='moon') {ctx.beginPath();ctx.arc(...point,3,0,Math.PI*2);ctx.fillStyle='#8edcce';ctx.fill()}
      }
    }
    ctx.globalAlpha=1
    if(mapCamera && controls.mapNote) controls.mapNote.textContent='From the map camera: '+mapNotes.join(' · ')
    if(mapCamera) controls.mapBodies?.(mapNotes)
    if(!mapCamera && controls.note) controls.note.textContent=Object.entries(hidden).filter(([,value])=>value).map(([name])=>name[0].toUpperCase()+name.slice(1)+' is hidden behind a nearer body.').join(' ')
  }

  function turn(north,east) {latitude=clamp(latitude+north,-89.8,89.8);longitude=(longitude+east)%360;draw()}
  canvas.addEventListener('pointerdown',event=>{canvas.setPointerCapture(event.pointerId);drag={x:event.clientX,y:event.clientY}})
  canvas.addEventListener('pointermove',event=>{
    if(!drag)return
    turn((event.clientY-drag.y)*.22,(drag.x-event.clientX)*.22);drag={x:event.clientX,y:event.clientY}
  })
  canvas.addEventListener('lostpointercapture',()=>{drag=null})
  canvas.addEventListener('wheel', event => {
    if (!event.ctrlKey) return
    event.preventDefault()
    zoom = clamp(zoom * Math.exp(-event.deltaY * .0015), .1, 20)
    draw()
  }, { passive: false })
  controls.left.addEventListener('click',()=>turn(0,-15))
  controls.right.addEventListener('click',()=>turn(0,15))
  controls.up.addEventListener('click',()=>turn(12,0))
  controls.down.addEventListener('click',()=>turn(-12,0))
  controls.reset.addEventListener('click',()=>{latitude=18;longitude=-70;zoom=1;draw()})
  controls.focus?.addEventListener('change',event=>{focus=event.target.value;zoom=1;draw()})
  controls.zoomIn?.addEventListener('click',()=>{zoom=clamp(zoom*1.4,.1,20);draw()})
  controls.zoomOut?.addEventListener('click',()=>{zoom=clamp(zoom/1.4,.1,20);draw()})
  for(const control of [controls.yearPath,controls.moonPath,controls.links]) control.addEventListener('change',draw)
  for(const button of [controls.earthView,controls.sunView]) button.addEventListener('click',()=>{
    scene=button.value;focus='';zoom=1
    if(scene==='sun' && current) {
      const pole=rotateBodyVector([0,0,1],current.state.rotation,true)
      latitude=Math.asin(clamp(pole[2],-1,1))*180/Math.PI
      longitude=Math.atan2(pole[1],pole[0])*180/Math.PI
      controls.yearPath.checked=true
    }
    if(controls.focus) controls.focus.value=''
    controls.earthView.setAttribute('aria-pressed',String(scene==='earth'))
    controls.sunView.setAttribute('aria-pressed',String(scene==='sun'))
    controls.yearLabel.textContent=scene==='earth'?'Sun’s annual path':'Earth’s orbit'
    draw()
  })
  new ResizeObserver(draw).observe(canvas)
  function update(index,site,yearRange=null,epoch=0,visible=true) {
    const state=systemAt(samples,index)
    current={state,index,site,epoch,yearRange}
    if(visible || mapCamera) draw()
    return {lunarKm:distanceLabel.format(magnitude(state.moon)),solarKm:distanceLabel.format(magnitude(state.sun))}
  }
  update.approach=(amount,target,radius)=>{approach=amount;approachSite=target;approachRadius=radius;draw()}
  update.mapView=camera=>{mapCamera=camera;if(camera) draw()}
  update.setMissionPaths=frames=>{missionFrames=frames}
  update.camera=()=>moonCamera
  update.viewCenter=()=>({lat:latitude,lon:longitude})
  update.centerOnLunarView=site=>{latitude=site.lat;longitude=site.lon;draw()}
  update.lunarRotation=index=>current?.index===index?current.state.rotation:systemAt(samples,index).rotation
  update.ready=bodies.ready
  return update
}
