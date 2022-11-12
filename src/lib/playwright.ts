import { BrowserContext, chromium } from 'playwright'

import { PlayWrightContextOption } from '@c-types/index'
import { useEnvironmentVariable } from './dotenv'
import { headless, persistentContextTimeoutMS } from '@components/config'

let browser: BrowserContext = null
let backgroundBrowser: BrowserContext = null

const mes = (timeoutSec: string, isBackground: boolean) =>
  `= = =\nLaunched a new ${
    isBackground ? 'background ' : ''
  }browser context with ${+timeoutSec * 1000}ms timeout\n= = =\n`

const persistentContextUser = `/tmp/playwright-users/${
  useEnvironmentVariable('PLAYWRIGHT_CONTEXT_USERNAME') ||
  'playwright-default-user'
}`

export const getPersistentContext = async (
  options?: PlayWrightContextOption
) => {
  if (browser !== null) return browser
  const browserContext = await chromium.launchPersistentContext(
    persistentContextUser,
    { ...options, headless }
  )
  browserContext.setDefaultTimeout(persistentContextTimeoutMS)
  browser = browserContext
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
  backgroundBrowser = conx
  return backgroundBrowser
}

export const closeBackgroundBrowserContext = async () => {
  if (backgroundBrowser) return await backgroundBrowser.close()

  console.log('Persistent context not found')
}
