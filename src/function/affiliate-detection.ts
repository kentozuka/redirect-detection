import { chromium } from 'playwright'
import { join } from 'path'

const target =
  'https://lenard.jp/magazine/_click/11bdd7141e7da8a8178486d53975d111?ref=%2Fmagazine%2Fsalon-ranking%2F&'
const pathToExtension =
  '/Users/ron/Library/Application Support/Google/Chrome/Default/Extensions/nnpljppamoaalgkieeciijbcccohlpoh/1.0.0.0_0'

!(async () => {
  const userDataDir = '/tmp/test-user-data-dir'
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  })
  let [backgroundPage] = browserContext.backgroundPages()
  if (!backgroundPage)
    backgroundPage = await browserContext.waitForEvent('backgroundpage')

  // Test the background page as you would any other page.
  // await browserContext.close()

  const page = await browserContext.newPage()
  await page.goto(target, { waitUntil: 'networkidle' })

  console.log('idled')

  const a = await backgroundPage.evaluate((tabId) => {
    // @ts-ignore
    // chrome.runtime.sendMessage(
    //   {
    //     cmd: 'ui.getTabData',
    //     data: { tabId }
    //   }
    // )

    // @ts-ignore
    return processPath
  })
  console.log({ a })

  // console.log({ backgroundPage })
})()
