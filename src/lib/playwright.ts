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
