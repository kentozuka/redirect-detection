import { chromium } from 'playwright'

const target =
  'https://lenard.jp/magazine/_click/11bdd7141e7da8a8178486d53975d111?ref=%2Fmagazine%2Fsalon-ranking%2F&'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(target)
  page.on('request', async (el) => {
    console.log(el.resourceType())
  })
  // await page.waitForNavigation({ timeout: 100000 })
  await page.waitForNavigation({ waitUntil: 'commit' })
}

main()
