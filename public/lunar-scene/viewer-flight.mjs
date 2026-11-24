import { radius } from './planner.mjs'

const clamp = value => Math.max(0, Math.min(1, value))
const smooth = value => { const t=clamp(value); return t*t*(3-2*t) }
const descent = (height, high, low) => smooth(Math.log(high/height)/Math.log(high/low))

// Keep the map-to-terrain handoff in the exact same screen-space scale as the
// first-person renderer. This is camera navigation, not a landing trajectory.
export const surfaceFocalLength = (width, height, zoom=1) => Math.min(width,height)*.83*zoom

// Rotate between map targets along the shorter longitude interval, including
// the date-line seam. Easing comes from the shared camera animation clock.
export function siteFlightCenter(progress, from, to) {
  const t = clamp(progress)
  const delta = ((to.lon - from.lon + 540) % 360) - 180
  return { lat: from.lat + (to.lat - from.lat) * t, lon: from.lon + delta * t }
}

export function surfaceFlightFrame(progress, {width,height,startRadius,eye}) {
  const t=clamp(progress)
  const focal=surfaceFocalLength(width,height,eye.zoom)
  const startHeight=radius*focal/startRadius
  const cameraHeight=Math.exp(Math.log(startHeight)*(1-t)+Math.log(eye.height)*t)
  // Close map starts need their own handoff interval rather than starting in
  // the middle of an already-visible dissolve.
  const handoffStart=Math.min(90_000,startHeight*.25)
  const handoffEnd=handoffStart*.28
  const clearHeight=Math.max(60,eye.height*4)
  const surfaceOpacity=descent(cameraHeight,handoffStart,handoffEnd)
  const lift=descent(cameraHeight,handoffEnd*.9,Math.max(40,eye.height*2))
  const detailReveal=descent(cameraHeight,Math.max(handoffEnd*.5,clearHeight*2),clearHeight)
  const heading=((eye.azimuth+540)%360)-180
  return {
    height:cameraHeight,
    mapRadius:radius*focal/cameraHeight,
    alignment:descent(cameraHeight,startHeight,startHeight*.3),
    surfaceOpacity,
    blur:16*descent(cameraHeight,handoffStart*2.5,handoffStart)*(1-detailReveal),
    detailReveal,
    elevation:-90+(eye.elevation+90)*lift,
    azimuth:heading*lift,
    zoom:eye.zoom,
  }
}
