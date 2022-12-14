import { BrowserContext, Page } from 'playwright'

import { loadingAnimation } from '../lib/logger'

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
let ignored = [] // allows first request

export const emptyIgnored = () => (ignored = [])

export const abortAnyRequest = (browserContext: BrowserContext) => {
  browserContext.route('**/*', (route, request) => {
    const type = request.resourceType()
    const shouldIgnore = ignores.includes(type)
    if (shouldIgnore) return route.abort()
    route.continue()
  })
}

export const onlyAllowsFirstRequest = (browserContext: BrowserContext) => {
  browserContext.route('**/*', (route, request) => {
    const type = request.resourceType()
    if (type === 'document') emptyIgnored()

    const shouldIgnore = ignores.includes(type)
    const isInIgnored = ignored.includes(type)
    if (shouldIgnore) {
      if (isInIgnored) return route.abort()
      else ignored.push(type)
    }
    route.continue()
  })
}

export const waitForNoMeta = async (page: Page): Promise<void> => {
  const animInt = loadingAnimation('Waiting for page navigation to resolve...')

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const metas = await page.$$eval('meta', (metas) =>
          metas.map((x) => x.getAttribute('http-equiv'))
        )
        const hasMeta = metas.includes('Refresh') || metas.includes('refresh') // TODO: create regex
        if (!hasMeta) {
          const htmlString = await page.content() // in case playwright cant parse html (eg. meta in the <noscript> tag)
          const htmlHasMeta = htmlString.indexOf('http-equiv="refresh"') !== -1
          if (htmlHasMeta) return

          clearInterval(interval)
          clearInterval(animInt)
          resolve()
        }
      } catch {
        // page navigation destroys the page
      }
    }, 200)
  })
}
