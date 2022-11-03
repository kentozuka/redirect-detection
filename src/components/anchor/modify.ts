import { ElementHandleForTag } from '@c-types/index'

export const colorAnchorOutline = async (
  anchor: ElementHandleForTag<'a'>,
  color: string
) => {
  await anchor.evaluate((a, color) => (a.style.outlineColor = color), color)
}
