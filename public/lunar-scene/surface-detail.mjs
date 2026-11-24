import { radius } from './planner.mjs'

export const surfaceDetailStride = 9
const turn = 2 * Math.PI
const detailBands = [
  // Guard bands exceed the 12 m tile's diagonal camera offset. Geometry is
  // already present before the shared shader's 34/90 m fades reveal it.
  { spacing: 1.25, reach: 46, coverage: .29, salt: 1, type: 'stone' },
  { spacing: 8, reach: 104, coverage: .29, salt: 3, type: 'boulder' },
]

function noise(row, column, salt) {
  let bits = Math.imul(row, 0x9e3779b1) ^ Math.imul(column, 0x85ebca77) ^ Math.imul(salt, 0xc2b2ae35)
  bits = Math.imul(bits ^ bits >>> 16, 0x7feb352d)
  bits = Math.imul(bits ^ bits >>> 15, 0x846ca68b)
  return ((bits ^ bits >>> 16) >>> 0) / 4294967296
}

function localOffset(frame, lat, lon) {
  const cosLat = Math.cos(lat)
  const point = [cosLat * Math.cos(lon), cosLat * Math.sin(lon), Math.sin(lat)]
  return [frame.east, frame.north].map(axis => radius * point.reduce((value, part, i) => value + part * axis[i], 0))
}

function normal(x, y, z) {
  const length = Math.hypot(x, y, z)
  return [x / length, y / length, z / length]
}

// A shared, closed icosphere topology. All randomness describes a coherent
// solid instead of pulling neighboring rings in unrelated directions.
function sphereMesh(subdivisions) {
  const t = (1 + Math.sqrt(5)) / 2
  const points = [[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],
    [0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p => normal(...p))
  let triangles = [[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],
    [11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
    [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]]
  for(let level=0;level<subdivisions;level++) {
    const edges=new Map()
    function midpoint(a,b) {
      const key=Math.min(a,b)+':'+Math.max(a,b)
      if(!edges.has(key)) {
        edges.set(key,points.length)
        points.push(normal(...points[a].map((v,i)=>v+points[b][i])))
      }
      return edges.get(key)
    }
    triangles=triangles.flatMap(([a,b,c])=>{
      const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a)
      return [[a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca]]
    })
  }
  return {points,triangles}
}
const stoneMesh=sphereMesh(1)
const boulderMesh=sphereMesh(2)

function rock(buffer, east, north, floor, slopes, kind, random, heightAt) {
  const boulder=kind==='boulder'
  const height=boulder ? .20+1.12*random(4)**2.5 : .065+.22*random(4)**2.8
  const width=height*(.82+random(5)*.85)
  const squash=.55+random(6)*.44
  const rotation=random(7)*turn
  const cos=Math.cos(rotation),sin=Math.sin(rotation)
  const tone=.64+random(8)*.40
  const topology=boulder?boulderMesh:stoneMesh
  const planes=Array.from({length:10},(_,i)=>{
    const y=2*random(11+i*3)-1
    const angle=random(12+i*3)*turn
    const r=Math.sqrt(1-y*y)
    return [r*Math.cos(angle),y,r*Math.sin(angle),.67+.24*random(13+i*3)]
  })
  const phase=random(46)*turn
  const points=topology.points.map(direction=>{
    let size=1
    for(const [x,y,z,depth] of planes) {
      const alignment=x*direction[0]+y*direction[1]+z*direction[2]
      if(alignment>0) size=Math.min(size,depth/alignment)
    }
    // Low-frequency weathering and an off-center crest, never independent spikes.
    const [x,y,z]=direction
    size*=1+.035*Math.sin(x*7+phase)*Math.sin(y*6-phase)*Math.cos(z*8+phase)
    const localX=x*size*width+y*height*(random(47)-.5)*.24
    const localZ=z*size*width*squash
    const dx=localX*cos-localZ*sin,dz=localX*sin+localZ*cos
    const support=heightAt(east+dx,north+dz)??floor+slopes[0]*dx+slopes[1]*dz
    return [east+dx,support+height*(y*size*.78+.25),north+dz,support]
  })
  const normals=points.map(()=>[0,0,0])
  for(const [a,b,c] of topology.triangles) {
    const u=points[b].map((v,i)=>v-points[a][i]),v=points[c].map((v,i)=>v-points[a][i])
    const area=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
    for(const index of [a,b,c]) for(let axis=0;axis<3;axis++) normals[index][axis]+=area[axis]
  }
  const vertices=points.map((point,i)=>[...point.slice(0,3),...normal(...normals[i]),tone,boulder?90:34,point[3]])
  for(const triangle of topology.triangles) for(const i of triangle) buffer.push(...vertices[i])
}

function volumeNoise(x,y,z) {
  const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z)
  const ease=t=>t*t*(3-2*t)
  const fx=ease(x-ix),fy=ease(y-iy),fz=ease(z-iz)
  const mix=(a,b,t)=>a+(b-a)*t
  const plane=dz=>mix(mix(noise(ix,iy,iz+dz),noise(ix+1,iy,iz+dz),fx),
    mix(noise(ix,iy+1,iz+dz),noise(ix+1,iy+1,iz+dz),fx),fy)
  return mix(plane(0),plane(1),fz)
}

// Centimeter-scale illustrative regolith. The measured DEM is never edited.
function soilLift(frame,east,north) {
  const p=frame.up.map((v,i)=>v*radius+frame.east[i]*east+frame.north[i]*north)
  const sample=scale=>volumeNoise(...p.map(v=>v*scale))
  return .018+.11*sample(.54)**2+.045*sample(1.8)**2+.012*sample(4.6)
}

function soilSurface(buffer,frame,centerEast,centerNorth,heightAt) {
  const step=.5,reach=36
  const firstX=Math.floor((centerEast-reach)/step),firstZ=Math.floor((centerNorth-reach)/step)
  const lastX=Math.ceil((centerEast+reach)/step),lastZ=Math.ceil((centerNorth+reach)/step)
  const heights=new Map()
  const key=(x,z)=>x+':'+z
  for(let z=firstZ-1;z<=lastZ+1;z++) for(let x=firstX-1;x<=lastX+1;x++) {
    const east=x*step,north=z*step
    const base=heightAt(east,north)
    if(base===null) continue
    const distance=Math.hypot(east-centerEast,north-centerNorth)
    const t=Math.min(1,Math.max(0,(distance-27)/(reach-27)))
    const fade=1-t*t*(3-2*t)
    heights.set(key(x,z),base+soilLift(frame,east,north)*fade-.003)
  }
  const vertex=(x,z)=>{
    const height=heights.get(key(x,z))
    if(height===undefined)return null
    const dx=((heights.get(key(x+1,z))??height)-(heights.get(key(x-1,z))??height))/(2*step)
    const dz=((heights.get(key(x,z+1))??height)-(heights.get(key(x,z-1))??height))/(2*step)
    return [x*step,height,z*step,...normal(-dx,1,-dz),0,0,0]
  }
  for(let z=firstZ;z<lastZ;z++) for(let x=firstX;x<lastX;x++) {
    if(Math.hypot((x+.5)*step-centerEast,(z+.5)*step-centerNorth)>reach)continue
    const a=vertex(x,z),b=vertex(x+1,z),c=vertex(x,z+1),d=vertex(x+1,z+1)
    if(!a||!b||!c||!d)continue
    buffer.push(...a,...c,...b,...b,...c,...d)
  }
}

export function buildSurfaceDetail(frame, centerEast, centerNorth, heightAt) {
  const center = frame.up.map((value, i) => value * radius + frame.east[i] * centerEast + frame.north[i] * centerNorth)
  const latitude = Math.atan2(center[2], Math.hypot(center[0], center[1]))
  const longitude = Math.atan2(center[1], center[0])
  const buffer = []
  // The latitude-band cells belong to the Moon, so rocks keep their placement
  // across camera moves and seeded tiles also work at the poles and longitude seam.
  for (const { spacing, reach, coverage, salt, type } of detailBands) {
    const bands = Math.ceil(Math.PI * radius / spacing)
    const step = Math.PI / bands
    const arc = (reach + 2 * spacing) / radius
    const first = Math.max(0, Math.floor((latitude - arc + Math.PI / 2) / step))
    const last = Math.min(bands - 1, Math.floor((latitude + arc + Math.PI / 2) / step))
    for (let row = first; row <= last; row++) {
      const bandCenter = -Math.PI / 2 + (row + .5) * step
      const columns = Math.max(1, Math.round(turn * radius * Math.cos(bandCenter) / spacing))
      const denominator = Math.cos(latitude) * Math.cos(bandCenter)
      const boundary = (Math.cos(arc) - Math.sin(latitude) * Math.sin(bandCenter)) / denominator
      const halfSpan = Math.acos(Math.max(-1, Math.min(1, boundary)))
      const width = turn / columns
      const from = Math.floor((longitude - halfSpan) / width) - 1
      const through = Math.min(from + columns - 1, Math.floor((longitude + halfSpan) / width) + 1)
      for (let candidate = from; candidate <= through; candidate++) {
        const column = (candidate % columns + columns) % columns
        const random = index => noise(row, column, salt * 80 + index)
        const threshold = random(0)
        if (threshold > coverage + .30) continue
        const lat = bandCenter + (random(1) - .5) * step * .86
        const lon = (column + .08 + random(2) * .84) * width
        const [east, north] = localOffset(frame, lat, lon)
        if (Math.hypot(east - centerEast, north - centerNorth) > reach) continue
        const floor = heightAt(east, north)
        if (floor === null) continue
        const e = heightAt(east + 1, north) ?? floor
        const w = heightAt(east - 1, north) ?? floor
        const n = heightAt(east, north + 1) ?? floor
        const s = heightAt(east, north - 1) ?? floor
        const slopes = [(e - w) * .5, (n - s) * .5]
        const relief = Math.max(Math.abs(e + w - 2 * floor), Math.abs(n + s - 2 * floor))
        const terrainBias = Math.min(.30, Math.hypot(...slopes) * .30 + relief * .6)
        if (threshold > coverage + terrainBias) continue
        rock(buffer, east, north, floor, slopes, type, random, heightAt)
      }
    }
  }
  soilSurface(buffer,frame,centerEast,centerNorth,heightAt)
  return new Float32Array(buffer)
}
