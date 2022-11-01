import axios from 'axios'
import { Page } from 'playwright'

const popperjs2 = 'https://unpkg.com/@popperjs/core@2'
const tippyjs6 = 'https://unpkg.com/tippy.js@6'

const inject = async (page: Page, endpoint: string) => {
  const { data } = await axios.get(endpoint)
  await page.$eval(
    'head',
    (head, data) => {
      const script = document.createElement('script')
      script.innerText = data
      head.prepend(script)
    },
    data
  )
}

export const injectTippy = async (page: Page) => {
  await inject(page, popperjs2)
  await inject(page, tippyjs6)
}

//# sourceMappingURL=tippy-bundle.umd.min.js.map
