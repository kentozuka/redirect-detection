export const loadingAnimation = (
  text = '',
  chars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'],
  delay = 100
) => {
  let x = 0

  return setInterval(() => {
    const opt = `\r${chars[x++]} ${text}`
    process.stdout.write(opt)
    x = x % chars.length
  }, delay)
}
