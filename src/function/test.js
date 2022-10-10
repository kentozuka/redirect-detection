const { chromium } = require('playwright')
const { writeFileSync } = require('fs')

const target =
  'https://lenard.jp/magazine/_click/11bdd7141e7da8a8178486d53975d111?ref=%2Fmagazine%2Fsalon-ranking%2F&'
// const target = 'https://datsumo.ameba.jp/official/stlassh-campaign_banner.html?campaign_id=39'
// const target = 'https://h.accesstrade.net/sp/cc?rk=0100jeyo00kh6j'
// const target = 'https://cuebic.co.jp/your_select/link/epi-ginza-calla?cvpage=ep001&id=fv_btn&landing=ep001'
const pathToExtension =
  '/Users/ron/Library/Application Support/Google/Chrome/Default/Extensions/nnpljppamoaalgkieeciijbcccohlpoh/1.0.0.0_0'

/* = = = = = = = = = = = = = = = = = = = = = = = = */

const serversideRedirect = (status) => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return `[${status}]-unknown-serverside-redirect`
}

!(async () => {
  const userDataDir = '/tmp/test-user-data-dir'
  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  })

  const page = await browserContext.newPage()

  const example = {
    url: 'current url',
    status: 200,
    redirectType: 'client | server',
    headers: '',
    body: 'empty in case of 30x and catch',
    ip: 'ip address',
    port: 'port number'
  }

  const stash = []
  page.on('response', async (response) => {
    const type = response.request().resourceType()
    if (type !== 'document') return

    if (response.frame().parentFrame() !== null) return

    const url = response.url()
    const status = response.status()
    const serverAddr = await response.serverAddr()
    const headers = response.headers()

    if (/30\d/.test(status)) {
      const server = {
        url,
        status,
        redirectType: 'server',
        headers,
        body: '',
        ip: serverAddr ? serverAddr.ipAddress : '',
        port: serverAddr ? serverAddr.port : ''
      }
      stash.push(server)
    } else if (status === 200) {
      let body = ''
      try {
        // fails when theres no data
        body = (await response.body()).toString()
      } catch (e) {
        console.warn(e.message)
      }
      const client = {
        url,
        status,
        redirectType: 'client',
        headers,
        body,
        ip: serverAddr ? serverAddr.ipAddress : '',
        port: serverAddr ? serverAddr.port : ''
      }
      stash.push(client)
    }
  })

  await page.goto(target, { waitUntil: 'networkidle' })
  await new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const metas = await page.$$eval('meta', (metas) =>
          metas.map((x) => x.getAttribute('http-equiv'))
        )
        if (!metas.includes('Refresh')) {
          clearInterval(interval)
          resolve()
        }
      } catch (e) {
        console.log(e.message)
      }
    }, 100)
  })
  writeFileSync('./stash.json', JSON.stringify(stash, null, 2))
  console.log(stash)
  console.log('idled')
  console.log(page.url())
})()
