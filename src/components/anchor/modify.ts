import { ElementHandleForTag } from '@c-types/index'
import { mark } from '@components/config'

export const colorAnchorOutline = async (
  anchor: ElementHandleForTag<'a'>,
  color: string
) => {
  if (!mark) return

  await anchor.evaluate((a, color) => (a.style.outlineColor = color), color)
}
