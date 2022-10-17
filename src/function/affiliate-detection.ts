import { BrowserContext, chromium, Page, Response } from 'playwright'
import urlRegex from 'url-regex'
import { load, xml } from 'cheerio'

import prompts from 'prompts'
import { writeFileSync } from 'fs'
import axios from 'axios'

type JavaScriptRedirectKeywords = 'href' | 'replace' | 'assign'
type JavaScriptRedirectTypes = `js-${JavaScriptRedirectKeywords}`

type UnknownTypes = 'unknown'
type ServerSideTypes = 'permanent' | 'temporary' | UnknownTypes
type ClientSideTypes = 'meta' | JavaScriptRedirectTypes | UnknownTypes
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

interface Ring {
  url: string
  candidates: string[]
  redirectType: PossibleTypes
  ip: string
  port: number
  status: number
}

interface Route {
  // id: string
  start: string
  documents: number
  destination: string
}

interface Redirect {
  // routeId: string
  url: string
  index: number
  status: number
  type: PossibleTypes
  positive: boolean
  ip: string
  port: number
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
const isThreeHundres = (n: number) => /30\d/.test(String(n))

const serverSideRedirect = (status: number): PossibleTypes => {
  if ([301, 308].includes(status)) return 'permanent'
  if ([302, 303, 307]) return 'temporary'
  return 'unknown'
}

const clientSideRedirect = (body: string): PossibleTypes => {
  const metaRefreshRex = new RegExp('http-equiv="refresh"', 'i')
  if (metaRefreshRex.test(body)) return 'meta'
  const jsRefresh = 'location'
  if (!body.includes(jsRefresh)) return 'unknown'

  if (body.includes('href')) return 'js-href'
  if (body.includes('assign')) return 'js-assign'
  if (body.includes('replace')) return 'js-replace'

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
    const $ = load(body)
    const head = $('head').html() || body
    doc.body = head
    doc.redirectType = 'client'
  } catch {
    // console.log(`[Parsing body failed] ${url}`)
    const res = await axios.get(url)
    // console.log(`Faillback request status: ${res.status}`)
    if (res.status === 200) doc.body = res.data
  } // sometimes body() fails
  return doc
}

const loadingAnimation = (
  text = '',
  chars = ['⠙', '⠘', '⠰', '⠴', '⠤', '⠦', '⠆', '⠃', '⠋', '⠉'],
  delay = 100
) => {
  let x = 0

  return setInterval(function () {
    const opt = `\r${chars[x++]} ${text}`
    process.stdout.write(opt)
    x = x % chars.length
  }, delay)
}

const waitForNoMeta = async (page: Page): Promise<void> => {
  return new Promise((resolve) => {
    const animInt = loadingAnimation(
      'Waiting for page navigation to resolve...'
    )
    const interval = setInterval(async () => {
      try {
        const metas = await page.$$eval('meta', (metas) =>
          metas.map((x) => x.getAttribute('http-equiv'))
        )
        const hasMeta = metas.includes('Refresh') || metas.includes('refresh') // TODO: create regex
        if (!hasMeta) {
          clearInterval(interval)
          clearInterval(animInt)
          resolve()
        }
      } catch {
        // page navigation destroys the page
        // console.error(e.message)
      }
    }, 300)
  })
}

/* = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = */
let browser: BrowserContext | null = null
async function filterDocumentRequests(
  target: string
): Promise<{ start: string; docs: Doc[]; destination: string }> {
  const docs: Doc[] = []

  const userDataDir = '/tmp/test-user-data-dir'
  if (browser === null) {
    const browserContext = await chromium.launchPersistentContext(userDataDir, {
      // headless: false
    })
    browserContext.route('**/*', (route, request) => {
      const ignores = [
        'stylesheet',
        'image',
        'media',
        'font',
        'script',
        'texttrack',
        'fetch',
        'eventsource',
        'websocket',
        'manifest',
        'other'
      ]
      if (ignores.includes(request.resourceType())) return route.abort()
      route.continue()
    })
    browserContext.setDefaultTimeout(1000 * 5)
    browser = browserContext
  }

  // const browser = await chromium.launch({ headless: false })
  const page = await browser!.newPage()
  const tmp: Response[] = []
  let url = page.url()
  try {
    // const page = await browser.newPage()
    page.on('response', async (response) => tmp.push(response))
    await page.goto(target)
    await waitForNoMeta(page)
    url = page.url()

    for (const it of tmp) {
      const candidate = await extractDocFromResponse(it)
      if (candidate) docs.push(candidate)
    }
  } catch (e) {
    console.error(e)
  } finally {
    // await browser.close()
    // await browserContext.close()
    // await page.close()
  }

  return {
    start: target,
    docs,
    destination: url
  }
}

function parseDocsToRings(docs: Doc[]): Ring[] {
  const rings: Ring[] = []
  for (let i = 0; i < docs.length; i++) {
    const { url, status, headers, body, ip, port } = docs[i]
    const isSSRidirect = isThreeHundres(status)

    if (isSSRidirect) {
      rings.push({
        url,
        candidates: headers.hasOwnProperty('location')
          ? [headers.location]
          : [],
        redirectType: serverSideRedirect(status),
        ip,
        port,
        status
      })
      continue
    }

    rings.push({
      url,
      candidates: body.match(urlRegex()),
      redirectType: clientSideRedirect(body),
      ip,
      port,
      status
    })
  }

  return rings
}

function createChain(
  start: string,
  rings: Ring[],
  destination: string
): { route: Route; redirects: Redirect[] } {
  const hasNoRedirects = start === destination
  if (hasNoRedirects)
    return {
      route: {
        start,
        destination,
        documents: 1
      },
      redirects: []
    }

  const redirects: Redirect[] = []

  for (let i = 0; i < rings.length; i++) {
    const hasNext = i + 1 < rings.length
    const cur = rings[i]
    const type = cur.redirectType
    const positive = hasNext ? cur.candidates.includes(rings[i + 1].url) : false

    delete cur.redirectType
    delete cur.candidates
    redirects.push({
      ...cur,
      index: i,
      type,
      positive
    })
  }

  return {
    route: {
      start,
      destination,
      documents: redirects.length
    },
    redirects
  }
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
    console.time('Background Check')
    const { start, docs, destination } = await filterDocumentRequests(target)
    const rings = parseDocsToRings(docs)
    const { route, redirects } = createChain(start, rings, destination)
    const sp = (x: string) => (x.length < 60 ? x : x.slice(0, 60) + '...')
    const tb = {
      start: sp(route.start),
      destination: sp(route.destination),
      'document num': route.documents
    }

    console.log('\n')
    console.table(tb)
    console.table(redirects.map((x) => ({ ...x, url: sp(x.url) })))
    console.timeEnd('Background Check')
    console.log('\n\n')

    const url = new URL(target)
    const fn = url.host + url.pathname
    writeFileSync(
      `./test-data/${fn.replace(/\//g, '-')}.json`,
      JSON.stringify({ docs, rings }, null, 2)
    )
  }
})()
