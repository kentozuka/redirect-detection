import { ElementHandleForTag } from '@c-types/index'
import { isValidUrl } from '@lib/util'

export const validateAnchor = async (
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
