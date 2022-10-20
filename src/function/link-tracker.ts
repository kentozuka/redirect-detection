import { BrowserContext, Response } from 'playwright'

import { PlayWrightContextOption, Redirect } from '../types'
import { launchPersistentContext } from '../lib/playwright'
import { useEnvironmentVariable } from '../lib/dotenv'
import { isValidUrl } from '../lib/url'

import {
  abortAnyRequest,
  onlyAllowsFirstRequest,
  waitForNoMeta
} from '../components/wait-function'
import {
  calculateChain,
  extractDocFromResponse,
  parseDocsToRings
} from '../components/request-parser'

/* = = = = = = = = = = = = = = = = = = = = = HELPER = = = = = = = = = = = = = = = = = = = = =*/
let browser: BrowserContext = null

const launchBrowser = async (options?: PlayWrightContextOption) => {
  const browserContext = await launchPersistentContext(options)
  const lightMode = useEnvironmentVariable('PLAYWRIGHT_LIGHT_WEIGHT') === 'true'
  if (lightMode) {
    const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
    const timeout = sec ? +sec * 1000 : 5 * 1000
    browserContext.setDefaultTimeout(timeout)
    abortAnyRequest(browserContext)
    browser = browserContext
  } else {
    onlyAllowsFirstRequest(browserContext)
    browserContext.setDefaultTimeout(1000 * 10)
  }
  browser = browserContext
  console.log(
    `= = =\nLaunched a new browser context${
      lightMode ? ' with light mode' : ''
    }\n= = =\n`
  )
}

export const closeBrowser = async () => await browser.close()

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
