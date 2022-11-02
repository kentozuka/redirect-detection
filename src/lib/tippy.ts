import { Page } from 'playwright'

const popperjs2 = 'https://unpkg.com/@popperjs/core@2'
const tippyjs6 = 'https://unpkg.com/tippy.js@6'

export const injectTippy = async (page: Page) => {
  await page.addScriptTag({ url: popperjs2 })
  await page.addScriptTag({ url: tippyjs6 })
}
