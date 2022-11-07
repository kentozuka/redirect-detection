import { compareTwoStrings } from 'string-similarity'
import { Article } from '@prisma/client'

import { PlayWrightContextOption } from '@c-types/index'
import { checkRedirects } from './link-tracker'

import { endTimer, isValidUrl, startTimer, truncate } from '@lib/util'
import { getPersistentContext } from '@lib/playwright'
import { useEnvironmentVariable } from '@lib/dotenv'

import { extractVariation } from '@components/anchor/extraction'
import { colorAnchorOutline } from '@components/anchor/modify'
import { validateAnchor } from '@components/anchor/validate'
import { injectTippy, addTippy } from '@components/tippy'
import { sameOrigin } from '@lib/util'
import {
  addAnchorVariant,
  createAnchorWithRoute,
  findAnchorByHref,
  findRouteAndDocs,
  getVariant
} from '@components/prisma'

const cls = {
  current: 'blue',
  unsed: 'black',
  failed: 'red',
  multiple: 'yellow',
  single: 'green'
}
const shouldScroll =
  useEnvironmentVariable('PLAYWRIGHT_SCROLL_INTO_VIEW') === 'true'

export async function scrapeAnchors(
  article: Article,
  options?: PlayWrightContextOption
): Promise<null> {
  const { url, id: articleId } = article
  if (!isValidUrl(url)) return null

  const { host, pathname } = new URL(url)
  const browser = await getPersistentContext(options)
  const page = await browser.newPage()

  try {
    await page.goto(url)
    await injectTippy(page)

    const anchorElements = await page.$$('a')
    const len = anchorElements.length
    await page.$$eval('a', (ancs) =>
      ancs.map((a) => (a.style.outline = '4px solid gray'))
    )

    for (const [ix, anchorElement] of Object.entries(anchorElements)) {
      // validation
      const count = `[${(+ix + 1).toLocaleString()}/${len.toLocaleString()}]`
      const validated = await validateAnchor(anchorElement, { host, pathname })
      if (!validated) {
        await colorAnchorOutline(anchorElement, cls.unsed)
        console.log(`${count} | {validation failed}`)
        continue
      }

      await colorAnchorOutline(anchorElement, cls.current)
      if (shouldScroll) {
        await anchorElement.evaluate((el) =>
          el.scrollIntoView({ block: 'center' })
        )
      }

      const href = await anchorElement.evaluate((x) => x.href)
      let anchor = await findAnchorByHref(href)
      console.log(`${count} | {${anchor && anchor.id}} ${href}`)

      if (anchor === null) {
        const timer = startTimer()
        const redirectResponse = await checkRedirects(href)

        if (redirectResponse === null) {
          await colorAnchorOutline(anchorElement, cls.failed)
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

        if (redirects.length) {
          console.table(redirects.map((x) => ({ ...x, url: truncate(x.url) })))
        }
      }

      const rect = await anchorElement.boundingBox()
      let variant = await getVariant(anchor.id, rect)

      if (variant === null) {
        const variantData = await extractVariation(anchorElement)
        variant = await addAnchorVariant(anchor.id, variantData)
      }

      const route = await findRouteAndDocs(anchor.id)
      const markerCol = route.documentNum > 1 ? cls.multiple : cls.single
      await colorAnchorOutline(anchorElement, markerCol)
      await addTippy(anchorElement, anchor, route, variant)
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    // await page.close()
  }
}
