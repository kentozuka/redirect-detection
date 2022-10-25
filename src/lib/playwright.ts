import { BrowserContext, chromium } from 'playwright'

import { PlayWrightContextOption } from '../types'
import { useEnvironmentVariable } from './dotenv'

let browser: BrowserContext = null
let backgroundBrowser: BrowserContext = null

const mes = (timeoutSec: string, isBackground: boolean) =>
  `= = =\nLaunched a new ${
    isBackground ? 'background ' : ''
  }browser context with ${+timeoutSec * 1000}ms timeout\n= = =\n`
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
  if (sec) {
    browserContext.setDefaultTimeout(+sec * 1000)
  }
  browser = browserContext
  console.log(mes(sec, false))
  return browser
}

export const closePersistentContext = async () => {
  if (browser) return await browser.close()

  console.log('Persistent context not found')
}

export const getBackgroundBrowserContext = async (
  options?: PlayWrightContextOption
) => {
  if (backgroundBrowser !== null) return backgroundBrowser
  const br = await chromium.launch({ ...options, headless: true })
  const conx = await br.newContext()
  const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
  if (sec) {
    conx.setDefaultTimeout(+sec * 1000)
  }
  backgroundBrowser = conx
  console.log(mes(sec, true))
  return backgroundBrowser
}

export const closeBackgroundBrowserContext = async () => {
  if (backgroundBrowser) return await backgroundBrowser.close()

  console.log('Persistent context not found')
}
