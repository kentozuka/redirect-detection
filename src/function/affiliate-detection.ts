import { chromium } from 'playwright'

const target =
  'https://lenard.jp/magazine/_click/11bdd7141e7da8a8178486d53975d111?ref=%2Fmagazine%2Fsalon-ranking%2F&'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  // await page.goto(target)
  const response = await page.goto(target)
  console.log(response?.request()?.redirectedFrom()?.url())
  // page.on('request', async (el) => {
  //   const tp = el.resourceType()
  //   if (tp === 'document') {
  //     const res = await el.response()
  //     console.log(res?.url())
  //     console.log('')
  //   }
  // })
  // await page.waitForNavigation({ timeout: 100000 })
  await page.waitForNavigation({ waitUntil: 'networkidle' })

  await browser.close()
}

main()
