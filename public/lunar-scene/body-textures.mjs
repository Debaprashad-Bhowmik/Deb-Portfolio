const tau = 2 * Math.PI
const day = 86_400_000
const obliquity = 23.4392911 * Math.PI / 180
const sinObliquity = Math.sin(obliquity)
const cosObliquity = Math.cos(obliquity)
const cross = ([ax, ay, az], [bx, by, bz]) => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]

export function rotateBodyVector(vector, [scalar, x, y, z], inverse = false) {
  const axis = inverse ? [-x, -y, -z] : [x, y, z]
  const t = cross(axis, vector).map(value => 2 * value)
  const term = cross(axis, t)
  return vector.map((value, i) => value + scalar * t[i] + term[i])
}

export function earthOrientation(epoch) {
  // Greenwich mean sidereal angle. UTC approximates UT1 and the equator is fixed at J2000.
  const days = (epoch - Date.UTC(2000, 0, 1, 12)) / day
  const centuries = days / 36525
  const degrees = 280.46061837 + 360.98564736629 * days + .000387933 * centuries ** 2 - centuries ** 3 / 38710000
  const angle = (degrees % 360) * Math.PI / 180
  const cosAngle = Math.cos(angle)
  const sinAngle = Math.sin(angle)
  return ([x, y, z]) => {
    const yEquator = y * cosObliquity - z * sinObliquity
    return [cosAngle * x + sinAngle * yEquator, -sinAngle * x + cosAngle * yEquator, y * sinObliquity + z * cosObliquity]
  }
}

const requests = new Map()

export function loadBodyTexture(path) {
  if (requests.has(path)) return requests.get(path)
  const request = new Promise(resolve => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const context = canvas.getContext('2d')
      if (!context) return resolve(null)
      context.drawImage(image, 0, 0)
      resolve(context.getImageData(0, 0, canvas.width, canvas.height))
    }
    image.onerror = () => resolve(null)
    image.src = new URL(path, import.meta.url).href
  })
  requests.set(path, request)
  return request
}

export function textureOffset(texture, x, y, z) {
  const u = Math.atan2(y, x) / tau + .5
  const v = .5 - Math.asin(Math.max(-1, Math.min(1, z))) / Math.PI
  const column = Math.floor(u * texture.width) % texture.width
  const row = Math.min(texture.height - 1, Math.floor(v * texture.height))
  return 4 * (row * texture.width + column)
}
