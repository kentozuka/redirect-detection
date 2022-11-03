import { Response } from 'playwright'

import { PlayWrightContextOption, DocEssentials } from '@c-types/index'
import { getBackgroundBrowserContext } from '@lib/playwright'
import { useEnvironmentVariable } from '@lib/dotenv'
import { isValidUrl } from '@lib/util'

import {
  onlyAllowsFirstRequest,
  waitForNoMeta
} from '@components/wait-function'
import {
  calculateChain,
  extractDocFromResponse,
  parseDocsToRings
} from '@components/request/parser'

export async function checkRedirects(
  target: string,
  options?: PlayWrightContextOption
): Promise<{
  start: string
  redirects: DocEssentials[]
  destination: string
} | null> {
  if (!isValidUrl(target)) return null

  const browser = await getBackgroundBrowserContext(options)
  const page = await browser.newPage()

  try {
    const responseHolder: Response[] = []

    const timeout = useEnvironmentVariable('PLAYWRIGHT_LINK_TRACK_TIMEOUT_SEC')
    if (timeout) page.setDefaultTimeout(+timeout * 1000 || 15 * 1000)
    page.on('response', (res) => responseHolder.push(res))
    page.on('dialog', (dialog) => dialog.dismiss())
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

    return {
      start: target,
      destination,
      redirects
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    await page.close()
  }
}
