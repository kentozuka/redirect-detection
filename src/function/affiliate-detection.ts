import { BrowserContext, chromium, Page, Response } from 'playwright'
import urlRegex from 'url-regex'
import { load } from 'cheerio'

import prompts from 'prompts'
import { writeFileSync } from 'fs'
import axios from 'axios'

type UnknownTypes = 'unknown'
type ServerSideTypes = 'permanent' | 'temporary' | UnknownTypes
type ClientSideTypes = 'meta' | 'javascript' | UnknownTypes
type PossibleTypes = ServerSideTypes | ClientSideTypes

interface Doc {
  url: string
  status: number
  redirectType: 'client' | 'server' | 'unknown'
  headers: { [key: string]: string }
  body: string
  ip: string
  port: number
}

interface Node {
  url: string
  redirectTo: string
  redirectType: PossibleTypes
  ip: string
  port: number
  status: number
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
const isThreeHundres = (n: number) => /30\d/.test(String(n))

const serverSideRedirect = (status: number): PossibleTypes => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return 'unknown'
}

const clientSideRedirect = (body: string): PossibleTypes => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (body.includes(jsRefresh)) return 'javascript' // could be wrong

  return 'unknown'
}

const extractDocFromResponse = async (res: Response): Promise<Doc | null> => {
  const type = res.request().resourceType()
  if (type !== 'document') return null // non-document resource type: [stylesheet, image, media, font, script, texttrack, xhr, fetch, eventsource, websocket, manifest, other]
  if (res.frame().parentFrame() !== null) return null // "Parent frame, if any. Detached frames and main frames return null." thus prevent requests made from iframes

  const url = res.url()
  const status = res.status()
  const headers = res.headers()
  const serverAddr = await res.serverAddr()

  const doc: Doc = {
    url,
    status,
    redirectType: 'unknown',
    headers,
    body: '',
    ip: serverAddr ? serverAddr.ipAddress : '',
    port: serverAddr ? serverAddr.port : 0
  }

  const isSSRidirect = isThreeHundres(status)
  if (isSSRidirect) {
    doc.redirectType = 'server'
    return doc
  }

  try {
    const body = (await res.body()).toString()
    const isHtml = body.indexOf('<html') !== -1
    const $ = load(body)
    const head = $('head').html() || ''
    doc.body = isHtml ? head : body
    doc.redirectType = 'client'
  } catch (e: any) {
    console.log(`[Parsing body failed] ${e.message}`)
    const res = await axios.get(url)
    console.log(`Faillback request status: ${res.status}`)
    if (res.status === 200) doc.body = res.data
  } // sometimes body() fails

  return doc
}

const waitForDestination = async (page: Page): Promise<void> => {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const metas = await page.$$eval('meta', (metas) =>
          metas.map((x) => x.getAttribute('http-equiv'))
        )
        const hasMeta = metas.includes('Refresh')
        if (!hasMeta) {
          clearInterval(interval)
          resolve()
        }
      } catch (e: any) {
        // page navigation destroys the page
        console.error(e.message)
      }
    }, 100)
  })
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
let browser: BrowserContext | null = null
async function filterDocumentRequests(target: string): Promise<Doc[]> {
  const docs: Doc[] = []

  const pathToExtension =
    '/Users/ron/Library/Application Support/Google/Chrome/Default/Extensions/nnpljppamoaalgkieeciijbcccohlpoh/1.0.0.0_0'
  const userDataDir = '/tmp/test-user-data-dir'
  if (browser === null) {
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      devtools: true,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    })
    browser = browserContext
  }

  // const browser = await chromium.launch({ headless: false })
  const page = await browser!.newPage()
  try {
    // const page = await browser.newPage()
    page.on('response', async (response) => {
      const candidate = await extractDocFromResponse(response)
      if (candidate === null) return

      docs.push(candidate)
    })

    await page.goto(target, { waitUntil: 'networkidle' })
    await waitForDestination(page)
  } catch (e) {
    console.error(e)
  } finally {
    // await browser.close()
    // await browserContext.close()
    // await page.close()
  }

  return docs
}

function createChains(docs: Doc[]): Node[] {
  let chain: Node[] = []

  for (let i = docs.length - 1; i > 0; i--) {
    const { url: preUrl, status, body, ip, port, headers } = docs[i - 1]
    const { url: curUrl } = docs[i]

    const isClientSideRedirected = status === 200
    const isServerSideRedirected = isThreeHundres(status)
    const redirectType = isServerSideRedirected
      ? serverSideRedirect(status)
      : clientSideRedirect(body)

    if (isClientSideRedirected) {
      const urlMatches = body.match(urlRegex())
      const replaceds = urlMatches?.map((ur) => ur.replace(/&amp;/g, '&'))
      const redirected = replaceds?.includes(curUrl)
      if (redirected)
        chain.push({
          url: preUrl,
          redirectTo: curUrl,
          redirectType,
          ip,
          port,
          status
        })
    }

    if (isServerSideRedirected) {
      const redirected = headers.location === curUrl
      if (redirected)
        chain.push({
          url: preUrl,
          redirectTo: curUrl,
          redirectType,
          ip,
          port,
          status
        })
    }
  }

  return chain.reverse()
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
!(async () => {
  while (true) {
    const res = await prompts({
      type: 'text',
      message: 'Type in first link address: ',
      name: 'target'
    })
    const target = res.target as string
    const docs = await filterDocumentRequests(target)
    const chains = createChains(docs)
    console.log(chains.map((x) => `${x.url}\n${x.redirectTo}\n\n`))

    const url = new URL(target)
    const fn = url.host + url.pathname
    writeFileSync(
      `./test-data/${fn.replace(/\//g, '-')}.json`,
      JSON.stringify({ docs, chains }, null, 2)
    )
  }
})()
