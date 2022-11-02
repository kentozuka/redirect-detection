import { ElementHandleForTag, PlayWrightContextOption } from '../types'
import { endTimer, isValidUrl, startTimer, truncate } from '../lib/util'
import { addTippy, extractData } from '../components/anchor-extraction'
import { getPersistentContext } from '../lib/playwright'
import { useEnvironmentVariable } from '../lib/dotenv'
import { compareTwoStrings } from 'string-similarity'
import getSeoData from '../components/seo-extraction'
import { checkRedirects } from './link-tracker'
import { injectTippy } from '../lib/tippy'
import { breakdownURL } from '../components/parameter'
import {
  createAnchorWithData,
  createArticle,
  disconnectPrisma,
  findAnchorByHref,
  findRouteAndDocs
} from '../components/prisma'

/* = = = = = = = = HELPER FUNC = = = = = = = = */

const colorAnchorOutline = async (
  anchor: ElementHandleForTag<'a'>,
  color: string
) => {
  await anchor.evaluate((a, color) => (a.style.outlineColor = color), color)
}

const validateAnchor = async (
  anchor: ElementHandleForTag<'a'>,
  { host, pathname }: { host: string; pathname: string }
): Promise<boolean> => {
  // url validation
  const href = await anchor.evaluate((a) => a.href) // returns full length href
  if (!isValidUrl(href)) return false

  // hash link validation
  const { host: ancHost, pathname: ancPathname, hash } = new URL(href)
  const samePage = host === ancHost && pathname === ancPathname
  const isIdLink = samePage && hash
  if (isIdLink) return false

  // visible link validation
  const rect = await anchor.boundingBox()
  if (rect === null || (rect.width === 0 && rect.height === 0)) return false

  const visible = await anchor.isVisible()
  if (!visible) return false

  // success
  return true
}

const getVariant = async () => {}

const variantExist = async () => {}

/* = = = = = = = = MAIN FUNC = = = = = = = = */
export async function queryAnchors(
  target: string,
  options?: PlayWrightContextOption
): Promise<null> {
  if (!isValidUrl(target)) return null

  const { host, pathname, origin } = new URL(target)
  const browser = await getPersistentContext(options)
  const page = await browser.newPage()

  try {
    await page.goto(target)
    await injectTippy(page)
    const seo = await getSeoData(page)
    const { id: articleId } = await createArticle({ ...seo, url: target })

    await page.$$eval('a', (ancs) =>
      ancs.map((a) => (a.style.outline = '4px solid gray'))
    )

    const anchors = await page.$$('a')

    const len = anchors.length
    for (const [ix, anchor] of Object.entries(anchors)) {
      const count = `${ix.toLocaleString()}/${len.toLocaleString()}`
      const validated = await validateAnchor(anchor, { host, pathname })
      if (!validated) {
        await colorAnchorOutline(anchor, 'black')
        console.log(`${count} | validation failed`)
        continue
      }

      await colorAnchorOutline(anchor, 'blue')
      const shouldScroll =
        useEnvironmentVariable('PLAYWRIGHT_SCROLL_INTO_VIEW') === 'true'
      if (shouldScroll)
        await anchor.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      // TODO: check if link exist in the db or update everything?
      const href = await anchor.evaluate((x) => x.href)
      const dbData = await findAnchorByHref(href)
      console.log(`${count} | ${href}`)

      if (dbData === null) {
        const timer = startTimer()
        const detail = await extractData(anchor, origin)

        // const createdAnchor = await createAnchor(detail, articleId)

        console.time('Background Check')
        const redirectResponse = await checkRedirects(href)
        if (redirectResponse === null) {
          await colorAnchorOutline(anchor, 'red')
          continue
        }
        const { redirects, destination, start } = redirectResponse
        // create anchor and route
        const routeData = {
          start: truncate(start),
          documentNum: redirects.length || 1,
          destination: truncate(destination),
          similarity: +compareTwoStrings(start, destination).toFixed(2),
          time: endTimer(timer)
        }

        const createdAnchor = await createAnchorWithData(
          articleId,
          detail,
          routeData,
          redirects
        )
        const { route } = createdAnchor

        await addTippy(anchor, route, createdAnchor)

        if (route.documentNum > 1) await colorAnchorOutline(anchor, 'yellow')
        else await colorAnchorOutline(anchor, 'green')

        console.log('\n')
        console.table(route)
        console.table(redirects.map((x) => ({ ...x, url: truncate(x.url) })))
        console.timeEnd('Background Check')
        console.log('\n')
      } else {
        // write tippy
        const route = await findRouteAndDocs(dbData.id)
        await addTippy(anchor, route, dbData)

        if (route.documentNum > 1) await colorAnchorOutline(anchor, 'yellow')
        else await colorAnchorOutline(anchor, 'green')
      }

      // TODO: remove logging and add to db
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    await disconnectPrisma()
    // await page.close()
  }
}

/**
 * TODO
 *
 * - add path prefix
 * - move files into files
 * - change anchor variant behaivior
 * - create automatic scraping tool
 */
