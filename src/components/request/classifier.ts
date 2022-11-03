import { PossibleTypes } from '@c-types/index'

export const isThreeHundres = (n: number) => /30\d/.test(String(n))

export const serverSideRedirect = (status: number): PossibleTypes => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return 'unknown'
}

export const clientSideRedirect = (body: string): PossibleTypes => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"', 'i')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (!body.includes(jsRefresh)) return 'unknown'

  if (body.includes('href')) return 'js-href'
  if (body.includes('assign')) return 'js-assign'
  if (body.includes('replace')) return 'js-replace'

  return 'unknown'
}
