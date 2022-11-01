import axios from 'axios'
import { Page } from 'playwright'

const popperjs2 = 'https://unpkg.com/@popperjs/core@2'
const tippyjs6 = 'https://unpkg.com/tippy.js@6'

export const injectTippy = async (page: Page) => {
  const { data: pop } = await axios.get(popperjs2)
  const { data: tip } = await axios.get(tippyjs6)

  await page.$eval(
    'head',
    (head, { p, t }) => {
      const popper = document.createElement('script')
      popper.innerText = p
      const tippy = document.createElement('script')
      tippy.innerText = t

      head.prepend(popper, tippy)
    },
    { p: pop, t: tip }
  )
}

//# sourceMappingURL=tippy-bundle.umd.min.js.map
