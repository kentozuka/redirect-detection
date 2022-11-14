import { compareTwoStrings } from 'string-similarity'
import { Article } from '@prisma/client'

import { endTimer, isValidUrl, startTimer, truncate } from '@lib/util'
import { extractVariation } from '@components/anchor/extraction'
import { colorAnchorOutline } from '@components/anchor/modify'
import { validateAnchor } from '@components/anchor/validate'
import { injectTippy, addTippy } from '@components/tippy'
import { PlayWrightContextOption } from '@c-types/index'
import { getPersistentContext } from '@lib/playwright'
import { scroll } from '@components/config'
import { sameOrigin } from '@lib/util'
import {
  addAnchorVariant,
  addError,
  createAnchorWithRoute,
  endArticle,
  findAnchorByHref,
  findRouteAndDocs,
  getVariant,
  startArticle,
  updateArticleTime
} from '@components/prisma'

import { checkRedirects } from './link-tracker'
import { logger } from '@lib/log'

const cls = {
  current: 'blue',
  unsed: 'black',
  failed: 'red',
  multiple: 'yellow',
  single: 'green'
}

export async function scrapeAnchors(
  article: Article,
  options?: PlayWrightContextOption
) {
  const timer = startTimer()
  await startArticle(article)

  const { url, id: articleId } = article
  if (!isValidUrl(url)) {
    await endArticle(article)
    await updateArticleTime(article, endTimer(timer))
    return
  }

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
      const count = `[${(+ix + 1).toLocaleString()}/${len.toLocaleString()}]`

      // validation
      const validated = await validateAnchor(anchorElement, { host, pathname })
      if (!validated) {
        await colorAnchorOutline(anchorElement, cls.unsed)
        continue
      }

      await colorAnchorOutline(anchorElement, cls.current)
      if (scroll) {
        await anchorElement.evaluate((el) =>
          el.scrollIntoView({ block: 'center' })
        )
      }

      const href = await anchorElement.evaluate((x) => x.href)
      let anchor = await findAnchorByHref(href)
      logger.info(`${count} | {${anchor && anchor.id}} ${truncate(href)}`)

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
          console.table(
            '\r' + redirects.map((x) => ({ ...x, url: truncate(x.url) }))
          )
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
    logger.error('anchor-error', e)
    await addError('anchor-finder', e.message, e.stack)
    return // never ends
  } finally {
    await page.close()
    await endArticle(article)
    await updateArticleTime(article, endTimer(timer))
  }
}
