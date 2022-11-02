import { isValidUrl } from '../lib/util'

export function breakdownURL(link: string): URL | null {
  if (!isValidUrl(link)) return null

  const url = new URL(link)
  return url
}
