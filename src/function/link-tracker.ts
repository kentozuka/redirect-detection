import { Response } from 'playwright'

import { PlayWrightContextOption, Redirect } from '../types'
import { getPersistentContext } from '../lib/playwright'
import { isValidUrl } from '../lib/url'

import {
  onlyAllowsFirstRequest,
  waitForNoMeta
} from '../components/wait-function'
import {
  calculateChain,
  extractDocFromResponse,
  parseDocsToRings
} from '../components/request-parser'

/* = = = = = = = = = = = = = = = = = = = = = MAIN = = = = = = = = = = = = = = = = = = = = =*/
export async function checkRedirects(
  target: string,
  options?: PlayWrightContextOption
): Promise<{
  start: string
  redirects: Redirect[]
  destination: string
} | null> {
  if (!isValidUrl(target)) return null

  try {
    const browser = await getPersistentContext(options)
    const responseHolder: Response[] = []

    const page = await browser.newPage()
    page.on('response', (res) => responseHolder.push(res))
    await onlyAllowsFirstRequest(page)

    await page.goto(target)
    await waitForNoMeta(page)

    const destination = page.url()
    const candidates = await Promise.all(
      responseHolder.map((res) => extractDocFromResponse(res))
    )
    const docs = candidates.filter((cand) => cand !== null)
    const rings = parseDocsToRings(docs)
    const redirects = calculateChain(target, rings, destination)

    await page.close()

    return {
      start: target,
      destination,
      redirects
    }
  } catch (e) {
    console.log(e)
    return null
  }
}
