import { compareTwoStrings } from 'string-similarity'

import { PlayWrightContextOption } from '@c-types/index'
import { checkRedirects } from './link-tracker'

import { endTimer, isValidUrl, startTimer, truncate } from '@lib/util'
import { getPersistentContext } from '@lib/playwright'
import { useEnvironmentVariable } from '@lib/dotenv'

import { extractVariation } from '@components/anchor/extraction'
import { colorAnchorOutline } from '@components/anchor/modify'
import { validateAnchor } from '@components/anchor/validate'
import { isNewVariation } from '@components/variant/exist'
import { injectTippy, addTippy } from '@components/tippy'
import getSeoData from '@components/seo-extraction'
import { sameOrigin } from '@components/url'
import {
  addAnchorVariant,
  createAnchorWithRoute,
  createArticle,
  disconnectPrisma,
  findAnchorByHref,
  findRouteAndDocs
} from '@components/prisma'

const timerName = 'Redirect Check'
const shouldScroll =
  useEnvironmentVariable('PLAYWRIGHT_SCROLL_INTO_VIEW') === 'true'

export async function queryAnchors(
  target: string,
  options?: PlayWrightContextOption
): Promise<null> {
  if (!isValidUrl(target)) return null

  const { host, pathname } = new URL(target)
  const browser = await getPersistentContext(options)
  const page = await browser.newPage()

  try {
    await page.goto(target)
    await injectTippy(page)

    // creating article
    const seo = await getSeoData(page)
    const { id: articleId } = await createArticle({ ...seo, url: target })

    const anchorElements = await page.$$('a')
    const len = anchorElements.length
    await page.$$eval('a', (ancs) =>
      ancs.map((a) => (a.style.outline = '4px solid gray'))
    )

    for (const [ix, anchorElement] of Object.entries(anchorElements)) {
      // validation
      const count = `[${(ix + 1).toLocaleString()}/${len.toLocaleString()}]`
      const validated = await validateAnchor(anchorElement, { host, pathname })
      if (!validated) {
        await colorAnchorOutline(anchorElement, 'black')
        console.log(`${count} | validation failed`)
        continue
      }

      await colorAnchorOutline(anchorElement, 'blue')
      if (shouldScroll) {
        await anchorElement.evaluate((el) =>
          el.scrollIntoView({ block: 'center' })
        )
      }

      const href = await anchorElement.evaluate((x) => x.href)
      let anchor = await findAnchorByHref(href)
      console.log(`${count} | ${anchor && anchor.id} ${href}`)

      if (anchor === null) {
        console.time(timerName)
        const timer = startTimer()
        const redirectResponse = await checkRedirects(href)

        if (redirectResponse === null) {
          await colorAnchorOutline(anchorElement, 'red')
          console.timeEnd(timerName)
          continue
        }

        const { redirects, destination, start } = redirectResponse
        const anchorData = {
          href,
          host,
          pathname,
          sameOrigin: sameOrigin(start, destination)
        }
        const routeData = {
          start: truncate(start),
          documentNum: redirects.length || 1,
          destination: truncate(destination),
          similarity: +compareTwoStrings(start, destination).toFixed(2),
          time: endTimer(timer)
        }
        anchor = await createAnchorWithRoute(
          articleId,
          anchorData,
          routeData,
          redirects
        )
        if (redirects.length)
          console.table(redirects.map((x) => ({ ...x, url: truncate(x.url) })))
        console.timeEnd(timerName)
      }

      const variant = await extractVariation(anchorElement)
      if (isNewVariation(anchor.id, variant)) {
        await addAnchorVariant(anchor.id, variant)
      }

      const route = await findRouteAndDocs(anchor.id)
      const markerCol = route.documentNum > 1 ? 'yellow' : 'green'
      await colorAnchorOutline(anchorElement, markerCol)
      await addTippy(anchorElement, anchor, route, variant)
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    await disconnectPrisma()
    // await page.close()
  }
}

// failed attempts?
// timeout => will do again
