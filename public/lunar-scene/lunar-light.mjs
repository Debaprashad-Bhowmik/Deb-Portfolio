// Approximate Earth as a diffuse sphere. Return its irradiance relative to
// direct sunlight for the local apparent size and Sun–Earth–observer phase.
export function earthshine(cosineOfPhase, apparentRadius) {
  const cosine = Math.max(-1, Math.min(1, cosineOfPhase))
  const angle = Math.acos(cosine)
  const phase = (Math.sin(angle) + (Math.PI - angle) * cosine) / Math.PI
  return .4 * Math.sin(apparentRadius) ** 2 * phase
}
