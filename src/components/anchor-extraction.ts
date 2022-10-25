import { Anchor } from '@prisma/client'

import { ElementHandleForTag } from '../types'
import { contrast } from '../lib/util'

type AnchorRawData = Omit<Anchor, 'id' | 'articleId' | 'route'>

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
): Promise<AnchorRawData> => {
  const evaled = await anchor.evaluate((a) => {
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
      href: a.href,
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
      fontSize: +fontSize.replace('px', ''),
      fontWeight: +fontWeight,
      fontFamily,
      lineHeight: +lineHeight.replace('px', ''),
      padding,
      margin,
      animation
      // ...a.getBoundingClientRect() => spread syntax does not work on DOMRect
    }
  })

  const rect = await anchor.boundingBox() // calculating twice for cleaner code
  const { host, pathname, origin } = new URL(evaled.href)

  return {
    ...evaled,
    sponsored: evaled.relList.includes('sponsored'),
    screenshot: '', //(await anchor.screenshot()).toString('base64'),
    hasAnimation: evaled.animation !== noAnimation,
    contrastScore: calculateContrast(evaled.color, evaled.backgroundColor),
    host,
    pathname,
    sameOrigin: origin === targetOrigin,
    ...rect
  }
}

export const addTippy = async (
  anchor: ElementHandleForTag<'a'>,
  data: {
    start: string
    destination: string
    redirects: any[]
    time: number
    similarity: number
    detail: AnchorRawData
  }
) => {
  await anchor.evaluate((a, data) => {
    const el = document.createElement('div')
    el.innerHTML = `
    <p>${data.start}</p>
    <p>${data.destination}</p>
    <p>${data.time.toLocaleString()}ms | ${
      data.redirects.length
    } redirects | ${(data.similarity * 100).toFixed(1)}% similar</p>
    <p>${data.detail.contrastScore} contrast score</p>
    <p>${data.detail.color} / ${
      data.detail.backgroundColor
    } <span style="color: ${data.detail.color}; background-color: ${
      data.detail.backgroundColor
    };">(c/b)</span></p>
    `
    // @ts-ignore
    tippy(a, {
      content: el
    })
  }, data)
}
