import { radius, earthRadius, sunRadius } from './planner.mjs'
import { rotateBodyVector } from './body-textures.mjs'

// One unit for every coordinate and radius. Ephemeris input is in kilometres.
export const orbitUnitKm = 384400
export function physicalBodies(state) {
  return {
    earth: [0, 0, 0, earthRadius / 1000 / orbitUnitKm],
    moon: [...state.moon.map(v => v / orbitUnitKm), radius / 1000 / orbitUnitKm],
    sun: [...state.sun.map(v => v / orbitUnitKm), sunRadius / 1000 / orbitUnitKm],
  }
}

// Fit the perspective Moon silhouette to the interactive map's circle. All
// external bodies retain their physical radii and mutual separations.
export function lunarMapSystem(state, orientation, mapRadius, lens) {
  const world=physicalBodies(state)
  const toward=rotateBodyVector(orientation.front,state.rotation)
  const axes=[rotateBodyVector(orientation.east,state.rotation),
    rotateBodyVector(orientation.north,state.rotation),toward.map(value=>-value)]
  const distance=world.moon[3]*Math.sqrt(1+(lens/mapRadius)**2)
  const eye=world.moon.slice(0,3).map((value,i)=>value+toward[i]*distance)
  const transform=point=>axes.map(axis=>axis.reduce((sum,value,i)=>sum+value*(point[i]-eye[i]),0))
  const view=Object.fromEntries(Object.entries(world).map(([name,body])=>[name,[...transform(body.slice(0,3)),body[3]]]))
  return {world,axes,eye,view,distance,transform}
}

export function raySphere(direction, body) {
  const length = Math.hypot(...direction)
  const ray = direction.map(v => v / length)
  const [x,y,z,r] = body
  const along = x*ray[0] + y*ray[1] + z*ray[2]
  // The cross product avoids subtracting two enormous squared distances.
  const perpendicular = [y*ray[2]-z*ray[1], z*ray[0]-x*ray[2], x*ray[1]-y*ray[0]]
  const discriminant = r*r - perpendicular.reduce((sum,v) => sum+v*v, 0)
  if (discriminant < 0 || along <= 0) return Infinity
  const front = along - Math.sqrt(discriminant)
  return front > 0 ? front : Infinity
}

export function nearestBody(ray, bodies) {
  let nearest = Infinity, result = null
  for (const [name, body] of Object.entries(bodies)) {
    const distance = raySphere(ray, body)
    if (distance < nearest) { nearest = distance; result = name }
  }
  return result
}

export function projectBody([x,y,z,r], lens, width, height) {
  const distance = Math.hypot(x,y,z)
  const inFront = z > r
  const center = inFront ? [width/2+lens*x/z, height/2-lens*y/z] :
    [width/2 + (x < 0 ? -1 : 1)*width, height/2-lens*y/Math.max(1e-9,Math.abs(z))]
  // Angular radius, used for labels only. The GPU intersects the actual sphere.
  const radius = lens*r / Math.sqrt(Math.max(1e-12,distance*distance-r*r))
  return { center, radius, inFront, distance }
}

// Shared by the orbital bodies and the Moon: the closest positive hit wins.
export const sphereIntersectionGLSL = `
float hitSphere(vec3 ray, vec4 body) {
  float along = dot(body.xyz, ray);
  vec3 perpendicular = cross(body.xyz, ray);
  float discriminant = body.w*body.w-dot(perpendicular,perpendicular);
  if(discriminant<0.0 || along<=0.0) return 1.0e20;
  float hit = along-sqrt(discriminant);
  return hit>0.0 ? hit : 1.0e20;
}`
