import { chromium } from 'playwright'

import { PlayWrightContextOption } from '../types'
import { useEnvironmentVariable } from './dotenv'

const defaultUserDataDir = `/tmp/playwright-users/${
  useEnvironmentVariable('PLAYWRIGHT_CONTEXT_USERNAME') ||
  'playwright-default-user'
}`

export const launchPersistentContext = async (
  options?: PlayWrightContextOption
) => {
  const browserContext = await chromium.launchPersistentContext(
    defaultUserDataDir,
    options
  )
  return browserContext
}

export const launchLightWeightPersistentContext = async (
  options?: PlayWrightContextOption
) => {
  const browserContext = await chromium.launchPersistentContext(
    defaultUserDataDir,
    options
  )
  const sec = useEnvironmentVariable('PLAYWRIGHT_TIMEOUT_SEC')
  const timeout = sec ? +sec * 1000 : 5 * 1000
  browserContext.setDefaultTimeout(timeout)
  return browserContext
}
