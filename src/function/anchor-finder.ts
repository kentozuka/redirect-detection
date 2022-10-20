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
  // const lightMode = useEnvironmentVariable('PLAYWRIGHT_LIGHT_WEIGHT') === 'true'
  // if (lightMode) {
  //   const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
  //   const timeout = sec ? +sec * 1000 : 5 * 1000
  //   browserContext.setDefaultTimeout(timeout)
  //   abortAnyRequest(browserContext)
  //   browser = browserContext
  // } else {
  //   onlyAllowsFirstRequest(browserContext)
  //   browserContext.setDefaultTimeout(1000 * 10)
  // }
  await browserContext.route('**/*', (request) => {
    request.request().url().startsWith('https://googleads.')
      ? request.abort()
      : request.continue()
    return
  })
  browser = browserContext
  // console.log(
  //   `= = =\nLaunched a new browser context${
  //     lightMode ? ' with light mode' : ''
  //   }\n= = =\n`
  // )
}

export const closeBrowser = async () => await browser.close()

/* = = = = = = = = = = = = = = = = = = = = = MAIN = = = = = = = = = = = = = = = = = = = = =*/

export async function queryAnchors(
  target: string,
  options?: PlayWrightContextOption
): Promise<null> {
  if (!isValidUrl(target)) return null

  try {
    if (browser === null) await launchBrowser(options)
    const page = await browser.newPage()

    await page.goto(target)

    await page.$$eval('a', (ancs) =>
      ancs.map((anc) => (anc.style.border = '2px solid red'))
    )

    // await page.close()
  } catch (e) {
    console.log(e)
    return null
  }
}
