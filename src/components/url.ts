import { isValidUrl } from '@lib/util'

export function breakdownURL(link: string): URL | null {
  if (!isValidUrl(link)) return null

  const url = new URL(link)
  return url
}

export const sameOrigin = (start: string, destination: string) => {
  const s = breakdownURL(start)
  const d = breakdownURL(destination)

  return s.origin === d.origin
}
