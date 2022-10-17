import { Page } from 'playwright'

import { loadingAnimation } from '../lib/logger'

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
          clearInterval(interval)
          clearInterval(animInt)
          resolve()
        }
      } catch {
        // page navigation destroys the page
      }
    }, 100)
  })
}
