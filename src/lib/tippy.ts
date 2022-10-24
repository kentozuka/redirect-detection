import { Page } from 'playwright'

const popperjs2 = 'https://unpkg.com/@popperjs/core@2'
const tippyjs6 = 'https://unpkg.com/tippy.js@6'

export const injectTippy = async (page: Page) => {
  await page.$eval(
    'head',
    (head, { p, t }) => {
      const popper = document.createElement('script')
      popper.src = p
      const tippy = document.createElement('script')
      tippy.src = t

      head.prepend(popper, tippy)
    },
    { p: popperjs2, t: tippyjs6 }
  )
}

//# sourceMappingURL=tippy-bundle.umd.min.js.map
