import { Anchor, Route, Variation } from '@prisma/client'

import { ElementHandleForTag, VariationEssential } from '../types'
import { contrast } from '../lib/util'

const noAnimation = 'none 0s ease 0s 1 normal none running'

const calculateContrast = (color: string, backgroundColor: string) => {
  const exp = new RegExp(/\d+/, 'g')
  const col = color.match(exp).map((x) => +x)
  const bac = backgroundColor.match(exp).map((x) => +x)
  const float = contrast(col, bac)
  return +float.toFixed(2)
}

export const extractData = async (
  anchor: ElementHandleForTag<'a'>,
  targetOrigin: string
): Promise<VariationEssential> => {
  const evaled = await anchor.evaluate((a) => {
    a.style.outlineColor = 'transparent'
    const {
      color,
      backgroundColor,
      animation,
      fontWeight,
      fontFamily,
      padding,
      margin,
      lineHeight,
      fontSize
    } = getComputedStyle(a)

    return {
      // href: a.href,
      outerHtml: a.outerHTML.trim(),
      relList: Array.from(a.relList),
      target: a.target,
      htmlId: a.id,
      dataset: Object.entries(a.dataset),
      onClick: a.onclick ? a.onclick.toString().trim() : '',
      classList: Array.from(a.classList),
      textContent: a.textContent.trim(),
      referrerPolicy: a.referrerPolicy,
      firstChildElementCount: a.childElementCount,
      firstChildElementName: a.firstElementChild
        ? a.firstElementChild.localName
        : '',
      color,
      backgroundColor,
      fontSize: parseFloat(fontSize) || 0,
      fontWeight: parseInt(fontWeight) || 0,
      fontFamily,
      lineHeight: parseFloat(lineHeight) || 0,
      padding,
      margin,
      animation
    }
  })

  const rect = await anchor.boundingBox() // calculating twice for the sake of cleaner code
  // const { host, pathname, origin } = new URL(evaled.href)

  return {
    ...evaled,
    sponsored: evaled.relList.includes('sponsored'),
    screenshot: (await anchor.screenshot()).toString('base64'),
    hasAnimation: evaled.animation !== noAnimation,
    contrastScore: calculateContrast(evaled.color, evaled.backgroundColor),
    // host,
    // pathname,
    // sameOrigin: origin === targetOrigin,
    ...rect
  }
}

export const addTippy = async (
  anchor: ElementHandleForTag<'a'>,
  anchorData: Anchor,
  route: Route,
  detail: Variation
) => {
  await anchor.evaluate(
    (a, { route, detail }) => {
      const el = document.createElement('div')
      el.innerHTML = `
    <p>${route.start}</p>
    <p>${route.destination}</p>
    <p>${route.time.toLocaleString()}ms | ${route.documentNum} redirects | ${(
        route.similarity * 100
      ).toFixed(1)}% similar</p>
    <p>${detail.contrastScore} contrast score</p>
    <p>same origin: ${anchorData.sameOrigin}</p>
    <p>${detail.color} / ${detail.backgroundColor} <span style="color: ${
        detail.color
      }; background-color: ${detail.backgroundColor};">(c/b)</span></p>
    ${
      detail.screenshot &&
      `<img src="data:image/png;base64,${detail.screenshot}" />`
    }
    `
      // @ts-ignore
      tippy(a, { content: el })
    },
    { route, detail }
  )
}
