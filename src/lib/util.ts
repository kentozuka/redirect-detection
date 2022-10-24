const truncateLength = 60
const web = ['http:', 'https:']

export const isValidUrl = (target: string): boolean => {
  try {
    const { protocol } = new URL(target)
    return web.includes(protocol)
  } catch {
    return false
  }
}

// strt https://stackoverflow.com/questions/9733288/how-to-programmatically-calculate-the-contrast-ratio-between-two-colors
const luminance = (r: number, g: number, b: number) => {
  var a = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

export const contrast = (rgb1: number[], rgb2: number[]) => {
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2])
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2])
  var brightest = Math.max(lum1, lum2)
  var darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}
// end

export const startTimer = () => process.hrtime()

export const endTimer = (timer: [number, number]) => {
  const hrend = process.hrtime(timer)
  const ns2ms = hrend[1] / 1000000
  const s2ms = hrend[0] * 1000
  const ms = ns2ms + s2ms
  return Math.floor(ms)
}

export const truncate = (x: string) =>
  x.length < truncateLength ? x : x.slice(0, truncateLength) + '...'
