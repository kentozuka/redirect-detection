import { BrowserContext, Response, Route } from 'playwright'

import { launchLightWeightPersistentContext } from '../lib/playwright'
import { PlayWrightContextOption, Redirect } from '../types'
import { waitForNoMeta } from '../components/wait-function'
import { isValidUrl } from '../lib/url'
import {
  calculateChain,
  extractDocFromResponse,
  parseDocsToRings
} from '../components/request-parser'

let browser: BrowserContext = null

const launchBrowser = async (options?: PlayWrightContextOption) => {
  browser = await launchLightWeightPersistentContext(options)
}

export const closeBrowser = async () => await browser.close()

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
    if (browser === null) await launchBrowser(options)

    const responseHolder: Response[] = []
    const page = await browser.newPage()
    page.on('response', (res) => responseHolder.push(res))
    await page.goto(target)
    await waitForNoMeta(page)
    const destination = page.url()

    const candidates = await Promise.all(
      responseHolder.map((res) => extractDocFromResponse(res))
    )
    const docs = candidates.filter((cand) => cand !== null)
    const rings = parseDocsToRings(docs)
    const redirects = calculateChain(target, rings, destination)

    page.close()

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
