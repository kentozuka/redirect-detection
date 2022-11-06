import { BrowserContext, Page } from 'playwright'

import { loadingAnimation } from '@lib/logger'

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

export const abortAnyRequest = async (entity: Page | BrowserContext) => {
  await entity.route('**/*', (route, request) => {
    const type = request.resourceType()
    const shouldIgnore = ignores.includes(type)
    if (shouldIgnore) return route.abort()
    route.continue()
  })
}

export const onlyAllowsFirstRequest = async (entity: Page | BrowserContext) => {
  await entity.route('**/*', (route, request) => {
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
  const getOut = (
    timeout: NodeJS.Timeout,
    interval: NodeJS.Timer,
    resolve: (value: void | PromiseLike<void>) => void
  ) => {
    clearInterval(interval)
    clearInterval(animInt)
    clearTimeout(timeout)
    console.log()
    resolve()
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Escaped due to timeout')
      getOut(timeout, interval, resolve)
    }, 10 * 1000)

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

          getOut(timeout, interval, resolve)
        }
      } catch {
        // page navigation destroys the page
      }
    }, 200)
  })
}
