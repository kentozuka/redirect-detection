import { chromium } from 'playwright'

import { PlayWrightContextOption } from '../types'
import { useEnvironmentVariable } from './dotenv'

const defaultUserDataDir = `/tmp/playwright-users/${
  useEnvironmentVariable('PLAYWRIGHT_CONTEXT_USERNAME') ||
  'playwright-default-user'
}`
const ignores = [
  'stylesheet',
  'image',
  'media',
  'font',
  'script',
  'texttrack',
  'fetch',
  'eventsource',
  'websocket',
  'manifest',
  'other'
]

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
  browserContext.route('**/*', (route, request) => {
    // if (request.resourceType() !== 'document') return route.abort()
    if (ignores.includes(request.resourceType())) return route.abort()
    route.continue()
  })
  browserContext.setDefaultTimeout(1000 * 5)
  return browserContext
}
