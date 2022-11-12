import { Page } from 'playwright'

import { Anchor, Route } from '@prisma/client'
import { ElementHandleForTag, VariationEssential } from '@c-types/index'
import { mark } from './config'

const popperjs2 = 'https://unpkg.com/@popperjs/core@2'
const tippyjs6 = 'https://unpkg.com/tippy.js@6'

export const injectTippy = async (page: Page) => {
  await page.addScriptTag({ url: popperjs2 })
  await page.addScriptTag({ url: tippyjs6 })
}

export const addTippy = async (
  anchor: ElementHandleForTag<'a'>,
  anchorData: Anchor,
  route: Route,
  detail: VariationEssential
) => {
  if (!mark) return

  await anchor.evaluate(
    (a, { route, detail, anchorData }) => {
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
    { route, detail, anchorData }
  )
}
