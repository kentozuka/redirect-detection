import { ElementHandleForTag } from '@c-types/index'
import { isValidUrl, truncate } from '@lib/util'
import { logger } from '@lib/log'

const causes = ['wrong url', 'hash link', 'non-visible']

const invalidLog = (reason: string, href: string) =>
  logger.warn(`[${reason}] | ${truncate(href)}`)

export const validateAnchor = async (
  anchor: ElementHandleForTag<'a'>,
  { host, pathname }: { host: string; pathname: string }
): Promise<boolean> => {
  // url validation
  const href = await anchor.evaluate((a) => a.href) // returns full length href
  if (!isValidUrl(href)) {
    invalidLog(causes[0], href)
    return false
  }

  // hash link validation
  const { host: ancHost, pathname: ancPathname, hash } = new URL(href)
  const samePage = host === ancHost && pathname === ancPathname
  const isIdLink = samePage && hash
  if (isIdLink) {
    invalidLog(causes[1], href)
    return false
  }

  // visible link validation
  const rect = await anchor.boundingBox()
  if (rect === null || (rect.width === 0 && rect.height === 0)) {
    invalidLog(causes[2], href)
    return false
  }

  const visible = await anchor.isVisible()
  if (!visible) {
    invalidLog(causes[2], href)
    return false
  }

  // success
  return true
}
