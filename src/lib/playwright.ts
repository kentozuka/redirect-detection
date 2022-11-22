import { Browser, BrowserContext, chromium } from 'playwright'

import { PlayWrightContextOption } from '@c-types/index'
import { useEnvironmentVariable } from './dotenv'
import { headless, persistentContextTimeoutMS } from '@components/config'
import { logger } from './log'

let browser: BrowserContext = null
let backgroundBrowser: Browser = null

const mes = (isBackground: boolean) =>
  `= = = Launched a new ${
    isBackground ? 'background ' : ''
  }browser context = = =\n`

const getUserDir = (user: string) => `/tmp/playwright-users/${user}`

const persistentContextUser = getUserDir(
  useEnvironmentVariable('PLAYWRIGHT_CONTEXT_USERNAME') ||
    'playwright-default-user'
)

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
  logger.info(mes(false))
  return browser
}

export const closePersistentContext = async () => {
  if (browser) return await browser.close()

  logger.warn('Persistent context not found')
}

export const getBackgroundBrowserContext = async (
  options?: PlayWrightContextOption
) => {
  if (backgroundBrowser === null) {
    logger.info(mes(true))
    backgroundBrowser = await chromium.launch({ ...options, headless: false })
  }
  const conx = await backgroundBrowser.newContext()
  return conx
}

export const closeBackgroundBrowserContext = async () => {
  if (backgroundBrowser) return await backgroundBrowser.close()

  logger.warn('Background context not found')
}
