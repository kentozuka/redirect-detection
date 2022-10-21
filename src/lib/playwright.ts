import { BrowserContext, chromium } from 'playwright'

import { PlayWrightContextOption } from '../types'
import { useEnvironmentVariable } from './dotenv'

let browser: BrowserContext = null

const headless = useEnvironmentVariable('PLAYWRIGHT_HEADLESS') === 'true'

const defaultUserDataDir = `/tmp/playwright-users/${
  useEnvironmentVariable('PLAYWRIGHT_CONTEXT_USERNAME') ||
  'playwright-default-user'
}`

export const getPersistentContext = async (
  options?: PlayWrightContextOption
) => {
  if (browser !== null) return browser
  const browserContext = await chromium.launchPersistentContext(
    defaultUserDataDir,
    { ...options, headless }
  )
  const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
  const timeout = sec ? +sec * 1000 : 7 * 1000
  browserContext.setDefaultTimeout(timeout)
  browser = browserContext
  console.log(
    `= = =\nLaunched a new browser context with ${timeout}ms timeout\n= = =\n`
  )
  return browser
}

export const closePersistentContext = async () => {
  if (browser) return await browser.close()

  console.log('Persistent context not found')
}
