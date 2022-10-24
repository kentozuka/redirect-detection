export const startTimer = () => process.hrtime()

export const endTimer = (timer: [number, number]) => {
  const hrend = process.hrtime(timer)
  const ns2ms = hrend[1] / 1000000
  const s2ms = hrend[0] * 1000
  const ms = ns2ms + s2ms
  return Math.floor(ms)
}
