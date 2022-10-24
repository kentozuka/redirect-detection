import { ElementHandleForTag, PlayWrightContextOption } from '../types'
import { endTimer, isValidUrl, startTimer, truncate } from '../lib/util'
import { addTippy, extractData } from '../components/anchor-extraction'
import { getPersistentContext } from '../lib/playwright'
import { compareTwoStrings } from 'string-similarity'
import { checkRedirects } from './link-tracker'
import { injectTippy } from '../lib/tippy'
import { breakdownURL } from './parameter'
import { prisma } from '../lib/prisma'

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

  // success
  return true
}

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

    await page.$$eval('a', (ancs) =>
      ancs.map((a) => (a.style.outline = '4px solid gray'))
    )

    const anchors = await page.$$('a')

    for (const anchor of anchors) {
      const failedValidation = await validateAnchor(anchor, { host, pathname })
      if (failedValidation) {
        await colorAnchorOutline(anchor, 'black')
        continue
      }

      // TODO: check if link exist in the db or update everything?

      await colorAnchorOutline(anchor, 'blue')
      const timer = startTimer()
      const detail = await extractData(anchor)

      console.time('Background Check')
      const redirectResponse = await checkRedirects(detail.href)
      if (redirectResponse === null) {
        await colorAnchorOutline(anchor, 'red')
        continue
      }
      const { redirects, destination, start } = redirectResponse
      const journey = {
        start: truncate(start),
        destination: truncate(destination),
        documentNum: redirects.length || 1
      }
      const truncatedRedirects = redirects.map((x) => ({
        ...x,
        url: truncate(x.url)
      }))

      const result = {
        detail,
        ...journey,
        redirects: truncatedRedirects,
        time: endTimer(timer),
        similarity: compareTwoStrings(start, destination)
      }

      await addTippy(anchor, result)

      if (result.redirects.length > 0)
        await colorAnchorOutline(anchor, 'yellow')
      else await colorAnchorOutline(anchor, 'green')

      // consoling
      const startUrl = breakdownURL(start)
      const destiUrl = breakdownURL(destination)
      console.log('start search params', startUrl.searchParams)
      console.log('destination search params', destiUrl.searchParams)

      console.table(journey)
      console.table(truncatedRedirects)
      console.timeEnd('Background Check')
      console.log('\n')

      // TODO: remove logging and add to db
    }
  } catch (e) {
    console.log(e)
    return null
  } finally {
    await page.close()
  }
}
