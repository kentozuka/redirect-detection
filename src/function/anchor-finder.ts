import { BrowserContext, Response } from 'playwright'

import { PlayWrightContextOption } from '../types'
import { getPersistentContext } from '../lib/playwright'
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

export async function queryAnchors(
  target: string,
  options?: PlayWrightContextOption
): Promise<null> {
  if (!isValidUrl(target)) return null

  try {
    const browser = await getPersistentContext(options)
    const page = await browser.newPage()

    await page.goto(target)

    await page.$$eval('a', (ancs) =>
      ancs.map((anc) => {
        anc.style.border = '2px solid red'
      })
    )

    // await page.close()
  } catch (e) {
    console.log(e)
    return null
  }
}
