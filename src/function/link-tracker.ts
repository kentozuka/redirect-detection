import { Response } from 'playwright'

import { PlayWrightContextOption, DocEssentials } from '@c-types/index'
import { getBackgroundBrowserContext } from '@lib/playwright'
import { linkTrackTimeoutMS } from '@components/config'
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
import { addError } from '@components/prisma'
import { logger } from '@lib/log'

export async function checkRedirects(
  target: string,
  options?: PlayWrightContextOption
): Promise<{
  start: string
  redirects: DocEssentials[]
  destination: string
} | null> {
  if (!isValidUrl(target)) return null

  const context = await getBackgroundBrowserContext(options)
  const page = await context.newPage()

  try {
    const responseHolder: Response[] = []

    page.setDefaultTimeout(linkTrackTimeoutMS)
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
    logger.error('redirect-check', e)
    await addError('link-tracker', e.message, e.stack)
    return null
  } finally {
    await context.close()
  }
}
