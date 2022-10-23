const web = ['http:', 'https:']

export const isValidUrl = (target: string): boolean => {
  try {
    const { protocol } = new URL(target)
    return web.includes(protocol)
  } catch {
    return false
  }
}
